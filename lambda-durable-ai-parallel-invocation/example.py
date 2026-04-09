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

PROMPTS = [
    "Explain the benefits of",
    "Describe the challenges of",
    "Summarize the future of",
]


@durable_execution
def handler(event: dict, context: DurableContext):
    topic = event.get("topic", "artificial intelligence")

    result = context.map(
        PROMPTS,
        lambda ctx, prompt, idx, items: {
            "prompt": prompt,
            "response": converse(MODEL_ID, f"{prompt} {topic}"),
        },
        "Get perspectives",
    )

    return {"topic": topic, "perspectives": result.get_results()}
