// eslint-disable-next-line ava/no-ignored-test-files
import process from 'process'

import test from 'ava'
// eslint-disable-next-line import/no-namespace
import * as createPullRequest from 'octokit-plugin-create-pull-request'
import { createSandbox, SinonStub } from 'sinon'

import { run } from '../src/main'

process.env.GITHUB_TOKEN = 'fake-token'
process.env.PLUGINS_DIRECTORY_URL = `${__dirname}/fixture/plugins.json`

const sandbox = createSandbox()

test.beforeEach(() => {
  sandbox.stub(createPullRequest, 'composeCreatePullRequest').resolves(null)
})

test.afterEach.always(() => {
  sandbox.restore()
})

test.serial('existing-plugin-minor-bump', async (t) => {
  process.env.PACKAGE_JSON_DIRECTORY = `${__dirname}/fixture/existing-plugin-minor-bump`
  await run()

  const stub = createPullRequest.composeCreatePullRequest as SinonStub
  sandbox.assert.calledOnce(stub)

  t.snapshot(stub.getCall(0).args[1])
})

test.serial('existing-plugin-major-bump', async (t) => {
  process.env.PACKAGE_JSON_DIRECTORY = `${__dirname}/fixture/existing-plugin-major-bump`
  await run()

  const stub = createPullRequest.composeCreatePullRequest as SinonStub
  sandbox.assert.calledOnce(stub)

  t.snapshot(stub.getCall(0).args[1])
})

test.serial('new plugin', async (t) => {
  process.env.PACKAGE_JSON_DIRECTORY = `${__dirname}/fixture/new-plugin`
  await run()

  const stub = createPullRequest.composeCreatePullRequest as SinonStub
  sandbox.assert.calledOnce(stub)

  t.snapshot(stub.getCall(0).args[1])
})
