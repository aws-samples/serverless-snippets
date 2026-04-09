import {
  BatchProcessor,
  EventType,
  processPartialResponse,
} from "@aws-lambda-powertools/batch";
import { Logger } from "@aws-lambda-powertools/logger";

const processor = new BatchProcessor(EventType.DynamoDBStreams);
const logger = new Logger();

const recordHandler = async (record) => {
  if (record.dynamodb?.NewImage) {
    logger.info("Processing record", { record: record.dynamodb.NewImage });
    const message = record.dynamodb.NewImage.Message.S;
    if (message) {
      const payload = JSON.parse(message);
      logger.info("Processed item", { item: payload });
    }
  }
};

export const handler = async (event, context) =>
  processPartialResponse(event, recordHandler, processor, {
    context,
  });
