import { map } from '../lib/data'
import type { IFilter } from '../interfaces'
import { WebpackDtsPlugin } from '@abux/webpack-dts'

const generateDts: IFilter = async ({ editor }) => {
  return {
    configs: await map(editor.configs, async config => ({
      ...config,
      plugins: [
        ...config.plugins,
        editor.options.envName === 'production' && new WebpackDtsPlugin(editor.path.rootPath),
      ],
    })),
  }
}

export default generateDts
