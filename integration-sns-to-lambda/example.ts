import { SNSEvent, Context, SNSHandler } from 'aws-lambda';

 export const functionHandler : SNSHandler = async (event: SNSEvent, context: Context) : Promise<void> => {
        try {
            const message : string = JSON.stringify(event.Records[0].Sns.Message);
            console.log(message);
        } catch (err) {
            const errorMessage : string = `An error occurred - ${err}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
 };
