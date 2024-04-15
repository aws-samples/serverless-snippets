// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
use aws_lambda_events::event::dynamodb::{Event, EventRecord};
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use serde_json::{json, Value};

/// Process your record
fn process_record(record: &EventRecord) -> Result<(), ()> {
    // <--- Your record processing logic goes here and returns a Result --->
    match true {
        true => Ok(()),
        _ => Err(()),
    }
}

/// Main Lambda handler here...
async fn handler(event: LambdaEvent<Event>) -> Result<Value, Value> {
    let mut cur_record_sequence_number: String = String::from("");
    let records = &event.payload.records;
    let result = records.iter().try_for_each(|record| {
        // Process your record here...
        if let Some(seq) = &record.change.sequence_number {
            cur_record_sequence_number = seq.clone();
            process_record(record)

        // No Sequence number in record
        } else {
            Err(())
        }
    });
    if result.is_err() {
        return Ok(json!({"batchItemFailures": [{"itemIdentifier": cur_record_sequence_number}]}));
    }
    Ok(json!({"batchItemFailures": []}))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
