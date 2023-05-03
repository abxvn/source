import type { IBuildEnvironment, IConfigEditor, IWebpackConfig } from './interfaces'

import ConfigEditor from './ConfigEditor'
import { pathExists } from 'fs-extra'
import chalk from 'chalk'

export const getConfigs = async (
  rootPath: string,
  envName: IBuildEnvironment = 'development'
): Promise<{
  editor: IConfigEditor
  configs: IWebpackConfig[]
}> => {
  const editor = new ConfigEditor(envName, rootPath)
  const customConfigFile = editor.path.resolve('teku.config.js')

  addDefaultDeps(editor)

  if (await pathExists(customConfigFile)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customConfig = require(customConfigFile)

    if (customConfig.options) {
      editor.updateOptions(customConfig.options)
    }

    if (customConfig.custom && typeof customConfig.custom === 'function') {
      await customConfig.custom(editor)
    }
  }

  await editor.init()

  const configs = editor.configs

  return {
    editor,
    configs: Object.keys(configs).map(configName => Object.assign(configs[configName], {
      name: chalk.bold.underline.greenBright(configName),
      plugins: configs[configName].plugins.filter(Boolean)
    }))
  }
}

const addDefaultDeps = (editor: IConfigEditor) => {
  editor.dep('typescript', '^5.0.4')
  editor.dep('webpack', '^5.80.0')

  const eslint = editor.dep('eslint', '^8.39.0')

  eslint.dev = true
  eslint.dependencies = [
    { name: '@typescript-eslint/eslint-plugin', version: '^5.59.1' },
    { name: '@typescript-eslint/parser', version: '^5.59.1' },
    { name: 'eslint', version: '^8.39.0' },
    { name: 'eslint-config-standard', version: '^17.0.0' },
    { name: 'eslint-config-standard-with-typescript', version: '^34.0.1' },
    { name: 'eslint-plugin-import', version: '^2.27.5' },
    { name: 'eslint-plugin-jest', version: '^27.2.1' },
    { name: 'eslint-plugin-n', version: '^15.7.0' },
    { name: 'eslint-plugin-promise', version: '^6.1.1' }
  ]

  const jest = editor.dep('jest', '^29.5.0')

  jest.dev = true
  jest.dependencies = [
    { name: 'ts-jest', version: '^29.1.0' }
  ]
}
