/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type {
  IBuilderCustomOptions,
  IBuilderOptions,
  IConfigCustomizer,
  IConfigDeps,
  IConfigEditor,
  IConfigEditorParams,
  IEntryFilter,
  IFilter,
  IPathResolver,
  ITargetedExpandedEntries,
  IWebpackConfigs
} from './interfaces'
import initConfigs from './filters/initConfigs'
import unbundleExternals from './filters/unbundleExternals'
import replaceVars from './filters/replaceVars'
import replaceImports from './filters/replaceImports'
import generateDts from './filters/generateDts'
import devServer from './filters/devServer'
import { resolver } from './lib/paths'
import { expandEntries } from './lib/entries'
import ConfigDeps from './ConfigDeps'

const defaultFilters = {
  unbundleExternals,
  replaceVars,
  replaceImports,
  generateDts,
  devServer // should always placed last
}

export default class ConfigEditor implements IConfigCustomizer, IConfigEditor {
  readonly path: IPathResolver
  private _configs: IWebpackConfigs = []
  private _entries: ITargetedExpandedEntries = {}
  private _options: IBuilderOptions
  private readonly filters: Record<string, IFilter | null>
  private readonly deps: IConfigDeps

  private readonly entryFilters: IEntryFilter[] = []

  constructor ({
    envName,
    rootPath,
    filters = defaultFilters,
    deps
  }: IConfigEditorParams) {
    this.path = resolver(rootPath)
    this._options = {
      envName,
      entryPatterns: ['packages/**/index.ts'],
      rootPath,
      devs: [],
      replacements: [
        {
          map: { react: 'preact/compat', 'react-dom': 'preact/compat' },
          pattern: /preact/
        }
      ],
      ignores: [/node_modules/, /\.yarn/]
    }
    this.filters = filters
    this.deps = deps || new ConfigDeps()
  }

  public get configs () {
    return this._configs
  }

  public get entries () {
    return this._entries
  }

  public get options () {
    return this._options
  }

  filter (filterName: string, filter: IFilter | null) {
    this.filters[filterName] = filter
  }

  updateEntries (entryFilter: IEntryFilter) {
    this.entryFilters.push(entryFilter)
  }

  updateOptions (customOptions: IBuilderCustomOptions) {
    this._options = {
      ...this._options,
      ...customOptions
    }
  }

  async init () {
    let entries = await expandEntries(this.path, this.options.entryPatterns, this.options.ignores)

    for await (const entryFilter of this.entryFilters) {
      entries = await entryFilter(entries)
    }

    this._entries = entries

    const filters = [initConfigs, ...Object.values(this.filters)]

    for await (const filter of filters) {
      await this.applyFilter(filter)
    }
  }

  private async applyFilter (filter: IFilter | null) {
    if (!filter) {
      return
    }

    const output = await filter({ editor: this, deps: this.deps })

    this._configs = output.configs
  }
}
