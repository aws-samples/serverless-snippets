from typing import Any, Callable

import boto3
from aws_durable_execution_sdk_python import DurableContext, durable_execution

MODEL_ID = "us.amazon.nova-pro-v1:0"
bedrock = boto3.client("bedrock-runtime")


class AgentTool:
    def __init__(self, tool_spec: dict, execute: Callable[[dict, DurableContext], str]):
        self.tool_spec = tool_spec
        self.execute = execute


TOOLS: list[AgentTool] = [
    AgentTool(
        tool_spec={
            "name": "get_weather",
            "description": "Get the current weather for a location.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {"location": {"type": "string"}},
                    "required": ["location"],
                }
            },
        },
        execute=lambda input, ctx: f"The weather in {input.get('location', 'unknown')} is sunny, 72°F.",
    ),
    AgentTool(
        tool_spec={
            "name": "wait_for_human_review",
            "description": "Request human review and wait for response.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {"question": {"type": "string"}},
                    "required": ["question"],
                }
            },
        },
        execute=lambda input, ctx: ctx.wait_for_callback(
            lambda callback_id, _: print(f"Review needed: {input.get('question')}"),
            "human_review",
        ),
    ),
]


@durable_execution
def handler(event: dict, context: DurableContext):
    prompt = event.get("prompt", "What's the weather in Seattle?")
    messages: list[Any] = [{"role": "user", "content": [{"text": prompt}]}]
    tools_by_name = {t.tool_spec["name"]: t for t in TOOLS}

    while True:
        response = context.step(
            lambda _: bedrock.converse(
                modelId=MODEL_ID,
                messages=messages,
                toolConfig={"tools": [{"toolSpec": t.tool_spec} for t in TOOLS]},
            ),
            "converse",
        )

        output = response.get("output", {}).get("message", {})
        messages.append(output)

        if response.get("stopReason") == "end_turn":
            for block in output.get("content", []):
                if "text" in block:
                    return block["text"]
            return ""

        tool_results = []
        for block in output.get("content", []):
            if "toolUse" in block:
                tool_use = block["toolUse"]
                tool = tools_by_name[tool_use["name"]]
                result = context.run_in_child_context(
                    lambda child_ctx: tool.execute(tool_use.get("input", {}), child_ctx),
                    f"tool:{tool_use['name']}",
                )
                tool_results.append({
                    "toolResult": {
                        "toolUseId": tool_use["toolUseId"],
                        "content": [{"text": result}],
                    }
                })

        messages.append({"role": "user", "content": tool_results})
