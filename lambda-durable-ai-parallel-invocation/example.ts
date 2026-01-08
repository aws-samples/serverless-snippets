import {
  type DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID = "us.amazon.nova-lite-v1:0";
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

const PROMPTS = [
  "Explain the benefits of",
  "Describe the challenges of",
  "Summarize the future of",
];

export const handler = withDurableExecution(
  async (event: { topic?: string }, context: DurableContext) => {
    const topic = event.topic ?? "artificial intelligence";

    const result = await context.map(
      "Get perspectives",
      PROMPTS,
      async (_, prompt) => ({
        prompt,
        response: await converse(MODEL_ID, `${prompt} ${topic}`),
      }),
      { itemNamer: (_, i) => `prompt-${i}` }
    );

    return { topic, perspectives: result.getResults() };
  }
);
