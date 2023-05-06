import type { IConfigDeps } from '../../interfaces'
import { badge, logInfo } from '../../lib/logger'
import { install, installSdk } from '../../lib/packages'
import {
  type IComponentAnswer,
  components,
  type ISdkAnswer
} from '../questions'

interface IInstallPackagesParams {
  answers: { components: IComponentAnswer, sdk: ISdkAnswer }
  deps: IConfigDeps
}
export const installPackages = async ({ answers, deps }: IInstallPackagesParams) => {
  deps.set('@teku/builder', { version: '*' })
  components.choices?.forEach(name => {
    if (!answers.components?.includes(name)) {
      deps.unset(name)
    }
  })

  const dependencies = deps.dependencies
  const mainDependencies: string[] = []
  const devDependencies: string[] = []

  dependencies.forEach(dependency => {
    if (dependency.indexOf('dev//') === 0) {
      devDependencies.push(dependency.replace('dev//', ''))
    } else {
      mainDependencies.push(dependency)
    }
  })

  if (mainDependencies.length) {
    logInfo(badge('init'), 'install', mainDependencies.join(' '))
    await install(...mainDependencies)
  }

  if (devDependencies.length) {
    logInfo(badge('init'), 'install dev', devDependencies.join(' '))
    await install('--dev', ...devDependencies)
  }

  if (answers.sdk) {
    logInfo(badge('init'), 'install sdk')
    await installSdk('vscode')
  }
}
