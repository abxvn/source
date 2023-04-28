import type { IResolveOptions } from './interfaces'
import {
  isLocalMatch,
  listModuleDirs,
  npmGlobalPackageDir,
  yarnGlobalPackageDir,
  isBuiltin,
  isPnpEnabled,
  pnpApi,
  getCallerPath,
  resolveFromFsPathSync
} from './lib'

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
      const fsPath = resolveFromFsPathSync(`${moduleDir}/${path}`, '')

      if (fsPath) {
        return fsPath
      }
    }
  }

  return resolveFromFsPathSync(path, callerPath)
}
