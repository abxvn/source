declare module '@abux/builder/cli/index' {
  export type { IFilter, IBuilderCustomOptions } from '@abux/builder/src/interfaces';
}
declare module '@abux/builder/src/interfaces' {
  import type { Configuration, WebpackPluginInstance, WebpackOptionsNormalized, ExternalsPlugin } from 'webpack';
  export type IBuildEnvironment = 'development' | 'production';
  export type IBuildTarget = 'web' | 'node';
  export type IDevServerOptions = WebpackOptionsNormalized['devServer'];
  export interface IDevServerCustomOption {
    pattern: RegExp | string;
    options: Partial<IDevServerOptions>;
  }
  export interface IReplacementOption {
    pattern?: RegExp | string;
    map: IImportReplacementMap;
  }
  export type IFileFilter = string | RegExp;
  export interface IBuilderOptions {
    envName: IBuildEnvironment;
    rootPath: string;
    entryPatterns: string[];
    replacements: IReplacementOption[];
    devs: IDevServerCustomOption[];
    ignores: IFileFilter[];
  }
  export type IBuilderCustomOptions = Partial<IBuilderOptions>;
  export interface IConfigCustomizer {
    updateEntries: (entryFilter: IEntryFilter) => void;
    updateOptions: (customOptions: IBuilderCustomOptions) => void;
    filter: (filterName: string, filter: IFilter | null) => void;
  }
  export interface IConfigEditorParams {
    envName: IBuildEnvironment;
    rootPath: string;
    filters?: Record<string, IFilter>;
    deps?: IConfigDeps;
  }
  export interface IConfigEditor extends IConfigCustomizer {
    readonly path: IPathResolver;
    readonly configs: IWebpackConfigs;
    readonly entries: ITargetedExpandedEntries;
    readonly options: IBuilderOptions;
  }
  export type IEntryFilter = (targetEntries: ITargetedExpandedEntries) => Promise<ITargetedExpandedEntries>;
  export interface IFilterOptions {
    editor: IConfigEditor;
    deps: IConfigDeps;
  }
  export interface IFilterOutput {
    configs: IWebpackConfigs;
  }
  export type IFilter = (options: IFilterOptions) => Promise<IFilterOutput>;
  export interface IWebpackConfig extends Omit<Configuration, 'entry'> {
    name: string;
    entry: IEntries;
    target: IBuildTarget;
    plugins: WebpackPluginInstance[];
    devServer?: IDevServerOptions;
    externals?: Exclude<ExternalsPlugin['externals'], string | RegExp>;
  }
  export type IWebpackConfigs = IWebpackConfig[];
  export type ITargetedExpandedEntries = Record<string, IEntries>;
  export type IEntries = Record<string, IEntry>;
  export interface IEntry {
    import: string;
    filename?: string;
    dependOn?: string[];
    library?: {
      name?: string;
      type?: 'var' | 'assign' | 'this' | 'window' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'amd' | 'umd' | 'umd2' | 'jsonp' | 'system' | 'promise';
      export?: string[] | string;
    };
    runtime?: string | (() => string);
  }
  export type IImportReplacementMap = Record<string, string>;
  export interface IDtsGeneratorModule {
    importedModuleId: string;
    currentModuleId: string;
    isDeclaredExternalModule: boolean;
  }
  export interface IPathResolver {
    rootPath: string;
    resolve: (...paths: string[]) => string;
    relative: (fullPath: string) => string;
    includes: (fullPath: string) => boolean;
    resolveList: (paths: string[]) => string[];
    dir: () => IPathResolver;
    res: (...paths: string[]) => IPathResolver;
  }
  export type IDepVersion = string;
  export interface IDep {
    name: string;
    version: IDepVersion;
    dev?: boolean;
  }
  export interface IDepWithDeps extends IDep {
    dependencies?: IDep[];
  }
  export type IConfigDepsSetData = Partial<Omit<IDepWithDeps, 'name'>>;
  export interface IConfigDeps {
    dependencies: string[];
    requires: (name: string) => boolean;
    get: (name: string) => IDepWithDeps | undefined;
    set: (name: string, data: IConfigDepsSetData) => IDepWithDeps;
    unset: (name: string) => void;
  }
  export interface IApp {
    readonly appName: string;
    readonly appVersion: string;
  }
}
declare module '@abux/builder/src/filters/replaceVars' {
  import type { IFilter } from '@abux/builder/src/interfaces'
  const replaceVars: IFilter;
  export default replaceVars;
}
declare module '@abux/builder' {
  export * from '@abux/builder/cli/index'
}
