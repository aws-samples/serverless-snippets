package main

import (
	"context"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/events"
	"fmt"
)

func HandleRequest(ctx context.Context, event events.DynamoDBEvent) (*string, error) {
	if len(event.Records) == 0 {
		return nil, fmt.Errorf("received empty event")
	}

	for _, record := range event.Records {
	 	LogDynamoDBRecord(record)
	}

	message := fmt.Sprintf("Records processed: %d", len(event.Records))
	return &message, nil
}

func main() {
	lambda.Start(HandleRequest)
}

func LogDynamoDBRecord(record events.DynamoDBEventRecord){
	fmt.Println(record.EventID)
	fmt.Println(record.EventName)
	fmt.Printf("%+v\n", record.Change)
}