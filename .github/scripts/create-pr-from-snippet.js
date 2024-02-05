module.exports = async ({ github, context, core }) => {
  console.log('process.env.DATA_PATH', process.env.DATA_PATH);
  console.log('process.env.DATA', process.env.DATA);

  const issueNumber = process.env.ISSUE_NUMBER;

  if (!issueNumber) {
    core.setFailed(`No issue number was passed. Aborting`);
  }

  const response = await github.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
  });

  const issueBody = response.data.body;
  console.log(response);
  console.log(issueBody);

  //   const prNumber = process.env.PR_NUMBER;

  //   if (prNumber === '') {
  //     core.setFailed(`No PR number was passed. Aborting`);
  //   }

  //   try {
  //     const {
  //       data: { head, base, user, ...rest },
  //     } = await github.rest.pulls.get({
  //       owner: context.repo.owner,
  //       repo: context.repo.repo,
  //       pull_number: prNumber,
  //     });

  //     const { data: fileData } = await github.rest.pulls.listFiles({
  //       owner: context.repo.owner,
  //       repo: context.repo.repo,
  //       pull_number: prNumber,
  //     });

  //     const allChangedFiles = fileData.map((file) => file.filename);

  //     core.setOutput('files', allChangedFiles.toString());

  //     core.setOutput('headRef', head.ref);
  //     core.setOutput('headSHA', head.sha);
  //     core.setOutput('baseRef', base.ref);
  //     core.setOutput('baseSHA', base.sha);
  //     core.setOutput('user', user.login);
  //   } catch (error) {
  //     core.setFailed(`Unable to retrieve info from PR number ${prNumber}.\n\n Error details: ${error}`);
  //     throw error;
  //   }
};
