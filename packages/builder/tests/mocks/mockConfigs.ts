import initConfigs from '../../src/filters/initConfigs'
import type { IWebpackConfig, IFilter, IBuilderOptions } from '../../src/interfaces'
import { resolver } from '../../src/lib/paths'

const webEntries = {
  'web/index.ts': {
    import: 'web/index.ts'
  },
  'web/dev/.index.ts': {
    import: 'web/dev/index.ts'
  }
}
const nodeEntries = {
  'node/index.ts': {
    import: 'node/index.ts'
  }
}

export const getMockConfig = async (
  options?: Partial<IBuilderOptions>,
  filters: Record<string, IFilter> = {}
) => {
  const buildOptions: IBuilderOptions = {
    envName: 'development',
    path: resolver(__dirname),
    targetEntries: {
      web: webEntries,
      node: nodeEntries
    },
    ...options
  }

  const processes = [
    initConfigs,
    ...Object.values(filters)
  ]

  const configs = await processes.reduce<Promise<Record<string, IWebpackConfig>>>(
    async (chain, filter) => {
      const configs = await chain
      const filterOutput = await filter(configs, buildOptions)

      return filterOutput.configs
    },
    Promise.resolve({})
  )

  return configs
}
