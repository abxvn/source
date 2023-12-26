/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { isAbsolute } from 'path'

type IImporTypeFn = (request: string, resolution: string) => string
type IImportType = string | IImporTypeFn
type IExternalFilterFn = (request: string, resolution: string) => boolean
type IExternalFilter = string | RegExp | IExternalFilterFn | Array<string | RegExp | IExternalFilterFn>
interface WebpackPnpExternalsOptions {
  include?: IExternalFilter
  exclude?: IExternalFilter
  importType?: IImportType
}

export default function webpackPnpExternals (options: WebpackPnpExternalsOptions = {}) {
  const { include, exclude, importType = 'commonjs' } = options
  let pnpApi: any

  try {
    pnpApi = require('pnpapi')
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') { throw err }
    pnpApi = null
  }

  return function (...args: any[]) {
    let [context, request, callback] = args

    // support Webpack 5
    if (args.length === 2) { [{ context, request }, callback] = args }
    if (pnpApi == null) { return callback() }
    // don't check relative or absolute requires
    if (/^\.\.?[/\\]/.test(request) || isAbsolute(request)) { return callback() }
    let resolution: string

    try {
      resolution = pnpApi.resolveRequest(request, context, {
        considerBuiltins: false,
      })
    } catch (err: any) {
      if (err.code === 'MODULE_NOT_FOUND') { return callback() }
      throw err
    }
    if (include != null && !isMatch(include, request, resolution)) { return callback() }
    if (exclude != null && isMatch(exclude, request, resolution)) { return callback() }
    let type = importType

    if (type instanceof Function) { type = type(request, resolution) }

    return callback(null, request, type)
  }
}

function isMatch (pattern: IExternalFilter, request: string, resolution: string): boolean {
  if (typeof pattern === 'string') {
    return pattern === request
  } else if (pattern instanceof RegExp) {
    return pattern.test(request)
  } else if (pattern instanceof Function) {
    return pattern(request, resolution)
  } else if (pattern instanceof Array) {
    for (const subPattern of pattern) {
      if (isMatch(subPattern, request, resolution)) { return true }
    }

    return false
  } else {
    throw new Error('Unexpected pattern type')
  }
}
