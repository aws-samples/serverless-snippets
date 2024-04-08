// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const fs = require('fs');
const path = require('path');

const Validator = require('jsonschema').Validator;
const v = new Validator();
const schema = require('./schema.json');
const { ValidationError } = require('jsonschema');

console.info(process.env);

const convertToFriendlyMessages = (errors) => {
  return errors.map((error) => {
    if (error.includes('.linkedin is of prohibited type [object Object]')) {
      return error.replace('.linkedin is of prohibited type [object Object]', '.linkedin. Please remove the URL in this property, only include the ID to your LinkedIn profile.');
    }

    return error;
  });
};

const buildErrors = (validationErrors) => {
  return validationErrors.map((error) => {
    return {
      path: error.property.replace(/instance\./g, ''),
      message: error.message.replace(/instance\./g, ''),
      data: error.instance,
      stack: error.stack.replace(/instance\./g, ''),
    };
  });
};

const addedFiles = process.env.ADDED_FILES ? process.env.ADDED_FILES.split(',') : [];
const modifiedFiles = process.env.MODIFIED_FILES ? process.env.MODIFIED_FILES.split(',') : [];

const findFile = (array, filename) => array.find((item) => item.includes(filename));

const pathToExamplePattern = findFile([...addedFiles, ...modifiedFiles], 'snippet-data.json');

// Run locally...
// const pathToExamplePattern = path.join('activemq-lambda', 'snippet-data.json');

const main = async () => {
  if (!pathToExamplePattern) {
    console.info('No snippet-data.json found, skipping any validation phase.');
    process.exit(0);
  }

  try {
    const examplePatternData = fs.readFileSync(path.join(__dirname, '../', pathToExamplePattern), {
      encoding: 'utf-8',
    });

    const parsedJSON = JSON.parse(examplePatternData);

    const result = v.validate(parsedJSON, schema);

    const mergedErrors = [...result.errors];

    console.log('Result errors', result.errors);

    if (mergedErrors.length > 0) {
      const errors = buildErrors(mergedErrors);

      const errorList = errors.map((error, index) => `${index + 1}. \`${error.path}\`: ${error.stack}\n`);

      const friendlyErrorMessages = convertToFriendlyMessages(errorList);

      console.log('friendlyErrorMessages', friendlyErrorMessages);
      console.info('Errors found: Added comments back to the pull request requesting changes');
      throw new Error('Failed to validate pattern, errors found');
    } else {
      console.info('Everything OK with pattern');
    }
  } catch (error) {
    console.info(error);
    throw Error('Failed to process the snippet-data.json file.');
  }
};

main();
