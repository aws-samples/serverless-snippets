# Advanced Custom Event Bus Subscriber Configuration

Create three EventBridge custom event bus subscribers, each using more of the features a subscriber supports: filter, then retry and dead-letter queue, then a JSONata transform.

Learn more about this snippet at Serverless Land Snippets: https://serverlessland.com/snippets/eventbridge-custom-bus-advaced-subscriber

Important: this application could use various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## How it works

Each block creates a separate `aws eventsv2 create-subscriber`, using more of the features a subscriber supports than the one before:

1. Subscriber 1 (orders-basic): a DATA-scoped filter only, delivering events whose `detail.status` equals `PLACED`.
2. Subscriber 2 (orders-resilient): adds `--retry-policy` (retries failed deliveries; 10 attempts within 3600 seconds in the example, defaults 5 within 300) and `--on-failure-configuration` (sends events that exhaust their retries to an SQS dead-letter queue).
3. Subscriber 3 (orders-full): adds `--transformer` with `Type` JSONATA to reshape the payload before delivery, using the event available as `$events` inside `{% %}` delimiters.

The three subscribers use three different comparison operators (equals, numeric range, and `$or`). A final block lists five reusable DATA-scoped filter values covering more operators (numeric range, anything-but, prefix, exists, and `$or`), which you can swap into any subscriber's `--filter-configuration`. See [Comparison operators for event patterns](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-pattern-operators.html).

The delivery role needs `sqs:SendMessage` on both the target and the dead-letter queue. The target, delivery role, and dead-letter queue must belong to the account creating the subscriber.

See [Subscribing to events on a custom event bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus-subscribers.html) for full details.

## Cleanup

Delete the subscribers you created with `aws eventsv2 delete-subscriber --subscriber-arn <SUBSCRIBER_ARN>`.

---

Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
