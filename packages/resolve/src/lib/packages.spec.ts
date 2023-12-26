// import { dirname } from 'path'
import { listModuleDirs } from './packages'
// import { pnpApi } from './pnp'

describe('packages', () => {
  it('should list possible node_modules dirs from a path', () => {
    expect(listModuleDirs('/a11/b11/c11')).toEqual([
      '/a11/b11/c11/node_modules',
      '/a11/b11/node_modules',
      '/a11/node_modules',
      '/node_modules'
    ])

    // windows
    expect(listModuleDirs('D:\\b22\\c22')).toEqual([
      'D:/b22/c22/node_modules',
      'D:/b22/node_modules',
      'D:/node_modules'
    ])
  })
})
