import { realpathSync } from 'fs-extra'
import { resolve as resolvePath } from 'path'
import { resolveRequest } from './resolvers'
import { isPnpEnabled, listModuleDirs, resolvePnpPackage } from './helpers'
import { resolveFromFsPathSync } from './fs/syncFs'

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

describe('resolveRequestSync#file', () => {
  it('should resolve local file', async () => {
    expect(resolveRequest('../../tests/mocks/mockScript.ts', {}, resolveFromFsPathSync))
      .toBe(resolveMockPath('mockScript.ts'))
  })
})

describe('resolveRequestSync#dir', () => {
  it('should resolve local directory with package.json', async () => {
    expect(resolveRequest('../../tests/mocks/mockDirPackage', {}, resolveFromFsPathSync))
      .toBe(resolveMockPath('mockDirPackage/mockCustomIndex.js'))
  })

  it('should resolve local directory with fallback to index.js entry', async () => {
    expect(resolveRequest('../../tests/mocks/mockDir', {}, resolveFromFsPathSync))
      .toBe(resolveMockPath('mockDir/index.js'))
  })
})

describe('resolveRequestSync#withPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(true)
  })

  it('should use pnp api to resolve', async () => {
    jest.spyOn(mockHelpers, 'resolvePnpPackage').mockReturnValueOnce('testPnpPackage/index.js')

    const result = resolveRequest('testPnpPackage', {}, resolveFromFsPathSync)

    expect(result).toBe('testPnpPackage/index.js')
  })

  it('should fallback to using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result = resolveRequest('indexModule', {}, resolveFromFsPathSync)

    expect(result).toBe(resolveMockPath('mockModuleDirs/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result2 = resolveRequest('packageModule', {}, resolveFromFsPathSync)

    expect(result2).toBe(resolveMockPath('mockModuleDirs/packageModule/mockPackageCustomIndex.js'))
  })
})

describe('resolveRequestSync#withoutPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
  })

  it('should resolve using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result = resolveRequest('indexModule', {}, resolveFromFsPathSync)

    expect(result).toBe(resolveMockPath('mockModuleDirs/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModuleDirs')])
    const result2 = resolveRequest('packageModule', {}, resolveFromFsPathSync)

    expect(result2).toBe(resolveMockPath('mockModuleDirs/packageModule/mockPackageCustomIndex.js'))
  })

  it('should resolve using custom modules dirs', async () => {
    const customOptions = {
      moduleDirs: [resolveMockPath('mockModuleCustomDirs')]
    }

    const result = resolveRequest('indexModule', customOptions, resolveFromFsPathSync)

    expect(result).toBe(resolveMockPath('mockModuleCustomDirs/indexModule/index.js'))

    const result2 = resolveRequest('packageModule', customOptions, resolveFromFsPathSync)

    expect(result2).toBe(resolveMockPath('mockModuleCustomDirs/packageModule/mockPackageCustomIndex.js'))
  })
})

describe('resolveRequestSync#withPnpm', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
  })

  it('should resolve using node_modules dirs', async () => {
    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModulePnpm')])
    const result = resolveRequest('indexModule', {}, resolveFromFsPathSync)

    expect(result).toBe(resolveMockPath('mockModulePnpm/.store/indexModule/index.js'))

    jest.spyOn(mockHelpers, 'listModuleDirs').mockReturnValueOnce([resolveMockPath('mockModulePnpm')])
    const result2 = resolveRequest('packageModule', {}, resolveFromFsPathSync)

    expect(result2).toBe(resolveMockPath('mockModulePnpm/.store/packageModule/mockPackageCustomIndex.js'))
  })
})
