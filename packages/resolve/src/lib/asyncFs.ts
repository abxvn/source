import { createReadStream, stat, realpath, pathExists } from 'fs-extra'
import { createInterface as createLineInterface } from 'readline'
import { resolve as resolvedPath } from 'path'
import type { IFsPathType, IResolvedFileType } from '../interfaces'

const RELATIVE_PATH_REGEX = /^\.\.?(\/|\\|$)/

export const resolveFromFsPath = async (fsPath: string, callerPath: string): Promise<string> => {
  try {
    const { path, type } = await getFsPathType(fsPath, callerPath)

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

      if (await pathExists(mainFilePath)) {
        return mainFilePath
      }

      return ''
    }
  } catch (err) {
    return ''
  }
}

export const getFsPathType = async (fsPath: string, callerPath: string): Promise<IFsPathType> => {
  const isRelativePath = RELATIVE_PATH_REGEX.test(fsPath)

  let path = fsPath

  if (isRelativePath) {
    path = resolvedPath(callerPath, fsPath)
  }

  let stats = await stat(path)
  let type: IResolvedFileType = null

  if (stats.isSymbolicLink()) {
    path = await realpath(path)
    stats = await stat(path)
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

export const getJsonData = async (jsonFilePath: string, key: string) => {
  const keyMatchRegex = new RegExp(`"${key}":\\s{0,}"?([^"]+)"?,?`)
  const readStream = createReadStream(jsonFilePath)
  const lines = createLineInterface({
    input: readStream,
    crlfDelay: Infinity // recognize all instances of CR LF
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
