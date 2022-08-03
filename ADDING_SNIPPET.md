# Adding a new snippet

Serverless Snippets has been designed to encourage the community to share reuseable code and tools which each other, allowing other developers to discover, find and share code snippets.

This short guide will walk you through how to add a new snippet, and the API for the snippet configuration files.



## Understanding Snippets and Types

Serverless Snippets currently supports `CloudWatch Logs Insights`, `Integration` and `Tools` snippet types, (although not limited to them), and you can design simple snippet pages, multi snippet pages or tabbed snippet pages.

### Simple Snippet Pages

![Single Snippet Example](/images/single-snippet.png)

Every snippet has the `snippet-data.json` file. This file is the heart of your snippet. If you want to add a simple snippet, you can do this by copying the `_snippet-model` folder, renaming it to your snippet and filling out the `README.md`, `snippet-data.json` and `snippet.txt` file.

You can use https://prismjs.com/#languages-list to pick your snippet language.


#### Example using snippet files
We recommened using snippet files to support multi line snippets.
```js
"snippets": [
    {
      "title": "Copy the code into CloudWatch Logs Insights",
      "snippetPath": "snippet.txt",
      "language": "js"
    }
  ],
```

#### Example without snippet files
```js
"snippets": [
    {
      "title": "Copy the code into CloudWatch Logs Insights",
      "code": "console.log('enter your code here')",
      "language": "js"
    }
  ],
```

### Multi Snippet Pages

![Multi Snippet Example](/images/multi-snippet.png)

Every Serverless Snippet page can support multiple snippets. Think of a step by step guide, or list of instructions. You can provide multiple snippets, and they will be rendered on the screen.

#### Example using multiple snippets
```js
"snippets": [
    {
      "title": "Install the package",
      "description": "First you will need to install the package to your application",
      "code": "npm install @aws-lambda-powertools/logger",
      "language": "bash"
    },
    {
      "title": "Example of using PowerTools Logger with TypeScript",
      "snippetPath": "powertools-typescript-example.ts",
      "language": "js"
    }
  ],
```

### Tabbed Snippets

![Tabbed Snippet Example](/images/tabbed-snippet.png)

Tabbed Snippets are a great way to provide multiple snippets in a tabbed context. For example you might want to use this to support multiple runtimes for your snippet (Node, Python, Java)

#### Example using tabbed snippets
```js
  "snippets": [
    {
      "title": "Runtimes",
      "codeTabs": [
        {
          "id": "Node",
          "title": "Usage Example with Node:",
          "description": "Consuming an S3 event with Lambda using JavaScript.",
          "snippets": [
            {
              "snippetPath": "example.js",
              "language": "js"
            }
          ]
        },
        {
          "id": "Python",
          "title": "Usage Example with Python:",
          "description": "Consuming an S3 event with Lambda using Python.",
          "snippets": [
            {
              "snippetPath": "example.py",
              "language": "py"
            }
          ]
        }
      ]
    }
  ],
```

---

## Snippet API

## Config

| Prop      | Type | Description |
| -----------| ----------- | ----------- |
| title      | string | Given title of your snippet       |
| description  | string | Description of your snippet        |
| type  | enum (CloudWatch Insights Logs \| Integration \| Tools) | Type of snippet
| service  | Array(string) | Array of AWS Services used in snippet (lowercase) |
| tags  | Array(string) | Array of tags used for filtering |
| languages  | Array(string) | Array of programming languages your snippet supports |
| introBox  | IntroBox | Text that is used on the snippet page, snippet description |
| gitHub  | GitHub | Add the repo url to the snippet, used as a link on serverlessland |
| snippets  | Snippet | Code that is rendered inside your snippet |
| authors  | Author | Information about you, links to twitter, linkedin, bio and name |


## Snippet

| Prop      | Type | Description |
| -----------| ----------- | ----------- |
| title      | string | Title that is rendered above your code example |
| description  | string | Description that is rendered above your code example |
| description  | string | Description that is rendered above your code example |
| snippetPath  | string (optional) | Path to your snippet/code file if you are using file for your snippet |
| code  | string (optional) | If not using `snippetPath` then you can include the code directly. Mainly used for simple code snippets (1 line)
| language  | string (optional) | Used to render your code with the correct language. If using cloudformation we recommened using the language `css` as it renders the best.
| codeTabs  | CodeTab (optional) | Use this field to render tabs in your snippet, you can use this to help you render and support multiple runtime code examples (For example) 

