import boto3
from aws_durable_execution_sdk_python import DurableContext, durable_execution

MODEL_ID = "us.amazon.nova-lite-v1:0"
bedrock = boto3.client("bedrock-runtime")


def converse(model_id: str, prompt: str) -> str:
    response = bedrock.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )
    return response["output"]["message"]["content"][0]["text"]


@durable_execution
def handler(event: dict, context: DurableContext):
    topic = event.get("topic", "programming")

    joke = context.step(
        lambda _: converse(MODEL_ID, f"Make a joke about {topic}"),
        "generate joke",
    )

    review = context.step(
        lambda _: converse(MODEL_ID, f'Rate this joke 1-10 and explain why: "{joke}"'),
        "review joke",
    )

    return {"joke": joke, "review": review}
