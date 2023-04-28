import { map } from '../lib/helpers'
import type { IWebpackConfigs } from '../interfaces'
import ImportReplacementPlugin from '../plugins/ImportReplacementPlugin'

const replaceImports = async (configs: IWebpackConfigs) => {
  return await map(configs, async config => ({
    ...config,
    plugins: [
      ...(config.plugins || []),
      new ImportReplacementPlugin(
        {
          react: 'preact/compat',
          'react-dom': 'preact/compat'
        },
        /preact\//
      )
    ]
  }))
}

export default replaceImports
