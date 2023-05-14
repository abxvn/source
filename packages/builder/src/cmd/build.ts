import webpack from 'webpack'
import type { Configuration } from 'webpack'
import { getConfigs } from '../configs'
import { logError, log, logSuccess, logInfo, badge } from '@abux/logger'
import { logEntries } from '../lib/entries'
import ProgressReportPlugin from '../plugins/ProgressReportPlugin'
import { nodeEnv, path, production } from './options'
import { type IBuildEnvironment } from '../interfaces'

interface IBuildOptions {
  path: string
  nodeEnv: IBuildEnvironment
  production?: boolean
}

const build = async (options: IBuildOptions): Promise<void> => {
  try {
    process.env.WEBPACK_SERVE = ''

    const envName = options.production ? 'production' : options.nodeEnv
    const { configs } = await getConfigs(options.path, envName)

    if (!configs.length) {
      throw Error(`${badge('build', 'redBright')} no entries found for "${options.path}"`)
    }

    logEntries(configs)
    logInfo(badge('build', 'greenBright'), 'start')
    configs.forEach(config => config.plugins.push(new ProgressReportPlugin()))

    await new Promise<void>((resolve, reject) => {
      webpack(configs as Configuration[], (err, stats) => {
        if (err) {
          reject(err)
        } else {
          log(stats?.toString({
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

    logSuccess(badge('build', 'greenBright'), 'done')
  } catch (err: any) {
    logError(err.message)
  }
}

export default {
  description: 'Build packages',
  action: build,
  options: [
    path,
    nodeEnv,
    production
  ]
}
