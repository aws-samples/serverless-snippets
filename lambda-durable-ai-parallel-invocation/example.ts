import {
  type DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import { converse } from "./utils/converse.js";

const MODEL_ID = "us.amazon.nova-lite-v1:0";

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
