import {
  type DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODELS = ["us.amazon.nova-lite-v1:0", "us.amazon.nova-pro-v1:0"];
const bedrock = new BedrockRuntimeClient({});

async function converse(modelId: string, prompt: string): Promise<string> {
  const response = await bedrock.send(
    new ConverseCommand({
      modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
    }),
  );
  return response.output?.message?.content?.[0].text ?? "";
}

export const handler = withDurableExecution(
  async (event: { question?: string }, context: DurableContext) => {
    const question =
      event.question ?? "Write a 100 word summary on the great fire of London";

    const result = await context.map(
      "Get candidate answers",
      MODELS,
      async (_, modelId) => ({
        modelId,
        answer: await converse(modelId, question),
      }),
      { itemNamer: (item) => `candidate-${item}` }
    );

    const candidates = result.getResults();

    const judgment = await context.step("judge", async () => {
      const prompt = `Question: "${question}"

Responses:
${candidates.map((r, i) => `${i + 1}. (Model: ${r.modelId}) ${r.answer}`).join("\n")}

Which response is best? Reply with JSON: {"bestIndex": <1-based index>, "reasoning": "<why>"}`;

      const response = await converse(MODELS[0], prompt);
      const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      const bestIndex = (parsed.bestIndex ?? 1) - 1;
      const best = candidates[bestIndex] ?? candidates[0];

      return {
        bestAnswer: best.answer,
        reasoning: parsed.reasoning ?? "",
        sourceModel: best.modelId,
      };
    });

    return { question, ...judgment };
  }
);
