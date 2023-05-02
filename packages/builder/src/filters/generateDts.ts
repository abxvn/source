import { map } from '../lib/helpers'
import type { IFilter } from '../interfaces'
import DtsPlugin from '../plugins/DtsPlugin'

const generateDts: IFilter = async ({ editor }) => {
  return {
    configs: await map(editor.configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        editor.options.envName === 'production' && new DtsPlugin(editor.path)
      ]
    }))
  }
}

export default generateDts