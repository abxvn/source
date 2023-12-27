import type { IResolveOptions, IResolveTrace } from './lib/interfaces'
import { resolveRequest } from './lib/resolvers'
import { resolveFromFsPath } from './lib/fs/asyncFs'

export const resolve = async (path: string, options?: IResolveOptions): Promise<string> => {
  const trace: IResolveTrace | undefined = +(process.env.ABUX_RESOLVE_DEBUG as string)
    ? new Map()
    : undefined
  const resolveOptions = {
    usePnpFallback: true,
    ...options,
  }

  const result = await resolveRequest(path, resolveOptions, resolveFromFsPath, trace)

  if (trace) {
    console.debug('@abxvn/resolve', Object.fromEntries(trace.entries()))
  }

  return result
}
