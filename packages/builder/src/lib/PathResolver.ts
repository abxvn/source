import { resolve, basename } from 'path'
import type { IPathResolver } from '../interfaces'

export default class PathResolver implements IPathResolver {
  readonly rootPath: string

  constructor (rootPath: string) {
    this.rootPath = this.normalize(rootPath)
  }

  relative (fullPath: string) {
    return this.normalize(fullPath).replace(this.rootPath, '')
  }

  resolve (...paths: string[]) {
    return this.normalize(resolve(this.rootPath, ...paths))
  }

  normalize (path: string) {
    return path.replace(/\\/g, '/')
  }

  dir (path: string) {
    return this.normalize(path).replace(/\/[^/]+\/?$/, '')
  }

  name (path: string) {
    return basename(this.normalize(path))
  }
}
