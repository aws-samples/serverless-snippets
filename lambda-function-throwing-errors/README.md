# Lambda function with % chance of throwing an error

This snippet creates a Lambda function in Node.js that has a percentage chance of throwing an error. The code uses a Lambda environment variable called CHANCE_OF_FAILURE, which is a value between 0 and 100. If this environment variable is not present, it defaults to 50 (a 50% chance of throwing an error). This function can be useful for testing failure modes and retry behaviors when consuming events from upstream services.

Learn more about this snippet at Serverless Land Snippets: << Add the live URL here >>

Important: this application could use various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

---

Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
