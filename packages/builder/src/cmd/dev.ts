import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import type { Configuration, MultiCompiler } from 'webpack'
import getConfigs from '../getConfigs'

const dev = async (): Promise<void> => {
  const configs = await getConfigs(process.cwd(), 'development')
  const compiler: MultiCompiler = webpack(configs as Configuration[])

  await Promise.all(configs.map(async (config, idx) => {
    const devServer = new WebpackDevServer(config.devServer, compiler.compilers[idx])

    devServer.options.onListening = ({ server }) => {
      const address: any = server?.address()

      console.log(`Dev#${idx + 1} dev port ${address.port as string}, bundling...`)
    }

    try {
      await devServer.start()
    } catch (err) {
      console.error(`ERROR: Dev#${idx + 1} failed to start`)
      console.error(err)
    }
  }))
}

export default {
  description: 'Run dev servers for testing apps on browser',
  action: dev
}
