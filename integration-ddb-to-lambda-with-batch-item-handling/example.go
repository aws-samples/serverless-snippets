package main

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type BatchItemFailure struct {
	ItemIdentifier string `json:"ItemIdentifier"`
}

type BatchResult struct {
	BatchItemFailures []BatchItemFailure `json:"BatchItemFailures"`
}

func HandleRequest(ctx context.Context, event events.DynamoDBEvent) (*BatchResult, error) {
	var batchItemFailures []BatchItemFailure
	curRecordSequenceNumber := ""

	for _, record := range event.Records {
		// Process your record
		curRecordSequenceNumber = record.Change.SequenceNumber
	}

	if curRecordSequenceNumber != "" {
		batchItemFailures = append(batchItemFailures, BatchItemFailure{ItemIdentifier: curRecordSequenceNumber})
	}
	
	batchResult := BatchResult{
		BatchItemFailures: batchItemFailures,
	}

	return &batchResult, nil
}

func main() {
	lambda.Start(HandleRequest)
}
