package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, kinesisEvent events.KinesisEvent) error {
	if len(kinesisEvent.Records) == 0 {
		log.Printf("empty Kinesis event received")
		return nil
	}

	for _, record := range kinesisEvent.Records {
		log.Printf("processed Kinesis event with EventId: %v", record.EventID)
		recordDataBytes := record.Kinesis.Data
		recordDataText := string(recordDataBytes)
		log.Printf("record data: %v", recordDataText)
		// TODO: Do interesting work based on the new data
	}
	log.Printf("successfully processed %v records", len(kinesisEvent.Records))
	return nil
}

func main() {
	lambda.Start(handler)
}
