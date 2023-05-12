import { copy } from '../../lib/helpers/vendors'
import { type IConfigEditor, type IConfigDeps } from '../../interfaces'
import { badge, logInfo, logProgress } from '../../lib/logger'
import { resolver } from '../../lib/paths'
import { type IEditorConfigsAnswer } from '../questions'

const configSource = resolver(__dirname).res('../config')

interface ICopyConfigsParams {
  answers: { editorConfigs: IEditorConfigsAnswer }
  deps: IConfigDeps
  editor: IConfigEditor
}
export const copyConfigs = async ({ answers, deps, editor }: ICopyConfigsParams) => {
  const copies: string[] = [
    '.vscode',
    'packages/dummy/package.json',
    'packages/dummy/cli/_index.ts',
    '_.yarnrc.yml',
    deps.requires('typescript') ? '_tsconfig.json' : '',
    deps.requires('jest') ? '_jest.config.js' : '',
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

  logInfo(badge('init'), 'copy configs...')
  const sourcePaths = configSource.resolveList(copies)
  const destPaths = editor.path.resolveList(copies.map(p => p.replace(/\/?_/g, '/')))

  await Promise.all(destPaths.map(async (dest, idx) => {
    logProgress(badge('init'), `copy ${dest}`)
    await copy(sourcePaths[idx], dest)
  }))
}
