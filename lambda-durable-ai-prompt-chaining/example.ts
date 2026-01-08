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

export const handler = withDurableExecution(
  async (event: { topic?: string }, context: DurableContext) => {
    const topic = event.topic ?? "programming";

    const joke = await context.step("generate joke", async () => {
      return await converse(MODEL_ID, `Make a joke about ${topic}`);
    });

    const review = await context.step("review joke", async () => {
      return await converse(MODEL_ID, `Rate this joke 1-10 and explain why: "${joke}"`);
    });

    return { joke, review };
  }
);
