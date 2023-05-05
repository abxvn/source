import { realpathSync } from 'fs-extra'
import { resolve as resolvePath } from 'path'
import { isPnpEnabled, listModuleDirs, pnpApi } from './lib'
import { resolveModule } from './resolveModule'
import { readJSON } from './lib/fs/asyncFs'

const mockDir = realpathSync(resolvePath(__dirname, '../tests/mocks')).replace(/\\/g, '/')
const resolveMockPath = (path: string) => resolvePath(mockDir, path)
const mockLib = { isPnpEnabled, listModuleDirs, readJSON, pnpApi }

jest.mock('./lib', () => {
  return {
    ...jest.requireActual('./lib'),
    isPnpEnabled: jest.fn(),
    listModuleDirs: jest.fn(),
    pnpApi: {
      resolveRequest: () => resolveMockPath('mockModuleDirs/packageModule/package.json')
    }
  }
})

describe('resolveModule#dir', () => {
  it('should resolve local directory with package.json', async () => {
    expect(await resolveModule('../tests/mocks/mockDirPackage')).toMatchObject({
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
    jest.spyOn(mockLib, 'isPnpEnabled').mockReturnValue(true)
  })

  it('should use pnp api to resolve', async () => {
    expect(await resolveModule('testPnpPackage'))
      .toMatchObject({
        exists: true,
        main: 'mockPackageCustomIndex.js'
      })
  })
})

describe('resolveModule#withoutPnp', () => {
  beforeAll(() => {
    jest.spyOn(mockLib, 'isPnpEnabled').mockReturnValue(false)
    jest.spyOn(mockLib, 'listModuleDirs')
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
