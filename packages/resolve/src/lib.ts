import { createReadStream, stat, realpath } from 'fs-extra'
import { createInterface as createLineInterface } from 'readline'
import { resolve as resolvedPath } from 'path'
import type { IFsPathType, IResolvedFileType } from './interfaces'

export { pathExists } from 'fs-extra'
export * from './lib/packages'
export * from './lib/pnp'

const RELATIVE_PATH_REGEX = /^\.\.?(\/|\\|$)/

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

export const getCallerPath = (): string => {
  const callers = getCallers()
  let currentPath = ''

  for (let idx = 0; idx < callers.length; idx++) {
    if (callers[idx] !== currentPath && currentPath && callers[idx]) {
      return callers[idx].replace(/[\\/][^\\/]+$/, '')
    }

    currentPath = callers[idx]
  }

  return ''
}

// Try to get real location / path of caller scripts
// @see https://v8.dev/docs/stack-trace-api
// @see https://github.com/sindresorhus/callsites/blob/main/index.js
// @see https://stackoverflow.com/a/66842927
export const getCallers = (): string[] => {
  // possibly undefined
  const prepareStackTrace = Error.prepareStackTrace

  Error.prepareStackTrace = (_, stack) => stack

  const stacks: NodeJS.CallSite[] = Error().stack as any

  Error.prepareStackTrace = prepareStackTrace

  return stacks.map(s => s.getFileName() || '')
}
