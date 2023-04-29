import type { Configuration, WebpackPluginInstance, WebpackOptionsNormalized, ExternalsPlugin } from 'webpack'

export type IBuildEnvironment = 'development' | 'production'
export type IBuildTarget = 'web' | 'node'

export interface IReplacementOption {
  pattern?: RegExp | string
  map: IImportReplacementMap
}

export interface IBuilderOptions {
  targetEntries: ITargetedExpandedEntries
  envName: IBuildEnvironment
  path: IPathResolver
  replacements?: IReplacementOption[]
}

export interface IWebpackConfig extends Omit<Configuration, 'entry'> {
  entry: IEntries
  target?: IBuildTarget
  plugins: WebpackPluginInstance[]
  devServer?: WebpackOptionsNormalized['devServer']
  externals?: Exclude<ExternalsPlugin['externals'], string | RegExp>
}

export type IWebpackConfigs = Record<string, IWebpackConfig>

export type ITargetedExpandedEntries = Partial<Record<IBuildTarget, IEntries>>
export type IEntries = Record<string, IEntry>
export interface IEntry {
  import: string
  filename?: string
  dependOn?: string[]
  library?: {
    name?: string
    type?: 'var' | 'assign' | 'this' | 'window' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'amd' | 'umd' | 'umd2' | 'jsonp' | 'system' | 'promise'
    export?: string[] | string
  }
  runtime?: string | (() => string)
}

export interface IFilterOutput {
  configs: IWebpackConfigs
}
export type IFilter =
  (configs: IWebpackConfigs, options: IBuilderOptions) => Promise<IFilterOutput>

export type IImportReplacementMap = Record<string, string>
export interface IDtsGeneratorModule {
  importedModuleId: string
  currentModuleId: string
  isDeclaredExternalModule: boolean
}

export interface IPathResolver {
  rootPath: string
  resolve: (...paths: string[]) => string
  relative: (fullPath: string) => string
}
