// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Amazon DocumentDB change-stream event types.
//
// Note: These types are NOT provided by the '@types/aws-lambda' package, so
// they are defined here to match the event payload Lambda delivers from an
// Amazon DocumentDB change stream. See the "Example Amazon DocumentDB event"
// in the AWS docs:
// https://docs.aws.amazon.com/lambda/latest/dg/with-documentdb.html
// The inner `event` follows the MongoDB change event shape:
// https://www.mongodb.com/docs/manual/reference/change-events/

interface DocumentDBEventNamespace {
  db: string;
  coll: string;
}

interface DocumentDBChangeEvent {
  _id: Record<string, unknown>;
  clusterTime?: {
    $timestamp: {
      t: number;
      i: number;
    };
  };
  documentKey?: Record<string, unknown>;
  fullDocument?: Record<string, unknown>;
  ns: DocumentDBEventNamespace;
  operationType: string;
}

interface DocumentDBEventRecord {
  event: DocumentDBChangeEvent;
}

interface DocumentDBEventSubscriptionContext {
  eventSourceArn: string;
  events: DocumentDBEventRecord[];
  eventSource: string;
}

console.log('Loading function');

export const handler = async (
  event: DocumentDBEventSubscriptionContext,
  context: any
): Promise<string> => {
  event.events.forEach((record: DocumentDBEventRecord) => {
    logDocumentDBEvent(record);
  });
  return 'OK';
};

const logDocumentDBEvent = (record: DocumentDBEventRecord): void => {
  console.log('Operation type: ' + record.event.operationType);
  console.log('db: ' + record.event.ns.db);
  console.log('collection: ' + record.event.ns.coll);
  console.log('Full document:', JSON.stringify(record.event.fullDocument, null, 2));
};
