import { map } from '../lib/helpers'
import type { IBuilderOptions, IWebpackConfigs } from '../interfaces'
import DtsPlugin from '../plugins/DtsPlugin'

const generateDts = async (configs: IWebpackConfigs, { envName, path }: IBuilderOptions) => {
  if (envName !== 'production') {
    return configs
  }

  return await map(configs, async config => ({
    ...config,
    plugins: [
      ...config.plugins,
      new DtsPlugin(path)
    ]
  }))
}

export default generateDts
