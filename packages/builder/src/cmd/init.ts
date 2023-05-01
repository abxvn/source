import { log, logError, logInfo, logSuccess } from '../lib/logger'
import { resolver } from '../lib/paths'
import { path } from './options'
import createEditor from '../createEditor'
import { type IComponentAnswer, components, type ISdkAnswer, ask, sdk } from './questions'
import { getYarnVersion, copy, install, installSdk } from '../lib/packages'

const configSource = resolver(resolver(__dirname).resolve('../config'))

interface IAnswers {
  components?: IComponentAnswer
  sdk?: ISdkAnswer
}

interface IInstalls {
  dev: string[]
  all: string[]
}

const init = async (options: any) => {
  const envName = 'development'
  const editor = await createEditor(options.path, envName)

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
    sdk
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

  logInfo('[init] install components ...')

  // install
  installs.all.length && await install(...installs.all)
  installs.dev.length && await install(...installs.dev)

  const copies: Array<{ from: string, to: string }> = [{
    from: configSource.resolve('.vscode'),
    to: editor.path.resolve('.vscode')
  }]

  if (deps.jest) {
    copies.push({
      from: configSource.resolve('_jest.config.js'),
      to: editor.path.resolve('jest.config.js')
    })
  }

  if (deps.eslint) {
    copies.push({
      from: configSource.resolve('_.eslintrc.js'),
      to: editor.path.resolve('.eslintrc.js')
    })
  }

  if (copies.length) {
    logInfo('[init] copy configs ...')

    await Promise.all(
      copies.map(async ({ from, to }) => {
        logInfo(`[init] copy ${editor.path.relative(to)}`)
        await copy(from, to)
      })
    )
  }
}

export default {
  description: 'Init config folder',
  action: init,
  options: [
    path
  ]
}
