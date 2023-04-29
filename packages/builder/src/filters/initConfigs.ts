import { map } from '../lib/helpers'
import type { IBuildTarget, IBuilderOptions, IEntries, IWebpackConfig, IWebpackConfigs } from '../interfaces'
import { resolve } from '@teku/resolve'

const initConfigs = async (configs: IWebpackConfigs, options: IBuilderOptions) => {
  return {
    configs: await map(options.targetEntries, async (entries, target) =>
      await getConfig(target as IBuildTarget, entries, options)
    )
  }
}

export default initConfigs

export const getConfig = async (
  target: IBuildTarget = 'web',
  entries: IEntries,
  options: IBuilderOptions
): Promise<IWebpackConfig> => {
  const { envName = 'development' } = options
  const config: IWebpackConfig = {
    entry: entries,
    mode: envName,
    output: {
      path: options.path.rootPath,
      filename: data => {
        return data.chunk?.name?.replace(/\.tsx?$/, '.js') as string // change index.ts to index.js
      }
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(js|tsx?)$/,
          use: [
            {
              loader: await resolve('ts-loader'),
              options: {
                configFile: options.path.resolve('config/ts/tsconfig.packages.json')
              }
            }
          ],
          exclude: /node_modules|yarn/
        },
        {
          test: /\.html$/i,
          loader: await resolve('html-loader')
        }
      ]
    },
    externals: [],
    plugins: [],
    stats: {
      logging: true
    },
    watch: envName === 'development',
    devtool: envName === 'development' && 'inline-source-map'
  }

  return target === 'node'
    ? setNodePackageConfig(config)
    : setWebPackageConfig(config)
}

export const setNodePackageConfig = (config: IWebpackConfig): IWebpackConfig => {
  return {
    ...config,
    output: {
      ...config.output,
      library: {
        type: 'commonjs2'
      }
    },
    target: 'node',
    externalsPresets: {
      ...config.externalsPresets,
      node: true
    }
  }
}

// also for devServer
export const setWebPackageConfig = (config: IWebpackConfig): IWebpackConfig => {
  return {
    ...config,
    output: {
      ...config.output,
      library: {
        type: 'umd'
      }
    },
    target: 'web',
    externalsPresets: {
      ...config.externalsPresets,
      node: false
    }
  }
}
