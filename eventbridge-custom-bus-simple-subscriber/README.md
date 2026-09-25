# Subscribe to a Custom Event Bus

Create the simplest EventBridge custom event bus subscriber, then publish a test event to it.

Learn more about this snippet at Serverless Land Snippets: https://serverlessland.com/snippets/eventbridge-custom-bus-simple-subscriber

Important: this application could use various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## How it works

A subscriber on an Amazon EventBridge custom event bus watches one bus and delivers events to a single target.

1. Create the subscriber: with no filter configuration it receives every event on the bus, and with the default RAW transform it delivers the payload to the target unchanged.
2. Publish a test event with `put-raw-events`. The `Data` field is the payload the subscriber receives, passed base64-encoded, and `SystemMetadata.ContentType` is required.

A successful publish only means the bus stored the event, so confirm delivery at the target queue and check the subscriber `State` is `RUNNING`. To filter events, add retries and a dead-letter queue, or transform the payload, see the `eventbridge-custom-bus-advaced-subscriber` snippet.

See [Subscribing to events on a custom event bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus-subscribers.html) for full details.

## Cleanup

Delete the subscriber you created with `aws eventsv2 delete-subscriber --subscriber-arn <SUBSCRIBER_ARN>`.

---

Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
