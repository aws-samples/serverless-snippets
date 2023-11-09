package integration_sqs_to_lambda

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.SQSEvent) error {
	for _, record := range event.Records {
		err := processMessage(record)
		if err != nil {
			return err
		}
	}
	fmt.Println("done")
	return nil
}

func processMessage(record events.SQSMessage) error {
	fmt.Printf("Processed message %s\n", record.Body)
	// TODO: Do interesting work based on the new message
	return nil
}

func main() {
	lambda.Start(handler)
}
