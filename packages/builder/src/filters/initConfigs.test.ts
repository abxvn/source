import { type IWebpackConfigs } from '../interfaces'
import { extractPattern } from '../lib/helpers/data'
import { getMockConfig } from '../../tests/mocks/mockConfigs'

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

describe('initConfigs#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, {})
    prodConfigs = await getMockConfig({ envName: 'production' }, {})
  })

  it('should add configs for entries per target', () => {
    expect(devConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining({
        entry: webEntries
      }),
      node: expect.objectContaining({
        entry: nodeEntries
      })
    }))

    expect(prodConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining({
        entry: webEntries
      }),
      node: expect.objectContaining({
        entry: nodeEntries
      })
    }))
  })

  it('should resolve required extensions', () => {
    const resolvedExtensions = {
      resolve: expect.objectContaining({
        extensions: ['.ts', '.js', '.tsx']
      })
    }

    expect(devConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining(resolvedExtensions),
      node: expect.objectContaining(resolvedExtensions)
    }))
    expect(prodConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining(resolvedExtensions),
      node: expect.objectContaining(resolvedExtensions)
    }))
  })

  it('should have rule to process js, ts, tsx', () => {
    const devRules = devConfigs.web.module?.rules || []
    const prodRules = devConfigs.web.module?.rules || []

    expect(devRules.some((rule: any) => extractPattern(rule.test).includes('js|tsx'))).toBe(true)
    expect(prodRules.some((rule: any) => extractPattern(rule.test).includes('js|tsx'))).toBe(true)
  })

  it('should watch during development only', () => {
    expect(devConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining({
        watch: true
      }),
      node: expect.objectContaining({
        watch: true
      })
    }))

    expect(prodConfigs).toEqual(expect.objectContaining({
      web: expect.objectContaining({
        watch: false
      }),
      node: expect.objectContaining({
        watch: false
      })
    }))
  })
})
