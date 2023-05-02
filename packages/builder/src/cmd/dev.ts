import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import type { Configuration, MultiCompiler } from 'webpack'
import { getConfigs } from '../configs'
import { logError, logInfo } from '../lib/logger'
import { path } from './options'

const dev = async (options: any): Promise<void> => {
  const envName = 'development'
  const { configs } = await getConfigs(options.path, envName)
  const compiler: MultiCompiler = webpack(configs as Configuration[])

  await Promise.all(configs.map(async (config, idx) => {
    const devServer = new WebpackDevServer(config.devServer, compiler.compilers[idx])

    devServer.options.onListening = ({ server }) => {
      const address: any = server?.address()

      logInfo(`Dev#${idx + 1} dev port ${address.port as string}, bundling...`)
    }

    try {
      await devServer.start()
    } catch (err) {
      logError(`Dev#${idx + 1} failed to start`, err)
    }
  }))
}

export default {
  description: 'Run dev servers for testing apps on browser',
  action: dev,
  options: [
    path
  ]
}
