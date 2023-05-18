import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import type { Configuration, MultiCompiler } from 'webpack'
import { getConfigs } from '../configs'
import { loggers } from '@abux/logger/cli'
import { path } from './options'
import { type ICollapsible, collapsible } from '@abux/logger/cli'

const { info, badge } = loggers

const dev = async (options: any): Promise<void> => {
  const envName = 'development'
  const { configs } = await getConfigs(options.path, envName)
  const compiler: MultiCompiler = webpack(
    configs.map(config => ({ ...config, stats: 'errors-warnings' })) as Configuration[]
  )
  const ports: Record<string, string> = {}

  const streams: ICollapsible[] = []

  compiler.hooks.done.tap('setuplogCleaner', () => { // clean error logs after each compilation
    streams.forEach(stream => {
      stream.collapse()
    })
    Object.keys(ports).forEach(name => {
      info(`${badge(name, 'blue', 'whiteBright')} dev port ${ports[name]}, bundling...`)
    })

    if (!streams.length) {
      // streams.push(collapsible(process.stderr, true))
      streams.push(collapsible(process.stdout, true))
    }
  })

  await Promise.all(configs.map(async (config, idx) => {
    const name = config.name
    const devServer = new WebpackDevServer(config.devServer, compiler.compilers[idx])

    devServer.options.onListening = ({ server }) => {
      const address: any = server?.address()

      ports[name] = address.port
    }

    try {
      await devServer.start()
    } catch (err) {
      loggers.error(`${badge(name, 'redBright', 'white')} failed to start`, err)
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
