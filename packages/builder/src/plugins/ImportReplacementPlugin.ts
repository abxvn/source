import { Compilation, sources } from 'webpack'
import type { Compiler } from 'webpack'
import type { IImportReplacementMap } from '../interfaces'
import { logInfo } from '../lib/logger'
import { minimatch } from 'minimatch'

class ImportReplacementPlugin {
  constructor (readonly replacementMap: IImportReplacementMap, readonly pattern?: string | RegExp) {}

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap('[replacement] setup compilation', (compilation: Compilation) => {
      compilation.hooks.processAssets.tapPromise({
        name: '[replacement] replace assets before saving',
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
      }, async (assets: any) => {
        const replacementList = Object.keys(this.replacementMap).map(from => `${from}:${this.replacementMap[from]}`)
        const shortenListStr = replacementList.join(' ').padEnd(40, '...')

        for (const name in assets) {
          if (!this.matchAsset(name)) {
            continue
          }

          const asset = assets[name]
          const assetText = asset.source()
          const newText = Object.keys(this.replacementMap).reduce((text, from) => {
            const to = this.replacementMap[from]

            return text.replace(new RegExp(`require\\(['"]${from}['"]\\)`, 'g'), `require("${to}")`)
          }, assetText)

          compilation.updateAsset(
            name,
            new sources.RawSource(newText)
          )

          logInfo(`[replace] ${name}: ${shortenListStr}`)
        }
      })
    })
  }

  private matchAsset (name: string): boolean {
    if (!this.pattern) {
      return true
    }

    if (this.pattern instanceof RegExp) {
      return this.pattern.test(name)
    }

    if (typeof this.pattern === 'string') {
      return minimatch(name, this.pattern)
    }

    return false
  }
}

export default ImportReplacementPlugin
