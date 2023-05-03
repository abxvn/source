import type { IConfigDeps } from '../../interfaces'
import { logInfo } from '../../lib/logger'
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
// INSTALL PACKAGES & SDK
  deps.set('@teku/builder', { version: '^0.0.' })
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
    logInfo('[init] install', mainDependencies.join(' '))
    await install(...mainDependencies)
  }

  if (devDependencies.length) {
    logInfo('[init] install dev', devDependencies.join(' '))
    await install('--dev', ...devDependencies)
  }

  if (answers.sdk) {
    logInfo('[init] install sdk')
    await installSdk('vscode')
  }
}
