import json
import re

from aws_durable_execution_sdk_python import DurableContext, durable_execution
from pydantic import BaseModel

from utils.converse import converse

MODEL_ID = "us.amazon.nova-lite-v1:0"


class ExtractedContact(BaseModel):
    name: str
    email: str
    company: str


def extract_contact(text: str) -> dict:
    raw = converse(
        MODEL_ID,
        f'Extract contact info as JSON with keys "name", "email", "company": {text}',
    )
    match = re.search(r"\{[^}]+\}", raw)
    if not match:
        raise ValueError("No JSON found in response")
    data = json.loads(match.group())
    return ExtractedContact(**data).model_dump()


@durable_execution
def handler(event: dict, context: DurableContext):
    text = event.get("text", "John Smith from Acme Corp, email: john@acme.com")
    return context.step(lambda _: extract_contact(text), "extract")
