import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import { WebpackDtsPlugin } from '@abxvn/webpack-dts'
import generateDts from './generateDts'

describe('generateDts#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, { generateDts })
    prodConfigs = await getMockConfig({ envName: 'production' }, { generateDts })
  })

  it('should add dts plugin to production build only', () => {
    const devPlugins = devConfigs[0].plugins || []
    const prodPlugins = prodConfigs[0].plugins || []

    expect(devPlugins.some(p => p instanceof WebpackDtsPlugin)).toBe(false)
    expect(prodPlugins.some(p => p instanceof WebpackDtsPlugin)).toBe(true)
  })
})
