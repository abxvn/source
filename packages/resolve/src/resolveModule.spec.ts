import { realpathSync } from 'fs-extra'
import { resolve as resolvePath } from 'path'
import { isPnpEnabled, listModuleDirs, resolvePnpPackage } from './lib/helpers'
import { resolveModule } from './resolveModule'
import { readJSON } from './lib/fs/asyncFs'

const mockDir = realpathSync(resolvePath(__dirname, '../tests/mocks')).replace(/\\/g, '/')
const resolveMockPath = (path: string) => resolvePath(mockDir, path)
const mockHelpers = { isPnpEnabled, listModuleDirs, readJSON, resolvePnpPackage }

jest.mock('./lib/helpers', () => {
  return {
    ...jest.requireActual('./lib/helpers'),
    isPnpEnabled: jest.fn(),
    listModuleDirs: jest.fn(),
    resolvePnpPackage: jest.fn(),
    pnpApi: {
      resolveRequest: () => ''
    }
  }
})

describe('resolveModule#dir', () => {
  it('should resolve local directory with package.json', async () => {
    const result = await resolveModule('../tests/mocks/mockDirPackage', { callerPath: __dirname })

    expect(result).toMatchObject({
      exists: true,
      main: 'mockCustomIndex.js'
    })
  })

  it('shouldn\'t resolve local directory without package.json', async () => {
    expect(await resolveModule('../tests/mocks/mockDir')).toMatchObject({
      exists: false
    })
  })
})

describe('resolveModule#withPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(true)
  })

  it('should use pnp api to resolve', async () => {
    jest.spyOn(mockHelpers, 'resolvePnpPackage').mockReturnValueOnce(
      resolveMockPath('mockModuleDirs/packageModule/package.json')
    )

    const result = await resolveModule('testPnpPackage', { callerPath: __dirname })

    expect(result).toMatchObject({
      exists: true,
      main: 'mockPackageCustomIndex.js'
    })
  })
})

describe('resolveModule#withoutPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
    jest.spyOn(mockHelpers, 'listModuleDirs')
      .mockImplementation(() => [resolveMockPath('mockModuleDirs')])
  })

  it('should resolve using node_modules dirs', async () => {
    expect(await resolveModule('packageModule'))
      .toMatchObject({
        exists: true,
        main: 'mockPackageCustomIndex.js'
      })
  })

  it('should resolve using custom modules dirs', async () => {
    const customOptions = {
      moduleDirs: [resolveMockPath('mockModuleCustomDirs')]
    }

    expect(await resolveModule('packageModule', customOptions))
      .toMatchObject({
        exists: true,
        main: 'mockPackageCustomIndex.js'
      })
  })
})

describe('resolveModule#withPnpm', () => {
  beforeAll(() => {
    jest.spyOn(mockHelpers, 'isPnpEnabled').mockReturnValue(false)
    jest.spyOn(mockHelpers, 'listModuleDirs').mockImplementation(() => [resolveMockPath('mockModulePnpm')])
  })

  it('should resolve using node_modules dirs', async () => {
    expect(await resolveModule('packageModule'))
      .toMatchObject({
        exists: true,
        main: 'mockPackageCustomIndex.js'
      })
  })
})
