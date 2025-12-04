import json
import re

from aws_durable_execution_sdk_python import DurableContext, durable_execution

from utils.converse import converse

MODELS = ["us.amazon.nova-lite-v1:0", "us.amazon.nova-pro-v1:0"]


@durable_execution
def handler(event: dict, context: DurableContext):
    question = event.get(
        "question", "Write a 100 word summary on the great fire of London"
    )

    result = context.map(
        MODELS,
        lambda ctx, model_id, idx, items: {
            "modelId": model_id,
            "answer": converse(model_id, question),
        },
        "Get candidate answers",
    )

    candidates = result.get_results()

    def judge(_):
        responses = "\n".join(
            f"{i + 1}. (Model: {c['modelId']}) {c['answer']}"
            for i, c in enumerate(candidates)
        )
        prompt = f'''Question: "{question}"

Responses:
{responses}

Which response is best? Reply with JSON: {{"bestIndex": <1-based index>, "reasoning": "<why>"}}'''

        response = converse(MODELS[0], prompt)
        match = re.search(r"\{[\s\S]*\}", response)
        parsed = json.loads(match.group(0)) if match else {}
        best_index = (parsed.get("bestIndex", 1)) - 1
        best = candidates[best_index] if 0 <= best_index < len(candidates) else candidates[0]

        return {
            "bestAnswer": best["answer"],
            "reasoning": parsed.get("reasoning", ""),
            "sourceModel": best["modelId"],
        }

    judgment = context.step(judge, "judge")

    return {"question": question, **judgment}
