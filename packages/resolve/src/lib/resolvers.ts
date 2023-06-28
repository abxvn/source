/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { IMaybePromise, IResolveOptions, IResolveTrace } from './interfaces'
import {
  isLocalMatch,
  listModuleDirs,
  npmGlobalPackageDir,
  yarnGlobalPackageDir,
  isBuiltin,
  resolvePnpPackage,
  getCallerPath,
  isPnpEnabled
} from './helpers'

export const resolveRequest = (
  path: string,
  options: IResolveOptions,
  fsResolver: (path: string, caller: string, trace?: IResolveTrace) => IMaybePromise<string>,
  trace?: IResolveTrace
): IMaybePromise<string> => {
  trace?.set('request', path)

  if (isBuiltin(path)) {
    trace?.set('builtin', true)

    return path
  }

  const usePnpFallback = options?.usePnpFallback || true
  let callerPath = options?.callerPath as string // will fallback to cwd
  let moduleDirs = options?.moduleDirs?.slice() || []

  if (!callerPath) {
    callerPath = getCallerPath()
  }

  if (!callerPath) {
    callerPath = process.cwd()
  }

  trace?.set('caller', callerPath)
  trace?.set('pnp', false)

  // possibly an installed dependencies
  if (!isLocalMatch(path)) {
    if (isPnpEnabled()) {
      trace?.set('pnp', true)
      trace?.set('pnp:fallback', true)
      const fsPath = resolvePnpPackage(path, callerPath)

      if (fsPath) {
        trace?.set('pnp:fallback', false)

        return fsPath
      }

      if (!usePnpFallback) {
        trace?.set('pnp:fallback', false)

        // fallback is disabled by options
        return ''
      }
    }

    if (!moduleDirs.length) {
      moduleDirs = listModuleDirs(callerPath)
      moduleDirs.push(yarnGlobalPackageDir)
      moduleDirs.push(npmGlobalPackageDir)
    }

    trace?.set('package', true)
    trace?.set('package:dirs', moduleDirs)
    trace?.set('package:async', true)

    const searchedModulePaths = moduleDirs.map(moduleDir => `${moduleDir}/${path}`)
    const firstModuleDirResult = fsResolver(searchedModulePaths.shift() as string, '', trace)

    if (firstModuleDirResult instanceof Promise) { // async resolver
      return searchedModulePaths.reduce(async (resolves, searchPath) => {
        const fsPath = await resolves

        if (fsPath) {
          return fsPath
        } else {
          return await fsResolver(searchPath, '', trace)
        }
      }, firstModuleDirResult)
    }

    trace?.set('package:async', false)

    for (const moduleDir of moduleDirs) { // sync resolver
      const fsPath = fsResolver(`${moduleDir}/${path}`, '', trace) as string

      if (fsPath) {
        return fsPath
      }
    }

    return ''
  }

  trace?.set('local', true)

  return fsResolver(path, callerPath, trace)
}
