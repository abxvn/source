// import { copy } from 'fs-extra'
import { log, logInfo, logSuccess } from '../lib/logger'
import chalk from 'chalk'
import { PathResolver, resolver } from '../lib/paths'

const configSourceDir = resolver(__dirname).resolve('../config')

const init = async () => {
  const path = new PathResolver(process.cwd())
  const configDestDir = path.resolve('config')

  logInfo('Workspace:', path.rootPath)

  logInfo(`Copying ${chalk.bold.gray`config`} folder`)
  log('  -', 'from:', configSourceDir)
  log('  -', 'to:', configDestDir)
  // await copy(configSourceDir, configDestDir)

  logSuccess(`Copied ${chalk.bold.gray`config`} folder`)
  logInfo('Please complete by merging files inside this folder into your workspace:')
  log('  ', `${configDestDir}/editor/`)

  // TODO: Add inquirer to install sdks for yarn dlx @yarnpkg/sdks vscode
}

export default {
  description: 'Init config folder',
  action: init
}
