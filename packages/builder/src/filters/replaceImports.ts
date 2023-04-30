import { map } from '../lib/helpers'
import type { IFilter } from '../interfaces'
import ImportReplacementPlugin from '../plugins/ImportReplacementPlugin'

const replaceImports: IFilter = async ({ editor }) => {
  if (!editor.options.replacements) {
    return {
      configs: editor.configs
    }
  }

  return {
    configs: await map(editor.configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        ...editor.options.replacements.map(({ pattern, map }) =>
          new ImportReplacementPlugin(map, pattern)
        )
      ]
    }))
  }
}

export default replaceImports
