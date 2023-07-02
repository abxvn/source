import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import unbundleExternals from './unbundleExternals'

describe('unbundleExternals#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, { unbundleExternals })
    prodConfigs = await getMockConfig({ envName: 'production' }, { unbundleExternals })
  })

  it('should unbundle externals for node builds only', () => {
    const devWebExtenals = devConfigs[0].externals || []
    const devNodeExtenals = devConfigs[1].externals || []
    const prodWebExtenals = prodConfigs[0].externals || []
    const prodNodeExtenals = prodConfigs[1].externals || []

    expect(devWebExtenals).toHaveLength(0)
    expect(prodWebExtenals).toHaveLength(0)

    expect(devNodeExtenals.length).toBeGreaterThan(0)
    expect(prodNodeExtenals.length).toBeGreaterThan(0)
  })
})
