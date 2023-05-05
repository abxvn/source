import type { Compiler } from 'webpack'
import { pathExists, readJSON } from 'fs-extra'

import { Dts } from '../../lib/dts/index.js'
import { logError, logInfo, logProgress, logSuccess, logWarn } from '../../lib/logger'
import type { IPathResolver } from '../../interfaces'
import { removeExt, resolver } from '../../lib/paths'

const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/

class DtsPlugin {
  readonly path: IPathResolver

  constructor (private readonly rootPath: string) {
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

    compiler.hooks.afterCompile.tapPromise('[dts] generate definitions', async () => {
      await Promise.all(builtModulePaths.map(async p => {
        try {
          const packageInfo: any = await readJSON(this.path.resolve(p, 'package.json'))
          const typesFile = packageInfo.types
          const packageName: string = packageInfo.name
          const projectPath = this.path.resolve(p)
          const typesFilePath = this.path.resolve(p, typesFile)
          const packageMain: string = packageInfo.main || 'index'

          if (!typesFile) {
            return
          }

          let tsconfigPath = this.path.resolve(p, 'tsconfig.json')

          if (!await pathExists(tsconfigPath)) {
            // fallback to root tsconfig.json
            tsconfigPath = this.path.resolve('tsconfig.json')
          }

          if (!await pathExists(tsconfigPath)) {
            logWarn('[dts]', packageName, ' generation ignored, required tsconfig')

            return
          }

          const dts = new Dts()

          dts.on('log', message => { logProgress(message) })
          // dts.on('log:verbose', message => { logProgress(message) })
          logInfo('[dts]', packageName, 'generation started')

          await dts.generate({
            projectPath: tsconfigPath,
            name: packageName,
            inputDir: projectPath,
            outputPath: typesFilePath,
            main: removeExt(packageMain.replace(/^(\.\/?)+/, ''))
          })

          logSuccess('[dts]', packageName, 'declaration at', typesFile)
        } catch (err: any) {
          logError(`[dts] ${err.message as string}`)
        }
      }))
    })
  }
}

export default DtsPlugin
