import { defineConfig, type Options } from 'tsup'
import path from 'path'
import fs from 'fs-extra'

const resolvePath = (...paths: string[]): string =>
  path.resolve(...paths).replace(/\\/g, '/')
const relativePath = (...args: Parameters<typeof path['relative']>): string =>
  path.relative(...args).replace(/\\/g, '/')

let envName: string
const createBuildConfigs = async (name: string): Promise<Options[]> => {
  const basePath = `${__dirname}/${name}`.replace(/\\/g, '/') // eslint-disable-line n/no-path-concat
  const packageJsonPath = `${basePath}/package.json`
  const packageJson = await fs.readJson(packageJsonPath)
  let jsBanner = '/*! Copyright (c) 2023 ABx. All rights reserved. */'

  if (packageJson.license) {
    jsBanner = `/*!
 * Copyright (c) 2023 ABx. All rights reserved.
 * Licensed under the ${packageJson.license} License. See LICENSE file in the project root for license information.
 */`
  }

  const configs: Options[] = []
  // posible ./dist/index.ts
  const packageMain = packageJson.main?.replace('./dist/', '').replace(/\.m?js$/, '.ts')
  const isTypesIncluded = Boolean(packageJson.types)
  let isEsmIncluded = Boolean(packageJson.module)

  const ignoredPatterns = [
    '!node_modules/**',
    `!${basePath}/node_modules`,
    `!${basePath}/node_modules/**`,
    `!${basePath}/dist`,
    `!${basePath}/**/*.spec.ts`,
    `!${basePath}/**/*.test.ts`,
    `!${basePath}/tests/**`,
  ]

  const cjsBaseConfig: Options = {
    clean: true,
    tsconfig: `${basePath}/tsconfig.build.json`,
    format: ['cjs'],
    external: [/^[^./D]/], // only bundle entry modules and relative modules
    outDir: `${basePath}/dist`,
    splitting: false,
    dts: false,
    minify: envName === 'production',
    banner: {
      js: jsBanner,
    },
  }

  let esmDistPaths: string[] = []
  const esmBaseConfig: Options = {
    ...cjsBaseConfig,
    format: ['esm'],
    external: [/^[^/D]/], // only bundle entry modules (relative modules output into separated files)
    esbuildOptions (options, context) {
      options.outbase = basePath // keep source dir structure
    },
    esbuildPlugins: [
      {
        name: 'add-mjs-ext',
        setup (build) {
          build.onStart(() => { esmDistPaths = [] })
          build.onResolve({ filter: /^\.*/ }, args => {
            // if (args.importer) { return { path: args.path + '.mjs', external: true } }
            if (args.kind !== 'entry-point') return undefined

            const entryPath = args.path
            const entrySubPath = relativePath(basePath, entryPath)
            const entryDistPath = resolvePath(basePath, 'dist', entrySubPath.replace('.ts', '.mjs'))
            if (!esmDistPaths.includes(entryDistPath)) {
              esmDistPaths.push(entryDistPath)
            }
          })
        },
      },
    ],
    async onSuccess () {
      console.info('EXT', 'Replacing dist imports')
      let replacedCount = 0

      await Promise.all(esmDistPaths.map(async distFile => {
        const fileDirPath = path.dirname(distFile)
        const contents = await fs.readFile(distFile, 'utf8')
        const contentsWithExtImports = contents.replace(/\bfrom\s+['"](\.[^'"]+)['"]/g, (_, importPath) => {
          let resolvedExtImportPath = importPath
          const fullExtImportPath = resolvePath(fileDirPath, `${importPath}.mjs`)
          const fullExtImportPathIndex = resolvePath(fileDirPath, importPath, 'index.mjs')

          if (esmDistPaths.includes(fullExtImportPath)) resolvedExtImportPath = `${importPath}.mjs`
          else if (esmDistPaths.includes(fullExtImportPathIndex)) resolvedExtImportPath = `${importPath}/index.mjs`
          if (resolvedExtImportPath !== importPath) replacedCount++

          return `from "${resolvedExtImportPath}"`
        })

        // Write the modified content back to the file
        await fs.writeFile(distFile, contentsWithExtImports, 'utf8')
      }))

      console.info('EXT', 'Replaced', replacedCount, 'dist imports')
    },
    dts: false,
    minify: false,
    banner: {
      js: jsBanner,
    },
  }

  if (packageMain) {
    const mainImportPath = resolvePath(basePath, packageMain)

    configs.push({
      ...cjsBaseConfig,
      entry: [mainImportPath, ...ignoredPatterns],
      dts: isTypesIncluded
        ? {
            entry: mainImportPath,
            // banner: `declare module '${packageJson.name}' {\n`,
            // footer: '\n}',
            compilerOptions: {
              removeComments: false, // keep comments for type definitions
            },
          }
        : false,
    })
  }

  const packageExports = packageJson.exports

  packageExports && Object.keys(packageExports).forEach(key => {
    if (key === '.') return // continue

    const packageExport = packageExports[key]
    const packageExportMain = packageExport.require?.replace('./dist/', '').replace(/\.m?js$/, '.ts')
    const isTypesIncluded = packageExport.types

    if (packageExport.import) isEsmIncluded = true
    if (packageExportMain) {
      const mainImportPath = resolvePath(basePath, packageExportMain)

      configs.push({
        ...cjsBaseConfig,
        entry: [mainImportPath, ...ignoredPatterns],
        outDir: resolvePath(basePath, 'dist', key),
        dts: isTypesIncluded ? mainImportPath : false,
      })
    }
  })

  if (isEsmIncluded) {
    configs.push({
      ...esmBaseConfig,
      entry: [resolvePath(basePath, '**/*.ts'), ...ignoredPatterns],
    })
  }

  return configs
}

const packages = [
  'packages/builder',
  'packages/dts',
  'packages/logger',
  'packages/paths',
  'packages/resolve',
  'packages/tasks',
  'packages/webpack-dts',
]

export default defineConfig(async (options) => {
  envName = options.env?.NODE_ENV || process.env.NODE_ENV || 'development'
  console.info('ENV', envName)

  const configs = await Promise.all(packages.map(createBuildConfigs))

  return configs.flat()
})
