import webpackNodeExternals from 'webpack-node-externals'
import webpackPnpExternals from '../plugins/webpackPnpExternals'
import { map } from '../lib/helpers'
import type { IWebpackConfig, IWebpackConfigs } from '../interfaces'

const unbundleExternals = async (configs: IWebpackConfigs) => {
  return {
    configs: await map(configs, async (config: IWebpackConfig) => {
      if (config.target !== 'node') {
        return config
      }

      return {
        ...config,
        externals: [
          ...(config.externals as any),
          webpackNodeExternals(),
          webpackPnpExternals()
        ]
      }
    })
  }
}

export default unbundleExternals
