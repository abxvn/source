import { map } from '../lib/data'
import type { IBuildTarget, IConfigEditor, IEntries, IFilter, IWebpackConfig } from '../interfaces'
import { resolve } from '@abux/resolve'

const initConfigs: IFilter = async ({ editor }) => {
  const targetedEntries = editor.entries
  const targets = Object.keys(targetedEntries)

  return {
    configs: await map(targets, async target => {
      const entries = targetedEntries[target]

      return await getConfig(target as IBuildTarget, entries, editor)
    })
  }
}

export default initConfigs

export const getConfig = async (
  target: IBuildTarget = 'web',
  entries: IEntries,
  editor: IConfigEditor
): Promise<IWebpackConfig> => {
  const { envName = 'development' } = editor.options
  const config: IWebpackConfig = {
    name: target,
    entry: entries,
    mode: envName,
    output: {
      path: editor.path.rootPath,
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
                configFile: editor.path.resolve('tsconfig.json')
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
    stats: 'normal',
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
      libraryTarget: 'commonjs2'
      // library: {
      //   type: 'commonjs2'
      // }
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
      ...config.output
      // libraryTarget: 'var'
      // library: {
      //   type: 'var'
      // }
    },
    target: 'web',
    externalsPresets: {
      ...config.externalsPresets,
      node: false
    }
  }
}
