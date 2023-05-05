import { resolve as _resolve, basename, relative as _relative, join } from 'path'
import type { IPathResolver } from '../interfaces'

export class PathResolver implements IPathResolver {
  readonly rootPath: string

  constructor (rootPath: string) {
    this.rootPath = normalize(_resolve(rootPath))
  }

  relative (fullPath: string) {
    return normalize(_relative(this.rootPath, normalize(fullPath)))
  }

  relativeList (fullPaths: string[]) {
    return fullPaths.map(fullPath => this.relative(fullPath))
  }

  includes (fullPath: string): boolean {
    return normalize(fullPath).indexOf(this.rootPath) === 0
  }

  resolve (...paths: string[]) {
    return normalize(_resolve(this.rootPath, ...paths.filter(Boolean).map(p => p.replace(/^\/+/, ''))))
  }

  resolveList (paths: string[]) {
    return paths.map(path => this.resolve(path))
  }

  dir (): IPathResolver {
    return resolver(getDir(this.rootPath))
  }

  res (...paths: string[]) {
    return resolver(this.resolve(...paths))
  }
}

export const normalize = (path: string) => path?.replace(/\\/g, '/') || ''
export const getDir = (path: string) => normalize(path).replace(/\/[^/]+\/?$/, '')
export const getName = (path: string) => basename(normalize(path))
export const resolver = (rootPath: string): IPathResolver => new PathResolver(rootPath)
export const resolve = (path: string) => normalize(_resolve(path))
export const merge = (...paths: string[]) => normalize(join(...paths))
export const removeExt = (path: string) => path?.replace(/\.([^/]+)$/, '')
