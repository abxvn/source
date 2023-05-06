import type { Compiler } from 'webpack'
import { pathExists, readJSON } from 'fs-extra'

import { Dts } from '@teku/builder/src/lib/dts/index.js'
import { logError, logInfo, logProgress, logSuccess, logWarn } from '../../lib/logger'
import type { IPathResolver } from '../../interfaces'
import { removeExt, resolver } from '../../lib/paths'

const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/
let counterId = 0

class DtsPlugin {
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
        const matches = !fileSubPath.includes('node_modules') && !fileSubPath.includes('.yarn') && fileSubPath.match(MODULE_PATH_REGEX)

        if (matches && !builtModulePaths.includes(matches[0])) {
          builtModulePaths.push(matches[0])
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
            logWarn(`[dts ${id}]`, packageName, ' generation ignored, required tsconfig')

            return
          }

          const dts = new Dts()
          const filePatterns = packageFiles.map(f => resolver(projectPath).relative(this.path.resolve(p, f)))

          dts.on('log', message => { logProgress(message.replace(/^\[(dtsw?)\]/, `[$1 ${id}]`)) })
          // dts.on('log:verbose', message => { logProgress(message) })
          logInfo(`[dts ${id}]`, packageName, 'generation started')

          await dts.generate({
            projectPath: tsconfigPath,
            name: packageName,
            inputDir: projectPath,
            outputPath: typesFilePath,
            main: removeExt(packageMain.replace(/^(\.\/?)+/, '')),
            filePatterns
          })

          logSuccess(`[dts ${id}]`, packageName, 'declaration at', typesFile)
        } catch (err: any) {
          logError(`[dts ${id}] ${err.message as string}`)
        }
      }))
    })
  }
}

export default DtsPlugin
