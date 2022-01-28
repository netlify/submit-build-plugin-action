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
        const { statusCode } = error as Error & { statusCode: number }
        if (statusCode) {
          core.warning(`${packageAndVersion} does no exist in npm registry`)
          return false
        }
        throw error
      }
    },
    { timeout: WAIT_TIMEOUT, interval: WAIT_INTERVAL },
  )
}
