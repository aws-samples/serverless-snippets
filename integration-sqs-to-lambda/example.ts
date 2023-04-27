import { SQSEvent, Context, SQSHandler, SQSBatchResponse, SQSBatchItemFailure, SQSRecord } from 'aws-lambda';

 export const functionHandler : SQSHandler = async (event: SQSEvent, context: Context) : Promise<SQSBatchResponse> => {
    const batchItemFailures : SQSBatchItemFailure[] = [];
    if (event.Records.length == 0){
        console.log('Empty SQS Event received');
        return { batchItemFailures };
    }

    for(const message of event.Records){
        const result = await processMessageAsync(message);
        if(result !== null){
            batchItemFailures.push(result);
        }
    }
    return { batchItemFailures };
 };

async function processMessageAsync(message: SQSRecord) : Promise<SQSBatchItemFailure | null> {
    try {
            console.log(`Processed message ${message.body}`);
            // TODO: Do interesting work based on the new message
            await Promise.resolve(1); //Placeholder for actual async work
            return null;
        } catch (err) {
            console.error(`An error occurred while processing ${message} - Error: ${err.message}`);
            return { itemIdentifier: message.messageId };
        }
    }