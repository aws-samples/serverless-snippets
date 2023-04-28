import { KinesisStreamEvent, Context, KinesisStreamHandler, KinesisStreamRecordPayload } from 'aws-lambda';
import { Buffer } from 'buffer';

export const functionHandler : KinesisStreamHandler = async (event: KinesisStreamEvent, context: Context) : Promise<void> => {
    for(const record of event.Records){
        try {
            console.log(`Processed Kinesis Event - EventID: ${record.eventID}`);
            const recordData = await getRecordDataAsync(record.kinesis);
            console.log(`Record Data: ${recordData}`);
            // TODO: Do interesting work based on the new data
        } catch (err) {
            console.error(`An error occurred ${err}`);
            throw err;
        }
        console.log(`Successfully processed ${event.Records.length} records.`);
    }
};

async function getRecordDataAsync(payload: KinesisStreamRecordPayload) : Promise<string> {
        var data = Buffer.from(payload.data, 'base64').toString('utf-8');
        await Promise.resolve(1); //Placeholder for actual async work
        return data;
    }