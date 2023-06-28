import { realpathSync } from 'fs-extra'
import { resolve as resolvePath } from 'path'
import { resolveRequest } from './resolvers'
import { isPnpEnabled, listModuleDirs, resolvePnpPackage } from './helpers'
import { resolveFromFsPath } from './fs/asyncFs'

const mockDir = realpathSync(resolvePath(__dirname, '../../tests/mocks')).replace(/\\/g, '/')
const resolveMockPath = (path: string) => resolvePath(mockDir, path)
const mockHelpers = { isPnpEnabled, listModuleDirs, resolvePnpPackage }

jest.mock('./helpers', () => {
  return {
    ...jest.requireActual('./helpers'),
    isPnpEnabled: jest.fn(),
    listModuleDirs: jest.fn(),
    resolvePnpPackage: jest.fn(),
    pnpApi: {
      resolveRequest: () => ''
    }
  }
})

describe('resolveRequest#file', () => {
  it('should resolve local file', async () => {
    expect(await resolveRequest('../../tests/mocks/mockScript.ts', {}, resolveFromFsPath))
      .toBe(resolveMockPath('mockScript.ts'))
  })
})

describe('resolveRequest#dir', () => {
  it('should resolve local directory with package.json', async () => {
    expect(await resolveRequest('../../tests/mocks/mockDirPackage', {}, resolveFromFsPath))
      .toBe(resolveMockPath('mockDirPackage/mockCustomIndex.js'))
  })

  it('should resolve local directory with fallback to index.js entry', async () => {
    expect(await resolveRequest('../../tests/mocks/mockDir', {}, resolveFromFsPath))
      .toBe(resolveMockPath('mockDir/index.js'))
  })
})

describe('resolveRequest#withPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(true)
  })

  it('should use pnp api to resolve', async () => {
    jest.spyOn(mockHelpers, 'resolvePnpPackage').mockReturnValueOnce('testPnpPackage/index.js')

    expect(await resolveRequest('testPnpPackage', {}, resolveFromFsPath))
      .toBe('testPnpPackage/index.js')
  })

  it('should fallback to using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result = await resolveRequest('indexModule', {}, resolveFromFsPath)

    expect(result).toBe(resolveMockPath('mockModuleDirs/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result2 = await resolveRequest('packageModule', {}, resolveFromFsPath)

    expect(result2).toBe(resolveMockPath('mockModuleDirs/packageModule/mockPackageCustomIndex.js'))
  })
})

describe('resolveRequest#withoutPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
  })

  it('should resolve using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result = await resolveRequest('indexModule', {}, resolveFromFsPath)

    expect(result).toBe(resolveMockPath('mockModuleDirs/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result2 = await resolveRequest('packageModule', {}, resolveFromFsPath)

    expect(result2).toBe(resolveMockPath('mockModuleDirs/packageModule/mockPackageCustomIndex.js'))
  })

  it('should resolve using custom modules dirs', async () => {
    const customOptions = {
      moduleDirs: [resolveMockPath('mockModuleCustomDirs')]
    }

    const result = await resolveRequest('indexModule', customOptions, resolveFromFsPath)

    expect(result).toBe(resolveMockPath('mockModuleCustomDirs/indexModule/index.js'))

    const result2 = await resolveRequest('packageModule', customOptions, resolveFromFsPath)

    expect(result2).toBe(resolveMockPath('mockModuleCustomDirs/packageModule/mockPackageCustomIndex.js'))
  })
})

describe('resolveRequest#withPnpm', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
  })

  it('should resolve using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModulePnpm')])
    const result = await resolveRequest('indexModule', {}, resolveFromFsPath)

    expect(result).toBe(resolveMockPath('mockModulePnpm/.store/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModulePnpm')])
    const result2 = await resolveRequest('packageModule', {}, resolveFromFsPath)

    expect(result2).toBe(resolveMockPath('mockModulePnpm/.store/packageModule/mockPackageCustomIndex.js'))
  })
})
