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
import { resolveFromFsPath } from './lib/fs/asyncFs'

export const resolve = async (path: string, options?: IResolveOptions): Promise<string> => {
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

    for await (const moduleDir of moduleDirs) {
      const fsPath = await resolveFromFsPath(`${moduleDir}/${path}`, '')

      if (fsPath) {
        return fsPath
      }
    }
  }

  return await resolveFromFsPath(path, callerPath)
}
