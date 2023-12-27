import { loggers } from '@abxvn/logger/cli'
import { path, pm, pmChoices } from './options'
import { getConfigs } from '../configs'
import {
  ask,
  type IComponentAnswer,
  components,
  type ISdkAnswer,
  sdk,
  type IEditorConfigsAnswer,
  editorConfigs,
} from './questions'
import { IInstallOptions, getVersion } from '../lib/packages'
import { installPackages } from './init/installPackages'
import { copyConfigs } from './init/copyConfigs'
import { updatePackageJson } from './init/updatePackageJson'
import type { IApp } from '../interfaces'
import { logSuccess } from './init/loggers'
import { argv0 } from 'process'

interface IAnswers {
  components: IComponentAnswer
  sdk?: ISdkAnswer
  editorConfigs: IEditorConfigsAnswer
}

const init = async function (this: IApp, options: any) {
  const envName = 'development'
  const { editor, deps } = await getConfigs(options.path, envName, {
    options: {
      entryPatterns: [],
    },
  })

  if (!options.pm && pmChoices.includes(argv0)) options.pm = argv0
  if (!options.pm) options.pm = 'pnpm'

  await checkVersion(options.pm)

  const answers = await ask<IAnswers>({
    components,
    editorConfigs,
    ...(options.pm === 'yarn' && { sdk }),
  })

  await installPackages({ answers, deps, pm: options.pm }, this)
  await copyConfigs({ answers, deps, editor })
  await updatePackageJson({ editor, deps, pm: options.pm })

  logSuccess('done')

  loggers.info(`You may also need to enabled / install recommended VSCode extensions
  and agree if editor confirms for using workspace typescript`)
}

export default {
  description: 'Init config folder',
  action: init,
  options: [
    path,
    pm,
  ],
}

const checkVersion = async (pm: IInstallOptions['pm'] = 'pnpm') => {
  loggers.info('Versions:', 'node', process.versions.node, pm, await getVersion(pm))
}
