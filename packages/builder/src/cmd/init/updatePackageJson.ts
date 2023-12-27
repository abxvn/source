import { loggers, styles } from '@abxvn/logger/cli'
import { type IConfigEditor, type IConfigDeps } from '../../interfaces'
import { pathExists, readJSON, writeJSON } from '../../lib/vendors'
import { logProgress, logStep, logWarn } from './loggers'
import { YARN_ENABLED } from '../../lib/packages'

const { italic, bold } = styles
const { info } = loggers

interface IUpdatePackageJsonParams {
  modify?: boolean
  deps: IConfigDeps
  editor: IConfigEditor
}
export const updatePackageJson = async ({ modify = true, deps, editor }: IUpdatePackageJsonParams) => {
  const useEslint = deps.requires('eslint')
  const useJest = deps.requires('jest')

  if (!modify) {
    info(bold.cyan('Recommended further config:'))
    info(`You probably want to add your workspaces path into package.json:
    ${italic(`"workspaces:" [
      "packages/*"
    ]`)}`)

    if (useEslint) {
      info(`Essential config for linting command:
      ${italic('"lint": "eslint packages --ext ts"')}`)
    }

    if (useJest) {
      info(`Essential config for testing command:
      ${italic('"test": "jest -c tests/spec/config.js"')}`)
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
    ...YARN_ENABLED ? workspaces : undefined,
  }, {
    spaces: 2,
  })

  logStep('config done')
}
