# How to Publish a Serverless Snippet on [ServerlessLand](https://serverlessland.com/)

To submit a new serverless snippet, or to make changes to existing code, follow the instructions below.

## Repo Names

* **local:** Your local copy of the forked repository.
* **origin:** Your forked, remote copy of the original repository.
* **upstream:** The original, remote serverless-snippets repository.

## Initial Setup

[Fork and Clone](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the serverless-snippets repo.

1. Fork the original serverless-snippets repo to create a copy of the repo in your own GitHub account: https://github.com/aws-samples/serverless-snippets
1. Clone your copy of the repo to download it locally: `git clone https://github.com/{your-github-username}/serverless-snippets.git`
1. Change into the new local directory: `cd serverless-snippets`
1. Add the original serverless-snippets repo as another remote repo called "upstream": `git remote add upstream https://github.com/aws-samples/serverless-snippets`
1. For verification, display the remote repos: `git remote -v`

    The output should look like this:

    ```
	origin  https://github.com/{your-github-username}/serverless-snippets.git (fetch)
	origin  https://github.com/{your-github-username}/serverless-snippets.git (push)
	upstream        https://github.com/aws-samples/serverless-snippets (fetch)
	upstream        https://github.com/aws-samples/serverless-snippets (push)
	```

## Create Branch

Create a new local branch for each serverless snippet or modification being made. This allows you to create separate pull requests in the upstream repo.

1. Create and checkout a new local branch before making code changes: `git checkout -b {branch-name}`
    
    Branch name syntax: `{username}-{feature|fix}-{description}`
    
    Example branch name: `myusername-feature-lambda-aurora-serverless`

1. For verification, display all branches: `git branch -a`

    The output should look like this:

    ```
    * {branch-name}
    main
    remotes/origin/HEAD → origin/main
    remotes/origin/main
    ```

## Your Code

Now is the time to create your new serverless snippet or modify existing code.

1. If you are creating a new serverless snippet, copy the folder named "_snippet-model" to start with a template: `cp -r _snippet-model {new-folder-name}`
1. If you are modifying existing code, make your code changes now.
1. When your code is complete, stage the changes to your local branch: `git add .`
1. Commit the changes to your local branch: `git commit -m 'Comment here'`

## Pull Request

Push your code to the remote repos and [create a pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

1. Push the local branch to the remote origin repo: `git push origin {branch-name}`

    If this is the first push to the remote origin repo, you will be asked to Connect to GitHub to authorize the connection. Sometimes the pop-up window appears behind other windows.

1. Go to the [upstream repo](https://github.com/aws-samples/serverless-snippets) in Github and click "Compare & pull request".
    1. Enter an appropriate title:
        
        Example title: `New serverless snippet - lambda-aurora-serverless`

    1. Add a description of the changes.
    1. Click "Create pull request".

## Sync Repos

After your pull request has been accepted into the upstream repo:

1. Switch to your local main branch: `git checkout main`
1. Pull changes that occurred in the upstream repo: `git fetch upstream`
1. Merge the upstream main branch with your local main branch: `git merge upstream/main main`
1. Push changes from you local repo to the remote origin repo: `git push origin main`

## Delete Branches

Delete any unnecessary local and origin branches.

1. Switch to your local main branch: `git checkout main`
1. For verification, display all branches: `git branch -a`
1. Delete any unnecessary local branches: `git branch -d {branch-name}`
1. Delete any unnecessary remote origin branches: `git push origin --delete {branch-name}`

## Helpful Tips

1. When creating a README file for your serverless snippet, place example code and commands within a `code block`.


## Example Snippets
