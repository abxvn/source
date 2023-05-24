/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { Compiler } from 'webpack'
import { Dts } from '@abux/builder/src/lib/dts/index.js'
import { pathExists, readJSON } from '../../lib/vendors'
import { loggers } from '@abux/logger/cli'
import type { IPathResolver } from '../../interfaces'
import { removeExt, resolver, getLocalPackagePath } from '../../lib/paths'

// const { logError, logInfo, logProgress, logSuccess, logWarn, color } = loggers

let counterId = 0

export class DtsPlugin {
  readonly path: IPathResolver

  constructor (rootPath: string) {
    this.path = resolver(rootPath)
  }

  apply (compiler: Compiler) {
    let builtModulePaths: string[] = []

    compiler.hooks.beforeCompile.tapPromise('[dts] start collecting built modules', async () => {
      builtModulePaths = []
    })

    compiler.hooks.compilation.tap('[dts] setup compilation', (compilation) => {
      compilation.hooks.succeedModule.tap('[dts] collect built module', (module) => {
        if (module.constructor.name !== 'NormalModule') {
          return
        }

        const fileSubPath = this.path.relative(module.context || '')
        const localPackagePath = getLocalPackagePath(fileSubPath)

        if (localPackagePath && !builtModulePaths.includes(localPackagePath)) {
          builtModulePaths.push(localPackagePath)
        }
      })
    })

    compiler.hooks.afterCompile.tap('[dts] generate definitions', () => {
      void Promise.all(builtModulePaths.map(async p => {
        const id = counterId += 1

        try {
          const packageInfo: any = await readJSON(this.path.resolve(p, 'package.json'))
          const typesFile = packageInfo.types
          const packageName: string = packageInfo.name
          const projectPath = this.path.resolve(p)
          const typesFilePath = this.path.resolve(p, typesFile)
          const packageMain: string = packageInfo.main || 'index'
          const packageFiles: string[] = packageInfo.files || ''

          if (!typesFile) {
            return
          }

          let tsconfigPath = this.path.resolve(p, 'tsconfig.json')

          if (!await pathExists(tsconfigPath)) {
            // fallback to root tsconfig.json
            tsconfigPath = this.path.resolve('tsconfig.json')
          }

          if (!await pathExists(tsconfigPath)) {
            loggers.warn(this.log(id, packageName, 'generation ignored, required tsconfig'))

            return
          }

          const dts = new Dts()
          const filePatterns = packageFiles.map(f => resolver(projectPath).relative(this.path.resolve(p, f)))

          dts.on('log', message => { loggers.progress(this.log(id, message)) })
          loggers.info(this.log(id, packageName, 'generation started'))

          await dts.generate({
            projectPath: tsconfigPath,
            name: packageName,
            inputDir: projectPath,
            outputPath: typesFilePath,
            main: removeExt(packageMain.replace(/^(\.\/?)+/, '')),
            filePatterns
          })

          loggers.success(this.log(id, packageName, 'declaration at', typesFile))
        } catch (err: any) {
          loggers.error(this.log(id, err.message))
        }
      }))
    })
  }

  private log (id: number, ...messages: string[]) {
    let message = messages.join(' ')

    // add prefix automatically
    if (message.indexOf('[dts') !== 0) {
      message = `[dts] ${message}`
    }

    return message.replace(/^\[(dtsw?)\]/, (_, prefix: string) =>
      loggers.color(`[${prefix} ${id}]`, id)
    )
  }
}
