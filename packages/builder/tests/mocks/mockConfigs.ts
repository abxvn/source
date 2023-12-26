import ConfigEditor from '../../src/ConfigEditor'
import type { IFilter, IBuilderCustomOptions } from '../../src/interfaces'

const webEntries = {
  'web/index.ts': {
    import: 'web/index.ts',
  },
  'web/dev/index.ts': {
    import: 'web/dev/index.ts',
  },
}
const nodeEntries = {
  'node/index.ts': {
    import: 'node/index.ts',
  },
}

class MockConfigEditor extends ConfigEditor {
  public get entries () {
    return {
      web: webEntries,
      node: nodeEntries,
    }
  }
}

export const getMockConfig = async (
  options?: IBuilderCustomOptions,
  filters?: Record<string, IFilter>
) => {
  const editor = new MockConfigEditor({
    envName: 'development',
    rootPath: __dirname,
    filters,
  })

  if (options) {
    editor.updateOptions(options)
  }

  await editor.init()

  return editor.configs
}
