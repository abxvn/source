import glob from 'fast-glob'
import type {
  ITargetedExpandedEntries,
  IPathResolver
} from '../../interfaces'
import { resolve } from '../paths'

export const expandEntries = async (
  path: IPathResolver,
  patterns: string[]
): Promise<ITargetedExpandedEntries> => {
  const files = await glob(patterns.map(pattern => path.resolve(pattern)))

  return files.reduce<ITargetedExpandedEntries>(
    (targetedEntries, f: string) => {
      const relativePath = path.relative(f)
      const fullPath = resolve(path.relative(f))
      const target = /\/(scripts|dev|web)\//.test(relativePath) ? 'web' : 'node'

      return {
        ...targetedEntries,
        [target]: {
          ...targetedEntries[target],
          [relativePath]: {
            import: fullPath
          }
        }
      }
    },
    {}
  )
}
