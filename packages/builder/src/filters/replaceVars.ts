import { DefinePlugin } from 'webpack'
import { map } from '../lib/helpers'
import type { IEntries, IFilter, IWebpackConfig } from '../interfaces'
import fs from 'fs-extra'
import { parse } from 'dotenv'

const replaceVars: IFilter = async ({ editor }) => {
  return {
    configs: await map(editor.configs, async (config: IWebpackConfig) => ({
      ...config,
      plugins: [
        ...config.plugins,
        new DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(config.mode),
          ...await defineEnvPerEntries(config.entry)
        })
      ]
    }))
  }
}

export default replaceVars

type EntryEnvs = Record<string, string>
const defineEnvPerEntries = async (entries: IEntries): Promise<EntryEnvs> => {
  const packages: Record<string, any> = {}

  Object.values(entries).forEach((entry) => {
    const match = entry.import.match(/\/packages\/([^/]+)/)

    if (match) {
      const packagePath = entry.import.slice(0, (match.index ?? 0) + match[0].length)
      const packageName = match[1].replace(/-/g, '_').toUpperCase()

      packages[packagePath] = packageName
    }
  })

  const entryEnvs: EntryEnvs = {}

  await Promise.all(
    Object.keys(packages).map(async (path) => {
      try {
        const packageName: string = packages[path]
        const envText = await fs.readFile(`${path}/.env`)
        const envs = parse(envText)

        for (const envName in envs) {
          entryEnvs[`process.env.${packageName}_${envName}`] = JSON.stringify(envs[envName])
        }
      } catch (_) {
        // Could be file not found
      }
    })
  )

  return entryEnvs
}
