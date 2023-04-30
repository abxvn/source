import ConfigEditor from '../../src/ConfigEditor'
import type { IFilter, IBuilderOptions } from '../../src/interfaces'

const webEntries = {
  'web/index.ts': {
    import: 'web/index.ts'
  },
  'web/dev/index.ts': {
    import: 'web/dev/index.ts'
  }
}
const nodeEntries = {
  'node/index.ts': {
    import: 'node/index.ts'
  }
}

class MockConfigEditor extends ConfigEditor {
  public get entries () {
    return {
      web: webEntries,
      node: nodeEntries
    }
  }
}

export const getMockConfig = async (
  options?: Partial<IBuilderOptions>,
  filters?: Record<string, IFilter>
) => {
  const editor = new MockConfigEditor('development', __dirname, filters)

  if (options) {
    editor.updateOptions(options)
  }

  await editor.init()

  return editor.configs
}
