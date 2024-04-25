// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const main = async () => {
  const snippetName = process.argv[2];
  const title = process.argv[3];
  const description = process.argv[4];
  const detail = process.argv[5];
  const services = process.argv[6] || '';


  // empty the dir first..
  if(fs.existsSync(snippetName)){
    fs.rmdirSync(snippetName, { recursive: true })
  }

  // Create the folder
  fs.mkdirSync(snippetName);

  // Copy all files over
  fs.copyFileSync(path.join(__dirname, 'template', 'README.md'), path.join(snippetName, 'README.md'));
  fs.copyFileSync(path.join(__dirname, 'template', 'snippet-data.json'), path.join(snippetName, 'snippet-data.json'));
  fs.copyFileSync(path.join(__dirname, 'snippet.txt'), path.join(snippetName, 'snippet.txt'));

  let README = fs.readFileSync(path.join(snippetName, 'README.md'), { encoding: 'utf-8' });
  README = README.replace(/\[\[description\]\]/g, description);
  README = README.replace(/\[\[folder-name\]\]/g, snippetName);

  let data = fs.readFileSync(path.join(snippetName, 'snippet-data.json'), { encoding: 'utf-8' });
  data = data.replace(/\[\[title\]\]/g, title);
  data = data.replace(/\[\[description\]\]/g, description);
  data = data.replace(/\[\[snippet\]\]/g, snippetName);
  data = data.replace(/\[\[detail\]\]/g, detail);

  const serviceList = services.split(',').toString();
  data = data.replace(/\[\[services\]\]/g, serviceList);

  fs.writeFileSync(path.join(snippetName, 'README.md'), README);
  fs.writeFileSync(path.join(snippetName, 'snippet-data.json'), data);

  execSync(`node scripts/import-snippet.js ${snippetName} ../serverless-snippets/${snippetName}`, {
    cwd: '../serverless-land',
    stdio: 'inherit'
  })

};

main();
