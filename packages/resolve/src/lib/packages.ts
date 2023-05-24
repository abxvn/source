/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { npm, yarn } from 'global-dirs'
import { isAbsolute } from 'path'

export { isBuiltin } from 'module'

const normalizePath = (path: string) => path.replace(/\\/g, '/')

export const npmGlobalPackageDir = normalizePath(npm.packages)
export const yarnGlobalPackageDir = normalizePath(yarn.packages)

const FS_PATH_MODULE_REGEX = /^([A-Za-z]:)?(\.\.?(\/|$)|\/)/
const isWindowsFullPath = (path: string) => /^[A-Za-z]:/.test(path)

export const isLocalMatch = (path: string) => FS_PATH_MODULE_REGEX.test(path) || isAbsolute(path)

// List node_nodules dirs up to root dir, hoisting behavior of nodejs
// double slash \\ imports is deprecated, see: https://nodejs.org/api/all.html#DEP0166
// won't work with pnp api
export const listModuleDirs = (fullPath: string) => {
  const path = normalizePath(fullPath)
  const moduleDirs = []

  const pathWalkRegex = /[A-Za-z]:|\/[^/]+?/g
  let rebuiltPath = ''
  let match = pathWalkRegex.exec(path)

  while (match) {
    rebuiltPath += match[0]
    moduleDirs.push(`${rebuiltPath}/node_modules`)
    match = pathWalkRegex.exec(path)
  }

  const reversedModuleDirs = moduleDirs.reverse()

  if (!isWindowsFullPath(path)) {
    reversedModuleDirs.push('/node_modules')
  }

  return reversedModuleDirs
}
