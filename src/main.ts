import { promises as fs } from 'fs'
import process = require('process')

import core = require('@actions/core')
import fetch from 'node-fetch'
import readPackage = require('read-pkg')

import { createPR } from './github'
import { validatePackage } from './npm'
import { getUpdatedPlugins } from './plugins'

type Inputs = {
  githubToken: string
  owner: string
  repo: string
  packageJsonDirectory: string
  pluginsFile: string
}

const getOwnerAndRepo = () =>
  (core.getInput('directory-repo') || process.env.DIRECTORY_REPO || 'netlify/plugins').split('/')

// eslint-disable-next-line complexity
const getInputs = () => {
  const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN || ''
  const [owner, repo] = getOwnerAndRepo()
  const pluginsDirectory =
    core.getInput('plugins-directory-url') ||
    process.env.PLUGINS_DIRECTORY_URL ||
    'https://list-v2--netlify-plugins.netlify.app/plugins.json'
  const pluginsFile = core.getInput('plugins-file') || process.env.PLUGINS_FILE || 'site/plugins.json'

  const packageJsonDirectory = core.getInput('package-json-dir') || process.env.PACKAGE_JSON_DIRECTORY || '.'

  return { githubToken, owner, repo, packageJsonDirectory, pluginsDirectory, pluginsFile }
}

const validateInputs = ({ githubToken }: Inputs) => {
  if (!githubToken) {
    throw new Error('GitHub token is required')
  }
}

const readJson = async (urlOrPath: string) => {
  const content = urlOrPath.toLocaleLowerCase().startsWith('http')
    ? await fetch(urlOrPath).then((res) => res.text())
    : await fs.readFile(urlOrPath, 'utf8')
  return JSON.parse(content)
}

export const run = async () => {
  try {
    const inputs = getInputs()
    validateInputs(inputs)
    const { githubToken, owner, repo, packageJsonDirectory, pluginsDirectory, pluginsFile } = inputs

    const [packageJson, plugins] = await Promise.all([
      readPackage({ cwd: packageJsonDirectory }),
      readJson(pluginsDirectory),
    ])

    const { name, version } = packageJson
    await validatePackage(name, version)

    const { updatedPlugins, isNew } = getUpdatedPlugins(packageJson, plugins)
    await createPR({
      token: githubToken,
      owner,
      repo,
      pluginsFile,
      content: `${JSON.stringify(updatedPlugins, null, 2)}\n`,
      isNew,
      name,
      version,
    })
  } catch (error) {
    core.setFailed(error as Error)
  }
}
