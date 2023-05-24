/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { IResolveOptions } from './interfaces'
import {
  isLocalMatch,
  listModuleDirs,
  npmGlobalPackageDir,
  yarnGlobalPackageDir,
  isBuiltin,
  isPnpEnabled,
  pnpApi,
  getCallerPath
} from './lib'
import {
  resolveFromFsPathSync as resolveFromFsPath
} from './lib/fs/syncFs'

export const resolveSync = (path: string, options?: IResolveOptions): string => {
  if (isBuiltin(path)) {
    return path
  }

  let callerPath = options?.callerPath
  let moduleDirs = options?.moduleDirs

  if (!callerPath) {
    callerPath = getCallerPath() || process.cwd()
  }

  // possibly an installed dependencies
  if (!isLocalMatch(path)) {
    if (isPnpEnabled()) {
      return pnpApi?.resolveRequest(path, callerPath) || ''
    }

    if (!moduleDirs) {
      moduleDirs = listModuleDirs(path)
      moduleDirs.push(yarnGlobalPackageDir)
      moduleDirs.push(npmGlobalPackageDir)
    }

    for (const moduleDir of moduleDirs) {
      const fsPath = resolveFromFsPath(`${moduleDir}/${path}`, '')

      if (fsPath) {
        return fsPath
      }
    }
  }

  return resolveFromFsPath(path, callerPath)
}
