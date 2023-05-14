import { DefinePlugin } from 'webpack'
import { map } from '../../lib/data'
import type { IEntries, IFilter, IPathResolver, IWebpackConfig } from '../../interfaces'
import { getLocalPackagePath, resolver } from '../../lib/paths'
import { pathExists, readFile, readJSON } from '../../lib/vendors'
import { parse } from 'dotenv'
import { logInfo, logWarn } from '@abux/logger'

const replaceVars: IFilter = async ({ editor }) => {
  const path = resolver(editor.path.rootPath)

  return {
    configs: await map(editor.configs, async (config: IWebpackConfig) => ({
      ...config,
      plugins: [
        ...config.plugins,
        new DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(config.mode),
          ...await defineEnvPerEntries(path, config.entry)
        })
      ]
    }))
  }
}

export default replaceVars

type EntryEnvs = Record<string, string>
const defineEnvPerEntries = async (path: IPathResolver, entries: IEntries): Promise<EntryEnvs> => {
  const packages: Record<string, any> = {}

  Object.values(entries).forEach((entry) => {
    const relativePath = path.relative(entry.import)
    const packageSubPath = getLocalPackagePath(relativePath)

    if (packageSubPath) {
      const packageName = packageSubPath.split(/\//).pop()
      const packagePath = path.resolve(packageSubPath)

      packages[packagePath] = packageName
    }
  })

  const entryEnvs: EntryEnvs = {}

  await Promise.all(
    Object.keys(packages).map(async (path) => {
      const packageName: string = packages[path]
      const packagePrefix = toToken(packageName)
      const packageEnvFile = `${path}/.env`
      const packageInfoFile = `${path}/package.json`

      if (!await pathExists(packageInfoFile)) {
        return
      }

      try {
        const packageInfo: any = await readJSON(packageInfoFile)

        logInfo(`[vars] register ${packageName} info`)
        Object.keys(packageInfo).forEach(key => {
          const value = packageInfo[key]

          // TODO: expand sub objects and arrays
          // For now only include string entries
          if (typeof value === 'string') {
            entryEnvs[`process.env.${packagePrefix}_PACKAGE_${toToken(key)}`] = JSON.stringify(value)
          }
        })
      } catch (error: any) {
        logWarn(`cannot parse ${packageName} info, error:`, error.message)

        return
      }

      if (!await pathExists(packageEnvFile)) {
        return
      }

      try {
        const envText: string = await readFile(packageEnvFile, 'utf-8')
        const envs = parse(envText)

        logInfo(`[vars] register ${packageName} envs`)
        Object.keys(envs).forEach(key => {
          const value = envs[key]

          // TODO: expand sub objects and arrays
          // For now only include string entries
          if (typeof value === 'string') {
            entryEnvs[`process.env.${packagePrefix}_ENV_${toToken(key)}`] = JSON.stringify(value)
          }
        })
      } catch (error: any) {
        logWarn(`cannot parse ${packageName} env file, error:`, error.message)
      }
    })
  )

  return entryEnvs
}

const toToken = (name: string) => name.replace(/-/g, '_').toUpperCase()
