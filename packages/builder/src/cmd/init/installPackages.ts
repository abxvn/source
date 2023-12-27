import { collapsible } from '@abxvn/logger/cli'
import type { IApp, IConfigDeps } from '../../interfaces'
import { type IInstallOptions, install, installSdk } from '../../lib/packages'
import {
  type IComponentAnswer,
  components,
  type ISdkAnswer,
} from '../questions'
import { logProgress, logStep } from './loggers'

interface IInstallPackagesParams {
  answers: { components: IComponentAnswer, sdk?: ISdkAnswer }
  deps: IConfigDeps
  pm?: IInstallOptions['pm']
}
export const installPackages = async ({ answers, deps, pm = 'pnpm' }: IInstallPackagesParams, app: IApp) => {
  deps.set('@abxvn/builder', { version: app.appVersion || '*' })
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

  const outputStream = collapsible(process.stdout)
  const errorStream = collapsible(process.stderr)

  if (mainDependencies.length || devDependencies.length) {
    logStep('install dependencies')
  }

  if (mainDependencies.length) {
    logProgress('install', mainDependencies.join(' '))
    await install(mainDependencies, { outputStream, errorStream, pm })
    outputStream.collapse(true)
    errorStream.collapse(true)
  }

  if (devDependencies.length) {
    logProgress('install dev', devDependencies.join(' '))
    await install(devDependencies, { dev: true, outputStream, errorStream, pm })
    outputStream.collapse(true)
    errorStream.collapse(true)
  }

  if (answers.sdk) {
    logStep('install sdk vscode')
    await installSdk('vscode', { outputStream, errorStream })
    outputStream.collapse(true)
    errorStream.collapse(true)
  }
}
