
const { basename, resolve: resolvePath, dirname } = require('path')
const dtsGenerator = require('dts-generator').default
const { readJSON } = require('fs-extra')

class DtsGeneratorPlugin {
  constructor (rootPath) {
    this.rootPath = rootPath
  }

  apply (compiler) {
    const MODULE_PATH_REGEX = /([^/]+\/[^/]+)/
    let builtModulePaths = []

    compiler.hooks.compilation.tap('DtsGeneratorPlugin: Setup compilation', (compilation) => {
      compilation.hooks.succeedModule.tap('DtsGeneratorPlugin: Collect built module', (module) => {
        if (module.constructor.name !== 'NormalModule') {
          return
        }

        const fileSubPath = (module.context || '').replace(this.rootPath, '')
        const matches = !fileSubPath.includes('node_modules') && !fileSubPath.includes('.yarn') && fileSubPath.match(MODULE_PATH_REGEX)

        if (matches && !builtModulePaths.includes(matches[0])) {
          builtModulePaths.push(matches[0])
        }
      })
    })

    compiler.hooks.beforeCompile.tapAsync(
      'DtsGeneratorPlugin: Start built modules collection',
      (compilation, callback) => {
        builtModulePaths = []

        callback()
      }
    )

    compiler.hooks.afterCompile.tapPromise('DtsGeneratorPlugin: generate definitions', async () => {
      return builtModulePaths.map(async (p) => {
        try {
          const packageInfo = await readJSON(resolvePath(this.rootPath, `${p}/package.json`))
          const typesFile = packageInfo.types
          const packageName = packageInfo.name

          if (!typesFile) {
            return
          }

          console.info(`dts generate: ${packageName}`)

          let main = packageInfo.main

          if (!main) {
            main = '/index'
          } else {
            main = '/' + main.replace(/^\//, '').replace(/\.js$/, '')
          }

          await dtsGenerator({
            prefix: '',
            name: packageName,
            main,
            eol: '\n',
            project: resolvePath(this.rootPath, p),
            exclude: [
              '**/*.{test,spec}.{ts,tsx}'
            ],
            out: resolvePath(this.rootPath, `${p}/${typesFile}`),
            resolveModuleId: ({ currentModuleId }) => {
              const isIndexModule = basename(currentModuleId) === 'index'

              return isIndexModule
                ? [packageName, currentModuleId.replace(/\/?index$/, '')].filter(Boolean).join('/')
                : `${packageName}/.internal/${currentModuleId.replace(/^src\/?/, '')}`
            },
            resolveModuleImport: ({ importedModuleId, isDeclaredExternalModule, currentModuleId }) => {
              const fullImport = resolvePath(dirname(currentModuleId), importedModuleId)
              const isInternalModule = !isDeclaredExternalModule &&
                importedModuleId.indexOf('.') === 0

              return isInternalModule
                ? packageName + fullImport.replace(/^.+\/src\//, '/.internal/')
                : importedModuleId
            }
          })
        } catch (err) {
          console.error(err)
        }
      })
    })
  }
}

module.exports = DtsGeneratorPlugin
