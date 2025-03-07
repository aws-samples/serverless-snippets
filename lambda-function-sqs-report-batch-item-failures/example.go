// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, sqsEvent events.SQSEvent) (map[string]interface{}, error) {
	batchItemFailures := []map[string]interface{}{}

	for _, message := range sqsEvent.Records {
		if len(message.Body) > 0 {
			// Your message processing condition here
			fmt.Printf("Successfully processed message: %s\n", message.Body)
		} else {
			// Message processing failed
			fmt.Printf("Failed to process message %s\n", message.MessageId)
			batchItemFailures = append(batchItemFailures, map[string]interface{}{"itemIdentifier": message.MessageId})
		}
	}

	sqsBatchResponse := map[string]interface{}{
		"batchItemFailures": batchItemFailures,
	}
	return sqsBatchResponse, nil
}

func main() {
	lambda.Start(handler)
}
