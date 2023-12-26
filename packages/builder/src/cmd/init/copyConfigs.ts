/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { copy, pathExists } from '../../lib/vendors'
import { type IConfigEditor, type IConfigDeps } from '../../interfaces'
import { resolver } from '../../lib/paths'
import { type IEditorConfigsAnswer } from '../questions'
import { logProgress, logStep } from './loggers'

const configSource = resolver(__dirname).res('../config')

interface ICopyConfigsParams {
  answers: { editorConfigs: IEditorConfigsAnswer }
  deps: IConfigDeps
  editor: IConfigEditor
}
export const copyConfigs = async ({ answers, deps, editor }: ICopyConfigsParams) => {
  const hasPackagesFolder = await pathExists(editor.path.resolve('packages'))
  const copies: string[] = [
    '.vscode',
    'pnpm-workspace.yaml',
    !hasPackagesFolder ? 'packages/dummy/package.json' : '',
    !hasPackagesFolder ? 'packages/dummy/cli/_index.ts' : '',
    deps.requires('typescript') ? '_tsconfig.json' : '',
    deps.requires('jest') ? '_tests' : '',
    deps.requires('eslint') ? '_.eslintrc.js' : ''
  ].filter(Boolean)

  if (answers.editorConfigs) {
    ['editorconfig', 'gitignore', 'gitattributes'].forEach(name => {
      copies.push(`_/_.${name}`)
    })
  }

  if (!copies.length) {
    return
  }

  logStep('copy configs...')
  const sourcePaths = configSource.resolveList(copies)
  const destPaths = editor.path.resolveList(copies.map(p => p.replace(/\/?_/g, '/')))

  await Promise.all(destPaths.map(async (dest, idx) => {
    logProgress(`copy ${dest}`)
    await copy(sourcePaths[idx], dest)
  }))
}
