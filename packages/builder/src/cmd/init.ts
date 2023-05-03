import { logError, logInfo, logProgress, logSuccess } from '../lib/logger'
import { resolver } from '../lib/paths'
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
import { getYarnVersion, copy, install, installSdk } from '../lib/packages'
import { type IConfigEditor } from '../interfaces'
import chalk from 'chalk'

interface IAnswers {
  components?: IComponentAnswer
  sdk?: ISdkAnswer
  editorConfigs?: IEditorConfigsAnswer
}

interface IInstalls {
  dev: string[]
  all: string[]
}

const init = async (options: any) => {
  const envName = 'development'
  const { editor } = await getConfigs(options.path, envName)

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
      editor.dep(name, '')
    }
  })

  const deps = editor.getDeps()
  const installs = Object.values(deps).reduce<IInstalls>((installs, { name, version, dev }) => {
    if (dev) {
      installs.dev.push(`${name}@${version}`)
    } else {
      installs.all.push(`${name}@${version}`)
    }

    return installs
  }, {
    all: [],
    dev: []
  })

  installs.all.push('@teku/builder')

  await installPackages(installs)

  if (answers.sdk === true) {
    logInfo('[init] install sdk')
    await installSdk('vscode')
  }

  const copies: string[] = [
    '.vscode',
    'packages/dummy/package.json',
    'packages/dummy/cli/_index.ts'
  ]

  if (deps.typescript) {
    copies.push('_tsconfig.json')
  }

  if (deps.jest) {
    copies.push('_jest.config.js')
  }

  if (deps.eslint) {
    copies.push('_.eslintrc.js')
  }

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

  if (deps.eslint) {
    logInfo(`Essential config for linting command:
    ${chalk.italic`"lint": "eslint packages/**/*.ts"`}`)
  }

  if (deps.jest) {
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

const installPackages = async (installs: IInstalls) => {
  if (installs.all.length && installs.dev.length) {
    logInfo('[init] install components ...')
  }

  // install
  if (installs.all.length) {
    logInfo('[init] install', installs.all.join(' '))
    await install(...installs.all)
  }

  if (installs.dev.length) {
    logInfo('[init] install dev', installs.dev.join(' '))
    await install('--dev', ...installs.dev)
  }
}
