/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { IResolveOptions } from './lib/interfaces'
import { resolveFromFsPathSync } from './lib/fs/syncFs'
import { resolveRequest } from './lib/resolvers'

export const resolveSync = (path: string, options?: IResolveOptions): string => {
  const resolveOptions = {
    usePnpFallback: true,
    ...options,
  }

  return resolveRequest(path, resolveOptions, resolveFromFsPathSync) as string
}
