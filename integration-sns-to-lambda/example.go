package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, snsEvent events.SNSEvent) {
	for _, record := range snsEvent.Records {
		processMessage(record)
	}
	fmt.Println("done")
}

func processMessage(record events.SNSEventRecord) {
	message := record.SNS.Message
	fmt.Printf("Processed message: %s\n", message)
	// TODO: Process your record here
}

func main() {
	lambda.Start(handler)
}
