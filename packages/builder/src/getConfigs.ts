import PathResolver from './lib/PathResolver'
import { getConfig, expandTargetedEntries, map } from './lib/helpers'
import type { IBuildEnvironment, IFilter, IWebpackConfig } from './interfaces'
import unbundleExternals from './filters/unbundleExternals'
import replaceVars from './filters/replaceVars'
import replaceImports from './filters/replaceImports'
import generateDts from './filters/generateDts'
import devServer from './filters/devServer'
import chalk from 'chalk'

const filters: Record<string, IFilter> = {
  unbundleExternals,
  replaceVars,
  replaceImports,
  generateDts,
  devServer // should always placed last
}

const getConfigs = async (
  rootPath: string,
  envName: IBuildEnvironment = 'development',
  entryPath = 'packages/*'
): Promise<IWebpackConfig[]> => {
  const path = new PathResolver(rootPath)
  const targetedEntries = await expandTargetedEntries(path, entryPath)
  const buildOptions = {
    path,
    envName
  }

  const initConfigs: IFilter = async () => await map(
    targetedEntries,
    async (entries, target) =>
      await getConfig(entries, {
        ...buildOptions,
        target: target === 'node' ? 'node' : 'web'
      })
  )
  const processes = [
    initConfigs,
    ...Object.values(filters)
  ]

  const configs = await processes.reduce<Promise<Record<string, IWebpackConfig>>>(
    async (chain, filter) =>
      await chain.then(async newConfigs => await filter(newConfigs, buildOptions)),
    Promise.resolve({})
  )

  return Object.keys(configs).map(configName => Object.assign(configs[configName], {
    name: chalk.bold.underline.greenBright(configName)
  }))
}

export default getConfigs
