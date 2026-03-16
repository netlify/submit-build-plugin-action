import core = require('@actions/core')
import pWaitFor = require('p-wait-for')
import pacote = require('pacote')

const WAIT_TIMEOUT = 3e5
const WAIT_INTERVAL = 2e4

const formatPackageAndVersion = (packageName: string, pluginVersion: string) => `${packageName}@${pluginVersion}`

export const validatePackage = async (packageName: string, pluginVersion: string) => {
  const packageAndVersion = formatPackageAndVersion(packageName, pluginVersion)
  await pWaitFor(
    async () => {
      try {
        core.info(`Checking if ${packageAndVersion} is available in the npm registry`)
        await pacote.manifest(packageAndVersion)
        core.info(`Found package ${packageAndVersion} in the npm registry`)
        return true
      } catch (error) {
        const { statusCode, code } = error as Error & { statusCode?: number; code?: string }
        // If the package is new and not yet published then there will be a 404.
        // If the package exists but the version hasn't been published yet then there will be an ETARGET error.
        if (statusCode || code === 'ETARGET') {
          core.warning(`${packageAndVersion} does not exist in npm registry yet. Checking again shortly...`)
          return false
        }
        throw error
      }
    },
    { timeout: WAIT_TIMEOUT, interval: WAIT_INTERVAL },
  )
}
