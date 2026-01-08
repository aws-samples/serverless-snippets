import json

import boto3
from aws_durable_execution_sdk_python import DurableContext, durable_execution
from aws_durable_execution_sdk_python.config import Duration, WaitForCallbackConfig
from pydantic import BaseModel

MODEL_ID = "us.amazon.nova-pro-v1:0"
bedrock = boto3.client("bedrock-runtime")


def converse(model_id: str, prompt: str) -> str:
    response = bedrock.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )
    return response["output"]["message"]["content"][0]["text"]


class ReviewResult(BaseModel):
    approved: bool
    notes: str | None = None


def send_for_review(callback_id: str, document: str, extracted_fields: str):
    print(f"Review needed for document. Callback ID: {callback_id}")
    print(f"Extracted fields: {extracted_fields}")


@durable_execution
def handler(event: dict, context: DurableContext):
    document = event.get("document", "Sample invoice with amount $1,234.56")

    extracted_fields = context.step(
        lambda _: converse(
            MODEL_ID,
            f'Extract key fields from this document as JSON: "{document}"',
        ),
        "extract fields",
    )

    review_result_str = context.wait_for_callback(
        lambda callback_id, _: send_for_review(callback_id, document, extracted_fields),
        "Await Human review",
        WaitForCallbackConfig(timeout=Duration.from_days(7)),
    )

    review_result = ReviewResult(**json.loads(review_result_str))

    if not review_result.approved:
        return {
            "status": "rejected",
            "notes": review_result.notes,
            "extractedFields": extracted_fields,
        }

    return {"status": "approved", "extractedFields": extracted_fields}
