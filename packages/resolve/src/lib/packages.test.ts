// import { dirname } from 'path'
import { listModuleDirs } from './packages'
// import { pnpApi } from './pnp'

describe('packages', () => {
  it('should list possible node_modules dirs from a path', () => {
    expect(listModuleDirs('/a/b/c')).toEqual([
      '/a/b/c/node_modules',
      '/a/b/node_modules',
      '/a/node_modules',
      '/node_modules'
    ])

    // windows
    expect(listModuleDirs('D:\\b\\c')).toEqual([
      'D:/b/c/node_modules',
      'D:/b/node_modules',
      'D:/node_modules'
    ])
  })
})
