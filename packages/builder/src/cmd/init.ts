import { logError, logInfo, logSuccess } from '../lib/logger'
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

interface IAnswers {
  components: IComponentAnswer
  sdk: ISdkAnswer
  editorConfigs: IEditorConfigsAnswer
}

const init = async (options: any) => {
  const envName = 'development'
  const { editor, deps } = await getConfigs(options.path, envName)

  await checkVersion()

  const answers = await ask<IAnswers>({
    components,
    sdk,
    editorConfigs
  })

  await installPackages({ answers, deps })
  await copyConfigs({ answers, deps, editor })
  await updatePackageJson({ editor, deps })

  logSuccess('[init] done')
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

  logInfo('Versions:', 'node', process.versions.node, 'yarn', yarnVersion)

  if (!/^3/.test(yarnVersion)) {
    logError(`
      Please check if Yarn Berry was set up correctly.
      Usually it will be all good by running this command:
      yarn init -2
    `)
  }
}
