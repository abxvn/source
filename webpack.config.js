const { BannerPlugin } = require('webpack')
const webpackNodeExternals = require('webpack-node-externals')
const { WebpackPnpExternals } = require('webpack-pnp-externals')
const { resolve } = require('path')

const { DtsPlugin } = require('./packages/builder/src/plugins/DtsPlugin')
const { default: replaceVars } = require('./packages/builder/src/filters/replaceVars')

const rootPath = __dirname.replace(/\\/g, '/')
const resolvePath = subPath => resolve(rootPath, subPath).replace(/\\/g, '/')
// const getRelativePath = fullPath => fullPath.replace(/\\/g, '/').replace(rootPath, '')

const envName = process.env.NODE_ENV || 'development'

const entry = {
  '/packages/builder/cli/index.ts': {
    import: resolvePath('packages/builder/cli/index.ts')
  },
  '/packages/resolve/index.ts': {
    import: resolvePath('packages/resolve/index.ts')
  },
  '/packages/resolve/cli/index.ts': {
    import: resolvePath('packages/resolve/cli/index.ts')
  },
  '/packages/logger/index.ts': {
    import: resolvePath('packages/logger/index.ts')
  },
  '/packages/tasks/index.ts': {
    import: resolvePath('packages/tasks/index.ts')
  }
}

exports = module.exports = async () => {
  const config = {
    entry,
    mode: envName,
    output: {
      path: rootPath,
      filename: data => {
        return data.chunk.name.replace(/\.tsx?$/, '.js') // change index.ts to index.js
      },
      library: {
        type: 'commonjs2'
      }
    },
    resolve: {
      extensions: [
        '.ts',
        '.js',
        '.tsx'
      ]
    },
    module: {
      rules: [
        {
          test: /\.(js|tsx?)$/,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                configFile: resolvePath('./tsconfig.json'),
                compilerOptions: {
                  projectDir: __dirname
                }
              }
            }
          ],
          exclude: /node_modules|\.yarn/
        }
      ]
    },
    plugins: [
      new BannerPlugin({
        banner ({ filename }) {
          return filename.includes('/cli/')
            ? '#!/usr/bin/env node'
            : ''
        },
        raw: true
      }),
      envName === 'production' && new DtsPlugin(rootPath)
    ].filter(Boolean),
    watch: envName === 'development',
    watchOptions: {
      ignored: [
        'node_modules',
        '.yarn',
        '**/index.js',
        '**/index.d.ts'
      ]
    },
    devtool: false,
    target: 'node',
    externals: [
      /^[^./]+\/([^/]+\/)*index\.js$/,
      webpackNodeExternals(),
      WebpackPnpExternals()
    ],
    externalsPresets: {
      node: true
    }
  }

  const { configs } = await replaceVars({
    editor: {
      path: {
        rootPath
      },
      configs: {
        node: config
      }
    }
  })

  return Object.values(configs)
}
