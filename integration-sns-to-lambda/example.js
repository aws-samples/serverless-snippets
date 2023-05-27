exports.handler = async (event, context) => {
  try {
    const message = JSON.stringify(event.Records[0].Sns.Message);
    console.log(message);
  } catch (err) {
    console.error(`An error occurred - ${err}`);
    throw err;
  }
};
