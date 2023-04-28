import kindOf from 'kind-of'
import glob from 'fast-glob'
import type {
  IWebpackConfig,
  IBuilderOptions,
  ITargetedExpandedEntries,
  IEntries,
  IPathResolver
} from '../interfaces'
import { resolve } from '@teku/resolve'

export const getConfig = async (
  entries: IEntries,
  options: IBuilderOptions
): Promise<IWebpackConfig> => {
  const { envName = 'development', target = 'web' } = options
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

export const expandTargetedEntries = async (
  path: IPathResolver,
  packagePath: string,
  pattern = '**/index.ts'
): Promise<ITargetedExpandedEntries> => {
  const files = await glob(`${packagePath}/${pattern}`)

  return files.reduce<ITargetedExpandedEntries>(
    (targetedEntries, f) => {
      const relativePath = path.relative(f)
      const fullPath = path.resolve(f)
      const target = /\/scripts\/|\/dev\//.test(relativePath) ? 'web' : 'node'

      return {
        ...targetedEntries,
        [target]: {
          ...targetedEntries[target],
          [relativePath]: {
            import: fullPath
          }
        }
      }
    },
    {}
  )
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

export const map = async (iterable: any, transform: (item: any, key: number | string) => Promise<any>): Promise<any> => {
  switch (kindOf(iterable)) {
    case 'object':
      // eslint-disable-next-line no-case-declarations
      const newObject: any = {}

      await Promise.all(
        Object.keys(iterable).map(async key => {
          newObject[key] = await transform(iterable[key], key)
        })
      )

      return newObject
    case 'array':
      return await Promise.all(iterable.map(transform))
    default:
      throw Error('Please provide object or array input')
  }
}

export const filter = (iterable: any, filter: (item: any, key: number | string) => boolean): any => {
  switch (kindOf(iterable)) {
    case 'object':
      return Object.keys(iterable).reduce((newObj: any, key) => {
        if (filter(iterable[key], key)) {
          newObj[key] = iterable[key]
        }

        return newObj
      }, {})
    case 'array':
      return iterable.filter(filter)
    default:
      throw Error('Please provide object or array input')
  }
}

export const extractMatch = (str: string, regex: RegExp): string => {
  const match = str.match(regex)

  return match ? str.slice(0, (match.index ?? 0) + match[0].length) : ''
}
