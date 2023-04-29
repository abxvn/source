import { map } from '../lib/helpers'
import type { IBuilderOptions, IWebpackConfigs } from '../interfaces'
import DtsPlugin from '../plugins/DtsPlugin'

const generateDts = async (configs: IWebpackConfigs, { envName, path }: IBuilderOptions) => {
  return {
    configs: await map(configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        envName === 'production' && new DtsPlugin(path)
      ]
    }))
  }
}

export default generateDts
