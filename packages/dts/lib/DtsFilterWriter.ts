/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { minimatch } from 'minimatch'
import { DtsWriter } from './DtsWriter'
import { removeExtension, EOL } from './helpers'
import type { IDtsFilters, IDtsWriterOptions, IModuleImportResolution, IModuleResolution } from './interfaces'

export class DtsFilterWriter extends DtsWriter {
  readonly modulePathMap: Record<string, string> = {}
  readonly moduleDepsMap: Record<string, string[]> = {}
  readonly cachedOutputs: Record<string, string> = {}

  constructor (options: IDtsWriterOptions, readonly filters: IDtsFilters) {
    super(options)
  }

  protected done () {
    this.emitOutput()
    super.done()
  }

  emitOutput () {
    const filePatterns = this.filters.filePatterns?.map(p => `**/${removeExtension(p)}`) || []
    const moduleIds = Object.keys(this.cachedOutputs)
    const modulePaths = moduleIds.map(id => this.modulePathMap[id])
    let emittedModuleIds = moduleIds

    if (filePatterns.length) {
      emittedModuleIds = []
      modulePaths.forEach((path, idx) => {
        if (path && filePatterns.some(pattern => minimatch(path, pattern))) {
          emittedModuleIds.push(moduleIds[idx])
        }
      })

      // collect module deps along with module ids
      emittedModuleIds = emittedModuleIds.map(id => [id].concat(this.collectModuleDeps(id)))
        .flat()
        .filter((id, idx, ids) =>
          ids.indexOf(id) === idx && // de-duplicate
          moduleIds.includes(id) // only take modules with declarations, since deps added
        )
        .reverse()
    }

    const main = this.resolvedMainId

    if (main && !emittedModuleIds.includes(this.options.name)) {
      emittedModuleIds.push(this.options.name)
    }

    emittedModuleIds.forEach(moduleId => {
      this.emit('log', `[dtsw] declared module ${moduleId}`)
      this.writeOutput(this.cachedOutputs[moduleId])
    })
  }

  private readonly collectModuleDeps = (resolvedModuleId: string): string[] => {
    const path = this.modulePathMap[resolvedModuleId]

    if (!path) {
      return []
    }

    const deps = this.moduleDepsMap[path] || []
    const depDeps = deps.map(depModuleId => this.collectModuleDeps(depModuleId)).flat()

    return deps.concat(depDeps)
  }

  protected writeOutputModule (moduleId: string, contents: string) {
    const lines = this.filterOutput(contents)

    if (!lines.length) {
      return
    }

    const output = [
      `declare module '${moduleId}' {`,
      this.deduplicateLines(lines).join(EOL),
      '}',
    ].join(EOL)

    if (this.filters.filePatterns?.length) {
      // delay output until the end (done())
      this.cachedOutputs[moduleId] = output

      return
    }

    this.writeOutput(output)
  }

  protected resolveModule (resolution: IModuleResolution): string {
    const resolvedModuleId = super.resolveModule(resolution)

    this.modulePathMap[resolvedModuleId] = resolution.currentModule

    return resolvedModuleId
  }

  protected resolveImport (resolution: IModuleImportResolution): string {
    const resolvedModuleId = super.resolveImport(resolution)

    if (!this.moduleDepsMap[resolution.currentModule]) {
      this.moduleDepsMap[resolution.currentModule] = []
    }

    this.moduleDepsMap[resolution.currentModule].push(resolvedModuleId)

    return resolvedModuleId
  }
}
