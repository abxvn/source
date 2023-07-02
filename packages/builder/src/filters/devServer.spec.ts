import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import devServer from './devServer'
import { pathExists } from '../lib/vendors'

const mockVendors = { pathExists }

jest.mock('../lib/vendors', () => {
  return {
    ...jest.requireActual('../lib/vendors'),
    pathExists: jest.fn()
  }
})

const nonDevWebEntries = {
  'web/index.ts': {
    import: 'web/index.ts'
  }
}

describe('generateDts#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs
  let devDevConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, { devServer })
    prodConfigs = await getMockConfig({ envName: 'production' }, { devServer })

    process.env.WEBPACK_SERVE = 'true'
    jest.spyOn(mockVendors, 'pathExists').mockImplementationOnce(() => true)
    devDevConfigs = await getMockConfig({ envName: 'development' }, { devServer })
  })

  it('should remove dev entries for normal builds', () => {
    expect(devConfigs[0].entry).toEqual(nonDevWebEntries)
    expect(prodConfigs[0].entry).toEqual(nonDevWebEntries)
  })

  it('should remove non dev entries for dev builds', () => {
    expect(devDevConfigs).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'web'
      })
    ]))
  })

  it('should add config for dev builds', () => {
    expect(devDevConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        devServer: expect.any(Object)
      })
    ]))
  })
})
