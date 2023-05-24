/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { loggers } from '@abux/logger/cli'
import { path } from './options'
import { getConfigs } from '../configs'
import {
  ask,
  type IComponentAnswer,
  components,
  type ISdkAnswer,
  sdk,
  type IEditorConfigsAnswer,
  editorConfigs
} from './questions'
import { getYarnVersion } from '../lib/packages'
import { installPackages } from './init/installPackages'
import { copyConfigs } from './init/copyConfigs'
import { updatePackageJson } from './init/updatePackageJson'
import type { IApp } from '../interfaces'
import { logSuccess } from './init/loggers'

interface IAnswers {
  components: IComponentAnswer
  sdk: ISdkAnswer
  editorConfigs: IEditorConfigsAnswer
}

const init = async function (this: IApp, options: any) {
  const envName = 'development'
  const { editor, deps } = await getConfigs(options.path, envName, {
    options: {
      entryPatterns: []
    }
  })

  await checkVersion()

  const answers = await ask<IAnswers>({
    components,
    sdk,
    editorConfigs
  })

  await installPackages({ answers, deps }, this)
  await copyConfigs({ answers, deps, editor })
  await updatePackageJson({ editor, deps })

  logSuccess('done')

  loggers.info(`You may also need to enabled / install recommended VSCode extensions
  and agree if editor confirms for using workspace typescript`)
}

export default {
  description: 'Init config folder',
  action: init,
  options: [
    path
  ]
}

const checkVersion = async () => {
  const yarnVersion = await getYarnVersion()

  loggers.info('Versions:', 'node', process.versions.node, 'yarn', yarnVersion)

  if (!/^3/.test(yarnVersion)) {
    loggers.error(`
      Please check if Yarn Berry was set up correctly.
      Usually it will be all good by running this command:
      yarn init -2
    `)
  }
}
