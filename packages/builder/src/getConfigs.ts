import { PathResolver } from './lib/paths'
import { expandTargetedEntries } from './lib/helpers'
import type { IBuildEnvironment, IBuilderOptions, IFilter, IWebpackConfig } from './interfaces'

import initConfigs from './filters/initConfigs'
import unbundleExternals from './filters/unbundleExternals'
import replaceVars from './filters/replaceVars'
import replaceImports from './filters/replaceImports'
import generateDts from './filters/generateDts'
import devServer from './filters/devServer'
import chalk from 'chalk'

const filters: Record<string, IFilter> = {
  initConfigs,
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
  const targetEntries = await expandTargetedEntries(path, entryPath)
  const buildOptions: IBuilderOptions = {
    targetEntries,
    path,
    envName,
    replacements: [
      {
        map: {
          react: 'preact/compat',
          'react-dom': 'preact/compat'
        },
        pattern: /preact/
      }
    ]
  }

  const processes = [
    initConfigs,
    ...Object.values(filters)
  ]

  const configs = await processes.reduce<Promise<Record<string, IWebpackConfig>>>(
    async (chain, filter) => {
      const configs = await chain
      const filterOutput = await filter(configs, buildOptions)

      return filterOutput.configs
    },
    Promise.resolve({})
  )

  return Object.keys(configs).map(configName => {
    return Object.assign(configs[configName], {
      name: chalk.bold.underline.greenBright(configName),
      plugins: configs[configName].plugins.filter(Boolean)
    })
  })
}

export default getConfigs
