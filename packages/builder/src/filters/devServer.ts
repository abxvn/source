import HtmlWebpackPlugin from 'html-webpack-plugin'
import { extractMatch, filter, map } from '../lib/data'
import { pathExists } from '../lib/vendors'
import type { IFilter, IWebpackConfig, IWebpackConfigs } from '../interfaces'

const devServer: IFilter = async ({ editor }) => {
  if (!process.env.WEBPACK_SERVE || editor.options.envName !== 'development') {
    return {
      configs: await removeUnusedDevEntries(editor.configs)
    }
  }

  const newDevConfigs: IWebpackConfig[] = []
  const filteredConfigs = await filter(editor.configs, async (config: IWebpackConfig) => {
    if (config.devServer) {
      return true // avoid overriding dev server config
    }

    if (config.target !== 'web') {
      return false // remove 'node' targets
    }

    const entryNames = Object.keys(config.entry)

    for (let idx = 0; idx < entryNames.length; idx++) {
      const entryName = entryNames[idx]
      const entry = config.entry[entryName]
      let devDirPath = getDevDirPath(entry)

      if (!devDirPath) {
        continue
      }

      devDirPath = devDirPath.replace(/\/$/, '')
      const devDivIndex = `${devDirPath}/index.html`

      if (!await pathExists(devDivIndex)) {
        console.log(devDivIndex)
        continue
      }

      const newConfigName = `${config.target as string}:dev:${devDirPath}`

      newDevConfigs.push({
        ...config,
        name: newConfigName,
        plugins: [
          ...config.plugins,
          new HtmlWebpackPlugin({
            inject: true,
            template: devDivIndex
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
      })
    }

    return false // remove this config
  })

  return {
    configs: [...filteredConfigs, ...newDevConfigs]
  }
}

const removeUnusedDevEntries = async (configs: IWebpackConfigs): Promise<IWebpackConfigs> =>
  await map(configs, async config => ({
    ...config,
    entry: await filter(config.entry, async entry => !getDevDirPath(entry))
  }))

const getDevDirPath = (entry: any): string => extractMatch(entry.import, /\/dev\//)

export default devServer
