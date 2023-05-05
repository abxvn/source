import HtmlWebpackPlugin from 'html-webpack-plugin'
import { extractMatch, filter, map } from '../lib/helpers'
import type { IFilter, IWebpackConfig, IWebpackConfigs } from '../interfaces'

const devServer: IFilter = async ({ editor }) => {
  if (!process.env.WEBPACK_SERVE || editor.options.envName !== 'development') {
    return {
      configs: await removeUnusedDevEntries(editor.configs)
    }
  }

  const newDevConfigs: Record<string, IWebpackConfig> = {}
  const filteredConfigs = filter(editor.configs, (config: IWebpackConfig) => {
    if (config.devServer) {
      return true // avoid overriding dev server config
    }

    if (config.target !== 'web') {
      return false // remove 'node' targets
    }

    Object.keys(config.entry).forEach(entryName => {
      const entry = config.entry[entryName]
      const devDirPath = getDevDirPath(entry)

      if (!devDirPath) {
        return
      }

      const newConfigName = `${config.target as string}:dev:${devDirPath}`

      newDevConfigs[newConfigName] = {
        ...config,
        plugins: [
          ...config.plugins,
          new HtmlWebpackPlugin({
            inject: true,
            template: `${devDirPath}/index.html`
          })
        ],
        entry: {
          [entryName]: entry
        },
        watch: false,
        devServer: {
          open: false,
          host: '0.0.0.0',
          port: 0, // random port
          historyApiFallback: false,
          compress: true,
          static: devDirPath, // public serve folder
          hot: true,
          devMiddleware: {
            publicPath: '/'
          }
        }
      }
    })

    return false // remove this config
  })

  return {
    configs: Object.assign({}, filteredConfigs, newDevConfigs)
  }
}

const removeUnusedDevEntries = async (configs: IWebpackConfigs): Promise<IWebpackConfigs> =>
  await map(configs, async config => ({
    ...config,
    entry: filter(config.entry, entry => !getDevDirPath(entry))
  }))

const getDevDirPath = (entry: any): string => extractMatch(entry.import, /\/dev\//)

export default devServer
