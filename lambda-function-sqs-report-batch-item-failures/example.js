exports.handler = async (event, context) => {

    const batchItemFailures = [];

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

async function processMessageAsync(record, context) {
    if (!record.body) {
        throw new Error('No Body in SQS Message.');
    }
    context.log(`Processed message ${record.body}`);
}
