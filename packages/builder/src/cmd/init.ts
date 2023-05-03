import chalk from 'chalk'
import { logError, logInfo, logProgress, logSuccess } from '../lib/logger'
import { resolver } from '../lib/paths'
import { copy } from '../lib/helpers'
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
import { getYarnVersion, install, installSdk } from '../lib/packages'
import { type IConfigEditor } from '../interfaces'

interface IAnswers {
  components?: IComponentAnswer
  sdk?: ISdkAnswer
  editorConfigs?: IEditorConfigsAnswer
}

const init = async (options: any) => {
  const envName = 'development'
  const { editor, deps } = await getConfigs(options.path, envName)

  const yarnVersion = await getYarnVersion()

  logInfo('Versions:', 'node', process.versions.node, 'yarn', yarnVersion)

  if (!/^3/.test(yarnVersion)) {
    logError(`
      Please check if Yarn Berry was set up correctly.
      Usually it will be all good by running this command:
      yarn init -2
    `)
  }

  const answers = await ask<IAnswers>({
    components,
    sdk,
    editorConfigs
  })

  components.choices?.forEach(name => {
    if (!answers.components?.includes(name)) {
      deps.unset(name)
    }
  })

  deps.set('@teku/builder', { version: '*' })

  await installPackages(deps.dependencies)

  if (answers.sdk === true) {
    logInfo('[init] install sdk')
    await installSdk('vscode')
  }

  const copies: string[] = [
    '.vscode',
    'packages/dummy/package.json',
    'packages/dummy/cli/_index.ts',
    deps.requires('typescript') ? '_tsconfig.json' : '',
    deps.requires('jest') ? '_jest.config.js' : '',
    deps.requires('eslint') ? '_.eslintrc.js' : ''
  ].filter(Boolean)

  if (answers.editorConfigs) {
    ['editorconfig', 'gitignore', 'gitattributes'].forEach(name => {
      copies.push(`_/_.${name}`)
    })
  }

  if (copies.length) {
    logInfo('[init] copy configs ...')

    await copyConfigs(editor, ...copies)
  }

  logInfo(`You probably want to add your workspaces path into package.json:
  ${chalk.italic`"workspaces:" [
    "packages/*"
  ]`}`)

  if (deps.requires('eslint')) {
    logInfo(`Essential config for linting command:
    ${chalk.italic`"lint": "eslint packages/**/*.ts"`}`)
  }

  if (deps.requires('jest')) {
    logInfo(`Essential config for testing command:
    ${chalk.italic`"test": "jest"`}`)
  }

  logSuccess('[init] done')
}

export default {
  description: 'Init config folder',
  action: init,
  options: [
    path
  ]
}

const configSource = resolver(__dirname).res('../config')
const copyConfigs = async (editor: IConfigEditor, ...subPaths: string[]) => {
  const sourcePaths = configSource.resolveList(subPaths)
  const destPaths = editor.path.resolveList(
    subPaths.map(p => p.replace(/\/?_/g, '/'))
  )

  await Promise.all(destPaths.map(async (dest, idx) => {
    logProgress(`[init] copy ${dest}`)
    await copy(sourcePaths[idx], dest)
  }))
}

const installPackages = async (dependencies: string[], withDevs = true) => {
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

  if (withDevs && devDependencies.length) {
    logInfo('[init] install dev', devDependencies.join(' '))
    await install('--dev', ...devDependencies)
  }
}
