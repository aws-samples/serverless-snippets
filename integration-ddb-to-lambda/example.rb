# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

def lambda_handler(event:, context:)
    return 'received empty event' if event['Records'].empty?
  
    event['Records'].each do |record|
      log_dynamodb_record(record)
    end
  
    "Records processed: #{event['Records'].length}"
  end
  
  def log_dynamodb_record(record)
    puts record['eventID']
    puts record['eventName']
  end
  