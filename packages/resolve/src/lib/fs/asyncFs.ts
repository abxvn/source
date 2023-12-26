/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { createReadStream, lstat, realpath, pathExists } from 'fs-extra'
import { createInterface as createLineInterface } from 'readline'
import { resolve as resolvedPath } from 'path'
import type { IFsPathType, IResolveTrace, IResolvedFileType } from '../interfaces'

export { readJSON } from 'fs-extra'

const RELATIVE_PATH_REGEX = /^\.\.?(\/|\\|$)/

export const resolveFromFsPath = async (
  fsPath: string,
  callerPath: string,
  trace?: IResolveTrace
): Promise<string> => {
  try {
    const { path, type } = await getFsPathType(fsPath, callerPath, trace)

    if (type === null) {
      return ''
    } else if (type === 'file') {
      return path
    } else {
      const packageJsonPath = `${path}/package.json`
      let mainFilePath = `${path}/index.js`

      if (await pathExists(packageJsonPath)) {
        const mainConfig = await getJsonData(packageJsonPath, 'main')

        if (mainConfig) {
          mainFilePath = `${path}/${mainConfig}`
        }
      }

      const mainFileExists = await pathExists(mainFilePath)

      trace?.set('fs:main', mainFilePath)
      trace?.set('fs:main:exists', mainFileExists)

      return mainFileExists ? mainFilePath : ''
    }
  } catch (err: any) {
    trace?.set('fs:error', err.message)

    return ''
  }
}

export const getFsPathType = async (
  fsPath: string,
  callerPath: string,
  trace?: IResolveTrace
): Promise<IFsPathType> => {
  const isRelativePath = RELATIVE_PATH_REGEX.test(fsPath)

  let path = fsPath

  if (isRelativePath) {
    path = resolvedPath(callerPath, fsPath)
    trace?.set('fs:relative', path)
  }

  // use `lstat` instead of `stat` to void stats following symlink
  // resulting in isSymbolicLink always return false
  let stats = await lstat(path)
  let type: IResolvedFileType = null

  if (stats.isSymbolicLink()) {
    trace?.set('fs:symlink', true)
    path = await realpath(path)
    stats = await lstat(path)
  }

  if (stats.isDirectory()) {
    trace?.set('fs:type', 'dir')
    type = 'directory'
  } else if (stats.isFile() || stats.isFIFO()) {
    trace?.set('fs:type', 'file')
    type = 'file'
  } else {
    trace?.set('fs:type', 'unknown')
  }

  return {
    path,
    type,
  }
}

export const getJsonData = async (jsonFilePath: string, key: string) => {
  const keyMatchRegex = new RegExp(`"${key}":\\s{0,}"?([^"]+)"?,?`)
  const readStream = createReadStream(jsonFilePath)
  const lines = createLineInterface({
    input: readStream,
    crlfDelay: Infinity, // recognize all instances of CR LF
  })

  for await (const line of lines) {
    const match = line.match(keyMatchRegex)

    if (match) {
      readStream.close()

      return match[1]
    }
  }

  return null
}
