# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""Simple Lambda without external dependencies"""

from aws_lambda_powertools import Logger, Tracer

tracer = Tracer()
logger = Logger()


@tracer.capture_lambda_handler
@logger.inject_lambda_context
def handler(event, context):
    return {"statusCode": 200, "body": "Hello from simple Lambda!"}
