# How To Maintain Our API Docs

1. [Get Set Up](#get-set-up)
1. [Make Your Edits](#make-your-edits)
1. [Have Your Work Reviewed](#have-your-work-reviewed)
1. [Publish!](#publish)

## 1. Get Set Up

### Prerequisites

- Access to the [SparkPost GitHub organisation][github-org]
- Node.js
- Grunt

### Setup Steps

1. Clone and prepare the development docs repo:

    ```sh
    git clone https://github.com/SparkPost/sparkpost-api-documentation-DEV.git
    cd sparkpost-api-documentation-DEV
    git remote add upstream git@github.com:SparkPost/sparkpost-api-documentation.git
    npm install
    ```

    This is where you'll make your edits, open pull requests etc.

1. Clone and prepare the DevHub repo _beside the docs repo_:

    ```sh
    cd ../
    git clone https://github.com/SparkPost/developers.sparkpost.com.git sparkpost.github.io
    cd sparkpost.github.io
    ./scripts/bootstrap
    ```

    You can use this repo to preview your edits in a version of the DevHub running on your machine.

Note: unless otherwise stated, the commands below are meant for the API docs repo, _not the DevHub one_.

## 2. Make Your Edits

First, create a branch for your work in the API docs repo:

```sh
git checkout -b your-branch-name
```

Then make your changes as needed.

Hint: Most work is done in the files under `services/`.

Each top-level section in the API docs has a Markdown file under `services/`. Each file represents either an API endpoint such as `/api/v1/transmissions` or a high-level concept like "template substitution".

### Editing API Specifications
The API endpoint documentation broadly follows the Apiary [API blueprint specification](https://apiblueprint.org/). That's available [here](https://apiblueprint.org/) for reference but you can ape existing content to get started quickly.

### Editing High-level Conceptual Documentation
These are plain old Markdown. Here's [the standard guide on Markdown](https://daringfireball.net/projects/markdown/) for reference.

### Adding Items and Menu Ordering
The API docs top-level sections (introduction, SMTP API, transmissions, etc) are defined at the top of `Gruntfile.js` like this:

```js
services = [
    'introduction.md',
    'labs-introduction.md',
    'substitutions-reference.md',
    'smtp-api.md',
    'ab-testing.md',
    'account.md',
    'bounce-domains.md',
    'inbound-domains.md',
    'ip-pools.md',
    'metrics.md',
    'message-events.md',
    'recipient-lists.md',
    'relay-webhooks.md',
    'sending-domains.md',
    'sending-ips.md',
    'subaccounts.md',
    'suppression-list.md',
    'templates.md',
    'tracking-domains.md',
    'transmissions.md',
    'webhooks.md'
]
```

You can edit this list to control the API docs top-level structure and ordering.

### Preview Your Work

You can render and serve the whole DevHub on your machine to preview your changes exactly as they'll look in production:

1. Start the API docs build process (and leave it running):
    ```sh
    grunt staticDev
    ```

1. Start the DevHub server (from within the DevHub repo) in a 2nd terminal:
    ```sh
    cd ../sparkpost.github.io
    ./script/server
    ```

Your API docs are now available at [http://localhost:4000/api/](http://localhost:4000/api/). 

Note: Once these processes have started, they will watch for changes and re-render the API docs on demand. Hit Ctrl+C to stop them when you're done. 

## 3. Have Your Work Reviewed

1. Commit your edits to your local repo:
    ```sh
    git add the-files-you-have-edited
    git commit -m "A short message about what you changed"
    ```

1. Push your changes to the API docs dev repo on GitHub:
    ```sh
    git push origin -b your-branch-name
    ```

1. Open a pull request in the [API docs dev repo here](https://github.com/SparkPost/sparkpost-api-documentation-DEV/compare) comparing your branch to the `master` branch.

## 4. Publish!

One you have addressed any review feedback on your pull request, you can merge it into the master branch and publish it:

1. Merge your pull request by hitting the big green *Merge pull request* button on in GitHub

    Note: please also delete your branch on GitHub after you merge.

1. Pull your now-merged changes into your local API docs dev repo:
    ```sh
    git checkout master
    git pull origin master
    ```

1. Pull any changes from the public repo into yours:
    ```sh
    git pull upstream master
    ```

1. Publish your changes:
    ```sh
    git push upstream master
    ```

    Note: it will take a few minutes for the docs to build and publish to developers.sparkpost.com.

# Internals

## The Repositories

There are 3 repos used to manage our API docs:

- [sparkpost-api-documentation-DEV][dev-repo]: This is a private repo for staging unpublished documentation updates. When changes are ready for publication, they are pushed from here to the upstream public repo.
- [sparkpost-api-documentation][public-repo]: This is a public repo for tracking community-related issues and contributions. The published API docs are built from this repo.
- [developers.sparkpost.com][devhub-repo]: This is the DevHub repo which contains the final rendered API docs. It's a Jekyll-based static site served from S3.

## How The Docs Are Published

1. An editor pushes changes to the public repo master branch.
1. Public repo TravisCI process:
  1. TravisCI renders the docs into the DevHub with a call to `grunt static`
  1. TravisCI commits the new docs to the DevHub repo `develop` branch
  1. TravisCI updates the Algolia search index with the updated docs content
1. DevHub repo TravisCI process:
  1. Generates the DevHub using Jekyll
  1. Deploys the DevHub (including API docs) to S3 for public consumption.

## How Search Works

The API docs Grunt file includes tasks for parsing search content out of the Markdown and updating the search index in Algolia, our search service.

[github-org]: https://github.com/SparkPost/ 
[dev-repo]: https://github.com/SparkPost/sparkpost-api-documentation-dev
[public-repo]: https://github.com/SparkPost/sparkpost-api-documentation
[devhub-repo]: https://github.com/SparkPost/developers.sparkpost.com

