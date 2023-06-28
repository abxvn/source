/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import glob from 'fast-glob'
import { loggers, styles } from '@abux/logger/cli'
import type {
  ITargetedExpandedEntries,
  IPathResolver,
  IWebpackConfig,
  IFileFilter
} from '../interfaces'
import { resolve as resolvePath } from './paths'
import { minimatch } from 'minimatch'
import { resolve } from '@abux/resolve'

const { info, log } = loggers
const { bold, italic } = styles

export const expandEntries = async (
  path: IPathResolver,
  patterns: string[],
  ignores: IFileFilter[] = []
): Promise<ITargetedExpandedEntries> => {
  const files = await glob(patterns.map(pattern => path.resolve(pattern)))
  const filteredFiles = files.filter(path =>
    !ignores.some(pattern =>
      pattern instanceof RegExp
        ? pattern.test(path)
        : minimatch(path, pattern)
    )
  )

  return filteredFiles.reduce<ITargetedExpandedEntries>(
    (targetedEntries, f: string) => {
      const relativePath = path.relative(f)
      const fullPath = resolvePath(path.relative(f))
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

export const logEntries = (configs: IWebpackConfig[]) => {
  info(bold.cyanBright('Building entries:'))

  configs.forEach(({ name, target, entry }) => {
    log(`   ${name} (${italic(target || '')}):`)
    Object.keys(entry).forEach(entryName => { log(`     ${entryName}`) })
  })
}

export const resolveOptions = async <TResult = Record<string, unknown>>(
  packageName: string,
  getOptions: (resolvedPath: string) => TResult
) => {
  const resolvedPath = await resolve(packageName)

  if (resolvedPath) {
    return getOptions(resolvedPath)
  } else {
    return undefined
  }
}
