package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, kinesisEvent events.KinesisEvent) (map[string]interface{}, error) {
	batchItemFailures := []map[string]interface{}{}

	for _, record := range kinesisEvent.Records {
		curRecordSequenceNumber := ""

		// Process your record
		if /* Your record processing condition here */ {
			curRecordSequenceNumber = record.Kinesis.SequenceNumber
		}

		// Add a condition to check if the record processing failed
		if curRecordSequenceNumber != "" {
			batchItemFailures = append(batchItemFailures, map[string]interface{}{"itemIdentifier": curRecordSequenceNumber})
		}
	}

	kinesisBatchResponse := map[string]interface{}{
		"batchItemFailures": batchItemFailures,
	}
	return kinesisBatchResponse, nil
}

func main() {
	lambda.Start(handler)
}
