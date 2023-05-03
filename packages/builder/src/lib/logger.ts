import chalk from 'chalk'
import type { IWebpackConfig } from '../interfaces'

const { bold, red, gray } = chalk

export const log = console.log.bind(console)

export const logInfo = (...items: any[]) => {
  console.info(bold.cyan('ℹ'), ...items)
}

export const logProgress = (...items: any[]) => {
  console.info(gray('➤'), ...items)
}

export const logWarn = (...items: any[]) => {
  console.info(red('△'), ...items)
}

export const logError = (...items: any[]) => {
  items.forEach(item => {
    console.error(bold.underline.redBright('✘'), item)
  })
}

export const logSuccess = (...items: any[]) => {
  console.info(bold.greenBright('✔'), ...items)
}

export const logEntries = (configs: IWebpackConfig[]) => {
  logInfo(bold.cyanBright('Building entries:'))

  configs.forEach(({ name, target, entry }) => {
    log(`   ${name as string} (${chalk.italic(target)}):`)
    Object.keys(entry).forEach(entryName => { log(`     ${entryName}`) })
  })
}
