import { type IWebpackConfigs } from '../interfaces'
import { getMockConfig } from '../../tests/mocks/mockConfigs'
import replaceImports from './replaceImports'
import ImportReplacementPlugin from '../plugins/ImportReplacementPlugin'

describe('replaceImports#configs', () => {
  let devConfigs: IWebpackConfigs
  let prodConfigs: IWebpackConfigs
  const replacements = [
    {
      map: {},
      pattern: '**'
    }
  ]

  beforeAll(async () => {
    devConfigs = await getMockConfig({ envName: 'development', replacements }, { replaceImports })
    prodConfigs = await getMockConfig({ envName: 'production', replacements }, { replaceImports })
  })

  it('should add replacement import plugins if requirements provided', () => {
    const devPlugins = devConfigs.web.plugins || []
    const prodPlugins = prodConfigs.web.plugins || []

    expect(devPlugins.some(p => p instanceof ImportReplacementPlugin)).toBe(true)
    expect(prodPlugins.some(p => p instanceof ImportReplacementPlugin)).toBe(true)
  })
})
