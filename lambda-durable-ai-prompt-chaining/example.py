from aws_durable_execution_sdk_python import DurableContext, durable_execution

from utils.converse import converse

MODEL_ID = "us.amazon.nova-lite-v1:0"


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
