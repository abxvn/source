import dtsGenerator from 'dts-generator'
import { pathExists, readJSON } from 'fs-extra'
import { logError, logInfo, logSuccess } from '../lib/logger'
import type { Compiler } from 'webpack'
import type { IDtsGeneratorModule, IPathResolver } from '../interfaces'
import { getDir, getName, resolvePath } from '../lib/paths'

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
          const packageMain: string | undefined = packageInfo.main
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

          logInfo('[dts]', packageName, 'generation started')

          const main = '/' + (packageMain?.replace(/^\//, '').replace(/\.js$/, '') || 'index')

          await dtsGenerator({
            prefix: '',
            name: packageName,
            main,
            eol: '\n',
            project: projectPath,
            exclude: [
              '**/*.{test,spec}.{ts,tsx}'
            ],
            out: typesFilePath,
            resolveModuleId: ({ currentModuleId }) => {
              const isIndexModule = getName(currentModuleId) === 'index'

              return isIndexModule
                ? [packageName, currentModuleId.replace(/\/?index$/, '')].filter(Boolean).join('/')
                : `${packageName}/.internal/${currentModuleId.replace(/^src\/?/, '')}`
            },
            resolveModuleImport: ({ importedModuleId, isDeclaredExternalModule, currentModuleId }: IDtsGeneratorModule) => {
              const fullImport = resolvePath(getDir(currentModuleId), importedModuleId)
              const isInternalModule = !isDeclaredExternalModule &&
                importedModuleId.indexOf('.') === 0

              return isInternalModule
                ? packageName + fullImport.replace(/^.+\/src\//, '/.internal/')
                : importedModuleId
            }
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
