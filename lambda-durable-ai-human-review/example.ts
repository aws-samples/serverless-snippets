import {
  type DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import { z } from "zod";
import { converse } from "./utils/converse.js";

const MODEL_ID = "us.amazon.nova-pro-v1:0";

const ReviewResultSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
});

const sendForReview = (
  callbackId: string,
  document: string,
  extractedFields: string
) => {
  console.log(`Review needed for document. Callback ID: ${callbackId}`);
  console.log(`Extracted fields: ${extractedFields}`);
};

export const handler = withDurableExecution(
  async (event: { document?: string }, context: DurableContext) => {
    const document = event.document ?? "Sample invoice with amount $1,234.56";

    const extractedFields = await context.step("extract fields", async () =>
      converse(MODEL_ID, `Extract key fields from this document as JSON: "${document}"`)
    );

    const reviewResultStr = await context.waitForCallback<string>(
      "Await Human review",
      async (callbackId) => {
        sendForReview(callbackId, document, extractedFields);
      },
      { timeout: { days: 7 } }
    );

    const reviewResult = ReviewResultSchema.parse(JSON.parse(reviewResultStr));

    if (!reviewResult.approved) {
      return { status: "rejected", notes: reviewResult.notes, extractedFields };
    }

    return { status: "approved", extractedFields };
  }
);
