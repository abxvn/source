import { map } from '../lib/data'
import type { IFilter } from '../interfaces'
import { DtsPlugin } from '@abux/builder/src/plugins/DtsPlugin/index.js'

const generateDts: IFilter = async ({ editor }) => {
  return {
    configs: await map(editor.configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        editor.options.envName === 'production' && new DtsPlugin(editor.path.rootPath)
      ]
    }))
  }
}

export default generateDts
