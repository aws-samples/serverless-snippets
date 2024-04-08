// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const batchItemFailures: { ItemIdentifier: string }[] = [];

    for (const record of event.Records) {
        try {
            await processMessageAsync(record, context);
        } catch (error) {
            batchItemFailures.push({ ItemIdentifier: record.messageId });
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ batchItemFailures }),
    };
};

async function processMessageAsync(record: any, context: Context): Promise<void> {
    if (!record.body) {
        throw new Error('No Body in SQS Message.');
    }
    context.log(`Processed message ${record.body}`);
}
