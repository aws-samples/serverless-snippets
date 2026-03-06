"""Simple Lambda with external dependencies"""

import requests
from aws_lambda_powertools import Logger, Tracer

tracer = Tracer()
logger = Logger()


@tracer.capture_lambda_handler
@logger.inject_lambda_context
def handler(event, context):

    response = requests.get("https://www.google.com")
    logger.info(response.text)

    return {"statusCode": response.status_code, "body": "Hello from dependency Lambda!"}
