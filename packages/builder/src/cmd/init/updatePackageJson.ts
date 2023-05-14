import chalk from 'chalk'
import { type IConfigEditor, type IConfigDeps } from '../../interfaces'
import { pathExists, readJSON, writeJSON } from '../../lib/vendors'
import { logInfo } from '@abux/logger'
import { logProgress, logStep, logWarn } from './loggers'

interface IUpdatePackageJsonParams {
  modify?: boolean
  deps: IConfigDeps
  editor: IConfigEditor
}
export const updatePackageJson = async ({ modify = true, deps, editor }: IUpdatePackageJsonParams) => {
  const useEslint = deps.requires('eslint')
  const useJest = deps.requires('jest')

  if (!modify) {
    logInfo(chalk.bold.cyan`Recommended further config:`)
    logInfo(`You probably want to add your workspaces path into package.json:
    ${chalk.italic`"workspaces:" [
      "packages/*"
    ]`}`)

    if (useEslint) {
      logInfo(`Essential config for linting command:
      ${chalk.italic`"lint": "eslint packages/**/*.ts"`}`)
    }

    if (useJest) {
      logInfo(`Essential config for testing command:
      ${chalk.italic`"test": "jest"`}`)
    }

    return
  }

  const packagePath = editor.path.resolve('package.json')

  if (!await pathExists(packagePath)) {
    logWarn('package.json not found')

    return
  }

  const json: any = await readJSON(packagePath)
  const scripts = json.scripts || {}
  const workspaces: string[] = json.workspaces || []

  logProgress('config script "start"')
  scripts.start = 'builder build'
  logProgress('config script "build"')
  scripts.build = 'builder build --node-env production'

  if (useEslint) {
    logProgress('config script "lint"')
    scripts.lint = 'eslint packages/**/*.{ts,tsx}'
  }
  if (useJest) {
    logProgress('config script "test"')
    scripts.test = 'jest'
  }

  if (!workspaces.some(w => w.includes('packages/'))) {
    logProgress('config add workspaces')
    workspaces.push('packages/*')
  }

  await writeJSON(packagePath, {
    ...json,
    scripts,
    workspaces
  }, {
    spaces: 2
  })

  logStep('config done')
}
