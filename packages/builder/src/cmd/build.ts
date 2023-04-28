import webpack from 'webpack'
import type { Configuration } from 'webpack'
import getConfigs from '../getConfigs'
import { logError, logEntries } from '../lib/logger'
import ProgressReportPlugin from '../plugins/ProgressReportPlugin'
import { nodeEnv, path } from './options'
import { type IBuildEnvironment } from '../interfaces'

interface IBuildOptions {
  entry: string
  nodeEnv: IBuildEnvironment
}

const build = async (options: IBuildOptions): Promise<void> => {
  try {
    process.env.WEBPACK_SERVE = ''

    const envName = options.nodeEnv
    const configs = await getConfigs(process.cwd(), envName, options.entry)

    if (!configs.length) {
      throw Error(`No entries found for "${options.entry}"`)
    }

    logEntries(configs)

    configs.forEach(config => config.plugins.push(new ProgressReportPlugin()))

    await new Promise<void>((resolve, reject) => {
      webpack(configs as Configuration[], (err, stats) => {
        if (err) {
          reject(err)
        } else {
          console.log(stats?.toString({
            chunks: false, // Removes chunk information
            colors: true // Enables colorful output
          }))

          if (stats?.hasErrors()) {
            reject(Error('compilation failed'))
          } else {
            resolve()
          }
        }
      })
    })
  } catch (err: any) {
    logError(err.message)
  }
}

export default {
  description: 'Build packages',
  action: build,
  options: [
    path,
    nodeEnv
  ]
}
