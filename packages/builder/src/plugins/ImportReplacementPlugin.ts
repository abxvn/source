import { Compilation, sources } from 'webpack'
import type { Compiler } from 'webpack'
import type { IImportReplacementMap } from '../interfaces'
import { logInfo } from '../lib/logger'

class ImportReplacementPlugin {
  replacementMap: IImportReplacementMap
  assetRegex: RegExp | null

  constructor (replacementMap: IImportReplacementMap = {}, assetRegex: RegExp | null = null) {
    this.replacementMap = replacementMap
    this.assetRegex = assetRegex
  }

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap('ImportReplacementPlugin: Setup compilation', (compilation: Compilation) => {
      compilation.hooks.processAssets.tapPromise({
        name: 'ImportReplacementPlugin: Replace assets before saving',
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
      }, async (assets: any) => {
        const replacementList = Object.keys(this.replacementMap).map(from => `${from}:${this.replacementMap[from]}`)
        const shortenListStr = replacementList.join(' ').padEnd(40, '...')

        for (const name in assets) {
          if (this.assetRegex && !this.assetRegex.test(name)) {
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

          logInfo(`[replace] asset ${name}: ${shortenListStr}`)
        }
      })
    })
  }
}

export default ImportReplacementPlugin
