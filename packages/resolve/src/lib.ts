/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
export * from './lib/packages'
export * from './lib/pnp'

export const getDirPath = (path: string) => path.replace(/[\\/][^\\/]+$/, '')
export const getCallerPath = (): string => {
  const callers = getCallers()
  let currentPath = ''

  for (let idx = 0; idx < callers.length; idx++) {
    if (callers[idx] !== currentPath && currentPath && callers[idx]) {
      return getDirPath(callers[idx])
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
