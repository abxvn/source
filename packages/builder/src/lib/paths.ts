import { resolve, basename } from 'path'
import type { IPathResolver } from '../interfaces'

export { resolve as resolvePath } from 'path'

export class PathResolver implements IPathResolver {
  readonly rootPath: string

  constructor (rootPath: string) {
    this.rootPath = normalize(rootPath)
  }

  relative (fullPath: string) {
    return normalize(fullPath).replace(this.rootPath, '')
  }

  resolve (...paths: string[]) {
    return normalize(resolve(this.rootPath, ...paths))
  }
}

export const normalize = (path: string) => path.replace(/\\/g, '/')
export const getDir = (path: string) => normalize(path).replace(/\/[^/]+\/?$/, '')
export const getName = (path: string) => basename(normalize(path))
export const resolver = (rootPath: string): IPathResolver => new PathResolver(rootPath)
