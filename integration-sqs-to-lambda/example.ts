import { SQSEvent, Context, SQSHandler, SQSRecord } from 'aws-lambda';

export const functionHandler : SQSHandler = async (event: SQSEvent, context: Context) : Promise<string> => {
    for(const message of event.Records){
        await processMessageAsync(message);
    }
    return "done";
};

async function processMessageAsync(message: SQSRecord) : Promise<any> {
      console.log(`Processed message ${message.body}`);
      // TODO: Do interesting work based on the new message
      await Promise.resolve(1); //Placeholder for actual async work
    }