import { type IWebpackConfigs } from '../../interfaces'
import { getMockConfig } from '../../../tests/mocks/mockConfigs'
import replaceVars from '.'
import { DefinePlugin } from 'webpack'

describe('replaceVars#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, { replaceVars })
    prodConfigs = await getMockConfig({ envName: 'production' }, { replaceVars })
  })

  it('should add defined vars', () => {
    const devPlugins = devConfigs[0].plugins || []
    const prodPlugins = prodConfigs[1].plugins || []

    expect(devPlugins.some(p => p instanceof DefinePlugin)).toBe(true)
    expect(prodPlugins.some(p => p instanceof DefinePlugin)).toBe(true)
  })
})
