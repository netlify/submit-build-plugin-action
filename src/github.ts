import core = require('@actions/core')
import github = require('@actions/github')
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request'

const template = `Thanks for contributing the Netlify plugins directory!

**Are you adding a plugin or updating one?**

- [ ] Adding a plugin
- [ ] Updating a plugin

**Have you completed the following?**

- [ ] Read and followed the [plugin author guidelines](https://github.com/netlify/plugins/blob/main/docs/guidelines.md).
- [ ] Included all [required fields](https://github.com/netlify/plugins/blob/main/docs/CONTRIBUTING.md#required-fields) in your entry.
- [ ] Tested the plugin [locally](https://docs.netlify.com/cli/get-started/#run-builds-locally) and [on Netlify](https://docs.netlify.com/configure-builds/build-plugins/#install-a-plugin), using the plugin version stated in your entry.

**Test plan**
Please add a link to a successful public deploy log using the stated version of the plugin. Include any other context reviewers might need for testing.`

export const createPR = async ({
  token,
  owner,
  repo,
  pluginsFile,
  content,
  isNew,
  version,
  name,
}: {
  token: string
  owner: string
  repo: string
  pluginsFile: string
  content: string
  isNew: boolean
  version: string
  name: string
}) => {
  const octokit = github.getOctokit(token)
  const title = isNew ? `feat: add plugin ${name}@${version}` : `feat: update plugin ${name} to version ${version}`
  const body = isNew
    ? template.replace('[ ] Adding a plugin', '[x] Adding a plugin')
    : template.replace('[ ] Updating a plugin', '[x] Updating a plugin')

  core.info(`Creating pull request for ${name}@${version} with title: ${title}`)
  const options = {
    owner,
    repo,
    title,
    body,
    head: `feat/update_plugin_to_version_${version.replace(/\./g, '_')}`,
    changes: [
      {
        /* optional: if `files` is not passed, an empty commit is created instead */
        files: {
          [pluginsFile]: content,
        },
        commit: title,
      },
    ],
  }
  await composeCreatePullRequest(octokit, options)
  core.info(`Done creating pull request for ${name}@${version}`)
}
