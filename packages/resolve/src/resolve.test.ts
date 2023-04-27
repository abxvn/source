import { realpathSync } from 'fs-extra'
import { resolve as resolvePath } from 'path'
import { resolve } from './resolve'
import { isPnpEnabled, listModuleDirs } from './lib'

const mockDir = realpathSync(resolvePath(__dirname, '../tests/mocks')).replace(/\\/g, '/')
const resolveMockPath = (path: string) => resolvePath(mockDir, path)
const mockLib = { isPnpEnabled, listModuleDirs }

jest.mock('./lib', () => {
  return {
    ...jest.requireActual('./lib'),
    isPnpEnabled: jest.fn(),
    listModuleDirs: jest.fn(),
    pnpApi: {
      resolveRequest: () => 'testPnpPackage/index.js'
    }
  }
})

describe('resolve#file', () => {
  it('should resolve local file', async () => {
    expect(await resolve('../tests/mocks/mockScript.ts'))
      .toBe(resolveMockPath('mockScript.ts'))

    expect(await resolve('../tests/mocks/mockScript.js'))
      .toBe(resolveMockPath('mockScript.js'))
  })
})

describe('resolve#dir', () => {
  it('should resolve local directory with package.json', async () => {
    expect(await resolve('../tests/mocks/mockDirPackage'))
      .toBe(resolveMockPath('mockDirPackage/mockCustomIndex.js'))
  })

  it('should resolve local directory with fallback to index.js entry', async () => {
    expect(await resolve('../tests/mocks/mockDir'))
      .toBe(resolveMockPath('mockDir/index.js'))
  })
})

describe('resolve#withPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockLib, 'isPnpEnabled').mockReturnValue(true)
  })

  it('should use pnp api to resolve', async () => {
    expect(await resolve('testPnpPackage'))
      .toBe('testPnpPackage/index.js')
  })
})

describe('resolve#withoutPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockLib, 'isPnpEnabled').mockReturnValue(false)
    jest.spyOn(mockLib, 'listModuleDirs').mockImplementation(() => [resolveMockPath('mockModuleDirs')])
  })

  it('should resolve using node_modules dirs', async () => {
    expect(await resolve('indexModule'))
      .toBe(resolveMockPath('mockModuleDirs/indexModule/index.js'))
    expect(await resolve('packageModule'))
      .toBe(resolveMockPath('mockModuleDirs/packageModule/mockCustomIndex.js'))
  })

  it('should resolve using custom modules dirs', async () => {
    const customOptions = {
      moduleDirs: [resolveMockPath('mockModuleCustomDirs')]
    }

    expect(await resolve('indexModule', customOptions))
      .toBe(resolveMockPath('mockModuleCustomDirs/indexModule/index.js'))
    expect(await resolve('packageModule', customOptions))
      .toBe(resolveMockPath('mockModuleCustomDirs/packageModule/mockCustomIndex.js'))
  })
})
