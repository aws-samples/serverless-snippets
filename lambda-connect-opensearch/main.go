package main

import (
	"context"
	"crypto/tls"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	opensearchapi "github.com/opensearch-project/opensearch-go/opensearchapi"
	opensearch "github.com/opensearch-project/opensearch-go/v2"
	requestsigner "github.com/opensearch-project/opensearch-go/v2/signer/awsv2"
)

const endpoint = os.Getenv("OpensearchDomain") // e.g. https://opensearch-domain.region.com or Amazon OpenSearch Serverless endpoint

func HandleRequest(ctx context.Context) error {
	// Load the default AWS configuration
	awsCfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Println("Error loading AWS configuration:", err)
		return err
	}
	// Create an AWS request signer
	signer, err := requestsigner.NewSignerWithService(awsCfg, "aoss")
	if err != nil {
		log.Println("Error creating request signer:", err)
		return err
	}
	// Create an OpenSearch client
	client, err := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Addresses: []string{endpoint},
		Signer:    signer,
	})
	if err != nil {
		log.Println("Error creating OpenSearch client:", err)
		return err
	}
	indexName := "go-test-index"
	// Define index mapping
	mapping := strings.NewReader(`{
        "settings": {
            "index": {
                "number_of_shards": 4
            }
        }
    }`)
	// Create an index
	createIndex := opensearchapi.IndicesCreateRequest{
		Index: indexName,
		Body:  mapping,
	}
	createIndexResponse, err := createIndex.Do(ctx, client)
	if err != nil {
		log.Println("Error creating index:", err)
		return err
	}
	log.Println("Create index response:", createIndexResponse)

	// Delete the index
	deleteIndex := opensearchapi.IndicesDeleteRequest{
		Index: []string{indexName},
	}
	deleteIndexResponse, err := deleteIndex.Do(ctx, client)
	if err != nil {
		log.Println("Error deleting index:", err)
		return err
	}
	log.Println("Delete index response:", deleteIndexResponse)
	return nil
}
func main() {
	// Start the Lambda function
	lambda.Start(HandleRequest)
}
