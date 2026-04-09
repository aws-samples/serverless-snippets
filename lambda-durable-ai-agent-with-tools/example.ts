import {
  type DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import {
  BedrockRuntimeClient,
  type ContentBlock,
  ConverseCommand,
  type Message,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID = "us.amazon.nova-pro-v1:0";
const bedrock = new BedrockRuntimeClient({});

type AgentTool = {
  toolSpec: NonNullable<Tool["toolSpec"]>;
  execute: (input: Record<string, string>, context: DurableContext) => Promise<string>;
};

const tools: AgentTool[] = [
  {
    toolSpec: {
      name: "get_weather",
      description: "Get the current weather for a location.",
      inputSchema: {
        json: {
          type: "object",
          properties: { location: { type: "string" } },
          required: ["location"],
        },
      },
    },
    execute: async (input) => `The weather in ${input.location} is sunny, 72°F.`,
  },
  {
    toolSpec: {
      name: "wait_for_human_review",
      description: "Request human review and wait for response.",
      inputSchema: {
        json: {
          type: "object",
          properties: { question: { type: "string" } },
          required: ["question"],
        },
      },
    },
    execute: async (input, context) =>
      context.waitForCallback<string>("human_review", async (callbackId) => {
        console.log(`Review needed: ${input.question}`);
      }),
  },
];

export const handler = withDurableExecution(
  async (event: { prompt?: string }, context: DurableContext) => {
    const prompt = event.prompt ?? "What's the weather in Seattle?";
    const messages: Message[] = [{ role: "user", content: [{ text: prompt }] }];
    const toolsByName = Object.fromEntries(tools.map((t) => [t.toolSpec.name, t]));

    while (true) {
      const response = await context.step("converse", async () => {
        return bedrock.send(
          new ConverseCommand({
            modelId: MODEL_ID,
            messages,
            toolConfig: { tools: tools.map((t) => ({ toolSpec: t.toolSpec })) },
          })
        );
      });

      const output = response.output!.message!;
      messages.push(output);

      if (response.stopReason === "end_turn") {
        const textBlock = output.content?.find((b): b is ContentBlock.TextMember => "text" in b);
        return textBlock?.text ?? "";
      }

      const toolResults: ContentBlock[] = [];
      for (const block of output.content ?? []) {
        if ("toolUse" in block && block.toolUse) {
          const { toolUseId, name, input } = block.toolUse;
          const tool = toolsByName[name!];
          const result = await context.runInChildContext(`tool:${name}`, async (childContext) => {
            return tool.execute(input as Record<string, string>, childContext);
          });
          toolResults.push({ toolResult: { toolUseId, content: [{ text: result }] } });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }
  }
);
