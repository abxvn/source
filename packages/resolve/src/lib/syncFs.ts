import { resolve as resolvedPath } from 'path'
import type { IFsPathType, IResolvedFileType } from '../interfaces'
import { realpathSync, statSync, readJSONSync, pathExistsSync } from 'fs-extra'

const RELATIVE_PATH_REGEX = /^\.\.?(\/|\\|$)/

export const resolveFromFsPathSync = (fsPath: string, callerPath: string): string => {
  try {
    const { path, type } = getFsPathTypeSync(fsPath, callerPath)

    if (type === null) {
      return ''
    } else if (type === 'file') {
      return path
    } else {
      const packageJsonPath = `${path}/package.json`
      let mainFilePath = `${path}/index.js`

      if (pathExistsSync(packageJsonPath)) {
        const packageJson = readJSONSync(packageJsonPath)
        const mainConfig: string | undefined = packageJson?.main

        if (mainConfig) {
          mainFilePath = `${path}/${mainConfig}`
        }
      }

      if (pathExistsSync(mainFilePath)) {
        return mainFilePath
      }

      return ''
    }
  } catch (err) {
    return ''
  }
}

export const getFsPathTypeSync = (fsPath: string, callerPath: string): IFsPathType => {
  const isRelativePath = RELATIVE_PATH_REGEX.test(fsPath)

  let path = fsPath

  if (isRelativePath) {
    path = resolvedPath(callerPath, fsPath)
  }

  let stats = statSync(path)
  let type: IResolvedFileType = null

  if (stats.isSymbolicLink()) {
    path = realpathSync(path)
    stats = statSync(path)
  }

  if (stats.isDirectory()) {
    type = 'directory'
  } else if (stats.isFile() || stats.isFIFO()) {
    type = 'file'
  }

  return {
    path,
    type
  }
}
