package main

import (
	"context"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-lambda-go/events"
	"fmt"
)

type DynamoDBEvent struct {
    Records []DynamoDBEventRecord `json:"Records"`
}

type DynamoDBEventRecord struct {
    AWSRegion      string                       `json:"awsRegion"`
    Change         DynamoDBStreamRecord         `json:"dynamodb"`
    EventID        string                       `json:"eventID"`
    EventName      string                       `json:"eventName"`
    EventSource    string                       `json:"eventSource"`
    EventVersion   string                       `json:"eventVersion"`
    EventSourceArn string                       `json:"eventSourceARN"`
    UserIdentity   *events.DynamoDBUserIdentity `json:"userIdentity,omitempty"`
}

type DynamoDBStreamRecord struct {
    ApproximateCreationDateTime events.SecondsEpochTime             `json:"ApproximateCreationDateTime,omitempty"`
    Keys                        map[string]*dynamodb.AttributeValue `json:"Keys,omitempty"`
    NewImage                    map[string]*dynamodb.AttributeValue `json:"NewImage,omitempty"`
    OldImage                    map[string]*dynamodb.AttributeValue `json:"OldImage,omitempty"`
    SequenceNumber              string                              `json:"SequenceNumber"`
    SizeBytes                   int64                               `json:"SizeBytes"`
    StreamViewType              string                              `json:"StreamViewType"`
}

func HandleRequest(ctx context.Context, event *DynamoDBEvent) (*string, error) {
	if event == nil {
		return nil, fmt.Errorf("received nil event")
	}

	for _, _record := range event.Records {
	 	LogDynamoDBRecord(_record)
	}

	message := fmt.Sprintf("Records processed: %d", len(event.Records))
	return &message, nil
}

func main() {
	lambda.Start(HandleRequest)
}

func LogDynamoDBRecord(record DynamoDBEventRecord){
	fmt.Println(record.EventID)
	fmt.Println(record.EventName)
	fmt.Sprint(record.Change)
}