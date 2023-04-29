import { map } from '../lib/helpers'
import type { IBuilderOptions, IWebpackConfigs } from '../interfaces'
import ImportReplacementPlugin from '../plugins/ImportReplacementPlugin'

const replaceImports = async (configs: IWebpackConfigs, { replacements }: IBuilderOptions) => {
  if (!replacements) {
    return {
      configs
    }
  }

  return {
    configs: await map(configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        ...replacements.map(({ pattern, map }) =>
          new ImportReplacementPlugin(map, pattern)
        )
      ]
    }))
  }
}

export default replaceImports
