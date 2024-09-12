// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package main

import (
	"encoding/base64"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event map[string]map[string][]map[string]string) {
	for key := range event["records"] {
		fmt.Println("Key:", key)
		for _, record := range event["records"][key] {
			fmt.Println("Record:", record)
			decodedBytes, _ := base64.StdEncoding.DecodeString(record["value"])
			msg := string(decodedBytes)
			fmt.Println("Message:", msg)
		}
	}
}

func main() {
	lambda.Start(handler)
}