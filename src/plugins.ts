import core = require('@actions/core')
import type { NormalizedPackageJson as PackageJson } from 'read-pkg'

type Plugin = {
  author: string
  description: string
  name: string
  package: string
  repo: string
  version: string
  compatibility?: {
    version: string
    migrationGuide?: string
    nodeVersion?: string
    siteDependencies?: Record<string, string>
  }[]
}

type Plugins = Plugin[]

const getCompatibility = ({ plugin, newVersion }: { plugin: Plugin; newVersion: string }) => {
  if (!plugin.compatibility) {
    return
  }

  const [firstItem] = plugin.compatibility

  // update compatibility to the latest version
  // TODO: auto handle breaking changes
  return [{ ...firstItem, version: newVersion }, plugin.compatibility.slice(1)]
}

const handleExistingPlugin = ({
  plugins,
  pluginName,
  pluginVersion: newVersion,
  pluginIndex,
}: {
  plugins: Plugins
  pluginName: string
  pluginVersion: string
  pluginIndex: number
}) => {
  core.info(`Plugin ${pluginName} exists, starting update to latest version ${newVersion}`)
  const existingPlugin = plugins[pluginIndex]
  if (existingPlugin.version === newVersion) {
    core.warning(`Skipping update as the latest version ${newVersion} is already set in the plugins file`)
    return plugins
  }
  const updatedPlugin = {
    ...existingPlugin,
    version: newVersion,
    compatibility: getCompatibility({ plugin: existingPlugin, newVersion }),
  }
  const newPlugins = Object.assign([], plugins, { [pluginIndex]: updatedPlugin })
  return newPlugins
}

const handleNewPlugin = ({
  plugins,
  pluginName,
  pluginVersion,
  description,
  repository,
  author,
}: {
  plugins: Plugins
  pluginName: string
  pluginVersion: string
  description: string
  repository: string
  author: string
}) => {
  const newPlugin = {
    author,
    name: description,
    description,
    repo: repository,
    version: pluginVersion,
    package: pluginName,
  }

  const newPlugins = [...plugins, newPlugin]
  return newPlugins
}

export const getUpdatedPlugins = (packageJson: PackageJson, plugins: Plugins) => {
  const { name: pluginName, version: pluginVersion, description, repository, author } = packageJson
  const pluginIndex = plugins.findIndex(({ package: name }) => name === pluginName)
  const updatedPlugins =
    pluginIndex >= 0
      ? handleExistingPlugin({ plugins, pluginName, pluginVersion, pluginIndex })
      : handleNewPlugin({
          plugins,
          pluginName,
          pluginVersion,
          description: description as string,
          repository: repository?.url as string,
          author: author?.name as string,
        })
  return { updatedPlugins, isNew: pluginIndex < 0 }
}
