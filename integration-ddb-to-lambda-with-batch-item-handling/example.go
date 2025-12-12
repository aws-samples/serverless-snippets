// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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

	for _, record := range event.Records {
		if err := processRecord(record); err != nil {
			batchItemFailures = append(batchItemFailures, BatchItemFailure{
				ItemIdentifier: record.Change.SequenceNumber,
			})
		}
	}

	return &BatchResult{BatchItemFailures: batchItemFailures}, nil
}

func processRecord(record events.DynamoDBEventRecord) error {
	// Your processing logic here
	return nil
}

func main() {
	lambda.Start(HandleRequest)
}
