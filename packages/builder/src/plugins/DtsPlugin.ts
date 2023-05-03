import { Dts } from '../lib/dts'
import { pathExists, readJSON } from 'fs-extra'
import { logError, logInfo, logProgress, logSuccess } from '../lib/logger'
import type { Compiler } from 'webpack'
import type { IPathResolver } from '../interfaces'

const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/

class DtsPlugin {
  constructor (private readonly path: IPathResolver) {}

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
          const tsconfigPath = this.path.resolve(p, 'tsconfig.json')

          if (!typesFile) {
            return
          }

          if (!await pathExists(tsconfigPath)) {
            logInfo('[dts]', packageName, ' generation ignored, required tsconfig')

            return
          }

          const dts = new Dts()

          dts.on('log', message => { logProgress(message) })
          logInfo('[dts]', packageName, 'generation started')

          await dts.generate({
            name: packageName,
            inputDir: projectPath,
            outputPath: typesFilePath
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
