import glob from 'fast-glob'
import { loggers, styles } from '@abux/logger/cli'
import type {
  ITargetedExpandedEntries,
  IPathResolver,
  IWebpackConfig
} from '../interfaces'
import { resolve } from './paths'

const { info, log } = loggers
const { bold, italic } = styles

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

export const logEntries = (configs: IWebpackConfig[]) => {
  info(bold.cyanBright('Building entries:'))

  configs.forEach(({ name, target, entry }) => {
    log(`   ${name} (${italic(target || '')}):`)
    Object.keys(entry).forEach(entryName => { log(`     ${entryName}`) })
  })
}
