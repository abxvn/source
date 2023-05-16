const { BannerPlugin } = require('webpack')
const webpackNodeExternals = require('webpack-node-externals')
const { WebpackPnpExternals } = require('webpack-pnp-externals')
const { resolve } = require('path')

const rootPath = __dirname.replace(/\\/g, '/')
const resolvePath = subPath => resolve(rootPath, subPath).replace(/\\/g, '/')
// const getRelativePath = fullPath => fullPath.replace(/\\/g, '/').replace(rootPath, '')

const envName = process.env.NODE_ENV || 'development'

const entry = {
  '/packages/builder/src/lib/dts/index.ts': {
    import: resolvePath('packages/builder/src/lib/dts/index.ts')
  },
  '/packages/builder/src/plugins/DtsPlugin/index.ts': {
    import: resolvePath('packages/builder/src/plugins/DtsPlugin/index.ts')
  },
  '/packages/builder/src/filters/replaceVars/index.ts': {
    import: resolvePath('packages/builder/src/filters/replaceVars/index.ts')
  },
  '/packages/logger/index.ts': {
    import: resolvePath('packages/logger/index.ts')
  },
  '/packages/logger/cli/index.ts': {
    import: resolvePath('packages/logger/cli/index.ts')
  }
}

exports = module.exports = {
  entry,
  mode: envName,
  output: {
    path: rootPath,
    filename: data => {
      return data.chunk.name.replace(/\.tsx?$/, '.js') // change index.ts to index.js
    },
    libraryTarget: 'commonjs2'
    // library: {
    //   type: 'umd2'
    // }
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
    })
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
    WebpackPnpExternals({
      exclude: 'ansi-colors'
    })
  ],
  externalsPresets: {
    node: true
  }
}
