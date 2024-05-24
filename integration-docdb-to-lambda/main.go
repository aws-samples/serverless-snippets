// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Events []Record `json:"events"`
}

type Record struct {
	Event struct {
		OperationType string `json:"operationType"`
		NS            struct {
			DB   string `json:"db"`
			Coll string `json:"coll"`
		} `json:"ns"`
		FullDocument interface{} `json:"fullDocument"`
	} `json:"event"`
}

func main() {
	lambda.Start(handler)
}

func handler(ctx context.Context, event Event) (string, error) {
	fmt.Println("Loading function")
	for _, record := range event.Events {
		logDocumentDBEvent(record)
	}

	return "OK", nil
}

func logDocumentDBEvent(record Record) {
	fmt.Printf("Operation type: %s\n", record.Event.OperationType)
	fmt.Printf("db: %s\n", record.Event.NS.DB)
	fmt.Printf("collection: %s\n", record.Event.NS.Coll)
	docBytes, _ := json.MarshalIndent(record.Event.FullDocument, "", "  ")
	fmt.Printf("Full document: %s\n", string(docBytes))
}
