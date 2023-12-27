import type { IBuildEnvironment, IBuilderCustomOptions, IConfigDeps, IConfigEditor, IWebpackConfig } from './interfaces'

import ConfigEditor from './ConfigEditor'
import { pathExists } from './lib/vendors'
import { styles } from '@abxvn/logger/cli'
import ConfigDeps from './ConfigDeps'
import { moduleFromFile } from './lib/packages'

interface IConfigCustom {
  options: IBuilderCustomOptions
}

export const getConfigs = async (
  rootPath: string,
  envName: IBuildEnvironment = 'development',
  custom?: IConfigCustom
): Promise<{
  deps: IConfigDeps
  editor: IConfigEditor
  configs: IWebpackConfig[]
}> => {
  const deps = new ConfigDeps()
  const editor = new ConfigEditor({ envName, rootPath, deps })
  const customizerFile = editor.path.resolve('abx.config.js')

  addDefaultDeps(deps)

  if (custom?.options) {
    editor.updateOptions(custom.options)
  }

  if (await pathExists(customizerFile)) {
    // since nodejs built-in `require` doesn't work with local js file:
    // - access from folder outside yarn pnp managed workspaces
    // - access from installed packages with yarn pnp (in zip folders in .yarn/cache)
    // we need to load code from text file instead
    const customConfig = await moduleFromFile(customizerFile)

    if (customConfig.options) {
      editor.updateOptions(customConfig.options)
    }

    if (customConfig.filter && typeof customConfig.filter === 'function') {
      editor.filter('workspace:custom', customConfig.filter)
    }
  }

  await editor.init()

  const configs = editor.configs

  return {
    deps,
    editor,
    configs: configs.map(config => ({
      ...config,
      name: styles.bold.underline.greenBright(config.name),
      plugins: config.plugins.filter(Boolean),
    })),
  }
}

const addDefaultDeps = (deps: IConfigDeps) => {
  deps.set('cross-env', { version: '^7.0.3' })
  deps.set('typescript', { version: '~5.0.4' })
  deps.set('webpack', { version: '^5.89.0' })
  deps.set('eslint', {
    version: '^8.56.0',
    dev: true,
    dependencies: [
      { name: '@typescript-eslint/eslint-plugin', version: '^6.16.0' },
      { name: '@typescript-eslint/parser', version: '^6.16.0' },
      { name: 'eslint-config-standard', version: '^17.1.0' },
      { name: 'eslint-config-standard-jsx', version: '^11.0.0' },
      { name: 'eslint-config-standard-with-typescript', version: '^40.0.0' },
      { name: 'eslint-plugin-import', version: '^2.29.1' },
      { name: 'eslint-plugin-jest', version: '^27.6.0' },
      { name: 'eslint-plugin-n', version: '^16.5.0' },
      { name: 'eslint-plugin-promise', version: '^6.1.1' },
    ],
  })
  deps.set('jest', {
    version: '^29.7.0',
    dev: true,
    dependencies: [
      { name: '@jest/globals', version: '^29.7.0' },
      { name: '@types/jest', version: '^29.5.11' },
      { name: 'ts-jest', version: '^29.1.1' },
    ],
  })
}
