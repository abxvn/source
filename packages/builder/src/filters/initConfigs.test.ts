import { type IWebpackConfigs } from '../interfaces'
import { extractPattern } from '../lib/data'
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
    expect(devConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        entry: webEntries,
        target: 'web'
      }),
      expect.objectContaining({
        entry: nodeEntries,
        target: 'node'
      })
    ]))

    expect(prodConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'web',
        entry: webEntries
      }),
      expect.objectContaining({
        target: 'node',
        entry: nodeEntries
      })
    ]))
  })

  it('should resolve required extensions', () => {
    const resolvedExtensions = {
      resolve: expect.objectContaining({
        extensions: ['.ts', '.js', '.tsx']
      })
    }

    expect(devConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ...resolvedExtensions,
        target: 'web'
      }),
      expect.objectContaining({
        ...resolvedExtensions,
        target: 'node'
      })
    ]))
    expect(prodConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ...resolvedExtensions,
        target: 'web'
      }),
      expect.objectContaining({
        ...resolvedExtensions,
        target: 'node'
      })
    ]))
  })

  it('should have rule to process js, ts, tsx', () => {
    const devRules = devConfigs[0].module?.rules || []
    const prodRules = prodConfigs[0].module?.rules || []

    expect(devRules.some((rule: any) => extractPattern(rule.test).includes('js|tsx'))).toBe(true)
    expect(prodRules.some((rule: any) => extractPattern(rule.test).includes('js|tsx'))).toBe(true)
  })

  it('should watch during development only', () => {
    expect(devConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        watch: true,
        target: 'web'
      }),
      expect.objectContaining({
        watch: true,
        target: 'node'
      })
    ]))

    expect(prodConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        watch: false,
        target: 'web'
      }),
      expect.objectContaining({
        watch: false,
        target: 'node'
      })
    ]))
  })
})
