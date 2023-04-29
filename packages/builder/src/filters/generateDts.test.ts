import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import DtsPlugin from '../plugins/DtsPlugin'
import generateDts from './generateDts'

describe('generateDts#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development' }, { generateDts })
    prodConfigs = await getMockConfig({ envName: 'production' }, { generateDts })
  })

  it('should add dts plugin to production build only', () => {
    const devPlugins = devConfigs.web.plugins || []
    const prodPlugins = prodConfigs.web.plugins || []

    expect(devPlugins.some(p => p instanceof DtsPlugin)).toBe(false)
    expect(prodPlugins.some(p => p instanceof DtsPlugin)).toBe(true)
  })
})
