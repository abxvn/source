import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import devServer from './devServer'

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
    devDevConfigs = await getMockConfig({ envName: 'development' }, { devServer })
  })

  it('should remove dev entries for normal builds', () => {
    expect(devConfigs[0].entry).toEqual(nonDevWebEntries)
    expect(prodConfigs[0].entry).toEqual(nonDevWebEntries)
  })

  it('should remove non dev entries for dev builds', () => {
    expect(devDevConfigs).not.toHaveProperty('web')
  })

  it('should add config for dev builds', () => {
    expect(devDevConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        devServer: expect.any(Object)
      })
    ]))
  })
})
