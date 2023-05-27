exports.handler = async (event, context) => {
  for (const message of event.Records) {
    await processMessageAsync(message);
  }
  return "done";
};

async function processMessageAsync(message) {
  console.log(`Processed message ${message.body}`);
  // TODO: Do interesting work based on the new message
  await Promise.resolve(1); //Placeholder for actual async work
}
