import webpackNodeExternals from 'webpack-node-externals'
import webpackPnpExternals from '../plugins/webpackPnpExternals'
import { map } from '../lib/data'
import type { IFilter, IWebpackConfig } from '../interfaces'

const unbundleExternals: IFilter = async ({ editor }) => {
  return {
    configs: await map(editor.configs, async (config: IWebpackConfig) => {
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
