declare module '@teku/builder/src/interfaces' {
  import type { Configuration, WebpackPluginInstance, WebpackOptionsNormalized, ExternalsPlugin } from 'webpack';
  export type IBuildEnvironment = 'development' | 'production';
  export type IBuildTarget = 'web' | 'node';
  export interface IBuilderOptions {
    envName: IBuildEnvironment;
    rootPath: string;
    entryPatterns: string[];
    replacements: IReplacementOption[];
  }
  export type IBuilderCustomOptions = Partial<IBuilderOptions>;
  export interface IConfigCustomizer {
    updateEntries: (entryFilter: IEntryFilter) => void;
    updateOptions: (customOptions: Partial<IBuilderOptions>) => void;
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
  export interface IReplacementOption {
    pattern?: RegExp | string;
    map: IImportReplacementMap;
  }
  export interface IWebpackConfig extends Omit<Configuration, 'entry'> {
    entry: IEntries;
    target?: IBuildTarget;
    plugins: WebpackPluginInstance[];
    devServer?: WebpackOptionsNormalized['devServer'];
    externals?: Exclude<ExternalsPlugin['externals'], string | RegExp>;
  }
  export type IWebpackConfigs = Record<string, IWebpackConfig>;
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
}
declare module '@teku/builder/src/lib/paths' {
  import type { IPathResolver } from '@teku/builder/src/interfaces';
  export class PathResolver implements IPathResolver {
    readonly rootPath: string;
    constructor (rootPath: string);
    relative (fullPath: string): string;
    relativeList (fullPaths: string[]): string[];
    includes (fullPath: string): boolean;
    resolve (...paths: string[]): string;
    resolveList (paths: string[]): string[];
    dir (): IPathResolver;
    res (...paths: string[]): IPathResolver;
  }
  export const normalize: (path: string) => string;
  export const getDir: (path: string) => string;
  export const getName: (path: string) => string;
  export const resolver: (rootPath: string) => IPathResolver;
  export const resolve: (path: string) => string;
  export const merge: (...paths: string[]) => string;
  export const removeExt: (path: string) => string;
}
declare module '@teku/builder/src/lib/helpers' {
  import type { ITargetedExpandedEntries, IPathResolver } from '@teku/builder/src/interfaces';
  export { stat, copy } from 'fs-extra';
  export const expandTargetedEntries: (path: IPathResolver, patterns: string[]) => Promise<ITargetedExpandedEntries>;
  export const map: (iterable: any, transform: (item: any, key: number | string) => Promise<any>) => Promise<any>;
  export const filter: (iterable: any, filter: (item: any, key: number | string) => boolean) => any;
  export const extractPattern: (regex: RegExp) => string;
  export const extractMatch: (str: string, regex: RegExp) => string;
}
declare module '@teku/builder/src/filters/initConfigs' {
  import type { IBuildTarget, IConfigEditor, IEntries, IFilter, IWebpackConfig } from '@teku/builder/src/interfaces'
  const initConfigs: IFilter;
  export default initConfigs;
  export const getConfig: (target: IBuildTarget | undefined, entries: IEntries, editor: IConfigEditor) => Promise<IWebpackConfig>;
  export const setNodePackageConfig: (config: IWebpackConfig) => IWebpackConfig;
  export const setWebPackageConfig: (config: IWebpackConfig) => IWebpackConfig;
}
declare module '@teku/builder/src/plugins/webpackPnpExternals' {
  type IImporTypeFn = (request: string, resolution: string) => string;
  type IImportType = string | IImporTypeFn;
  type IExternalFilterFn = (request: string, resolution: string) => boolean;
  type IExternalFilter = string | RegExp | IExternalFilterFn | Array<string | RegExp | IExternalFilterFn>;
  interface WebpackPnpExternalsOptions {
    include?: IExternalFilter;
    exclude?: IExternalFilter;
    importType?: IImportType;
  }
  export default function webpackPnpExternals (options?: WebpackPnpExternalsOptions): (...args: any[]) => any;
}
declare module '@teku/builder/src/filters/unbundleExternals' {
  import type { IFilter } from '@teku/builder/src/interfaces'
  const unbundleExternals: IFilter;
  export default unbundleExternals;
}
declare module '@teku/builder/src/filters/replaceVars' {
  import type { IFilter } from '@teku/builder/src/interfaces'
  const replaceVars: IFilter;
  export default replaceVars;
}
declare module '@teku/builder/src/lib/logger' {
  import type { IWebpackConfig } from '@teku/builder/src/interfaces';
  export const log: {
    (...data: any[]): void;
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
  };
  export const logInfo: (...items: any[]) => void;
  export const logProgress: (...items: any[]) => void;
  export const logWarn: (...items: any[]) => void;
  export const logError: (...items: any[]) => void;
  export const logSuccess: (...items: any[]) => void;
  export const logEntries: (configs: IWebpackConfig[]) => void;
}
declare module '@teku/builder/src/plugins/ImportReplacementPlugin' {
  import type { Compiler } from 'webpack';
  import type { IImportReplacementMap } from '@teku/builder/src/interfaces'
  class ImportReplacementPlugin {
    readonly replacementMap: IImportReplacementMap;
    readonly pattern?: string | RegExp | undefined;
    constructor (replacementMap: IImportReplacementMap, pattern?: string | RegExp | undefined);
    apply (compiler: Compiler): void;
  }
  export default ImportReplacementPlugin;
}
declare module '@teku/builder/src/filters/replaceImports' {
  import type { IFilter } from '@teku/builder/src/interfaces'
  const replaceImports: IFilter;
  export default replaceImports;
}
declare module '@teku/builder/src/lib/dts/index' {
  import { type CompilerOptions } from 'typescript';
  import EventEmitter from 'events';
  interface IGenerateOptions {
    name: string;
    inputDir: string;
    main?: string;
    projectPath?: string;
    outputPath?: string;
    files?: string[];
    references?: string[];
  }
  export class Dts extends EventEmitter {
    generate ({ name, main, inputDir, projectPath, outputPath, files, references }: IGenerateOptions): Promise<void>;
    getTsConfig (inputDir: string, projectPath?: string): Promise<{
      fileNames: string[];
      compilerOptions: CompilerOptions;
    }>;
  }
  interface IDtsWriterOptions {
    main?: string;
    name: string;
    references?: string[];
    excludedPatterns?: string[];
    resolvedModule?: (resolution: IModuleResolution) => string;
    resolvedImport?: (resolution: IModuleImportResolution) => string;
  }
  interface IModuleResolution {
    currentModule: string;
  }
  interface IModuleImportResolution {
    currentModule: string;
    importedModule: string;
    isExternal?: boolean;
  }
  export class DtsWriter extends EventEmitter {
    constructor (options: IDtsWriterOptions);
    write (inputDir: string, outputPath: string, compilerOptions: CompilerOptions, filePaths: string[]): Promise<void>;
  }
}
declare module '@teku/builder/src/plugins/DtsPlugin/index' {
  import type { Compiler } from 'webpack';
  import type { IPathResolver } from '@teku/builder/src/interfaces'
  class DtsPlugin {
    readonly path: IPathResolver;
    constructor (rootPath: string);
    apply (compiler: Compiler): void;
  }
  export default DtsPlugin;
}
declare module '@teku/builder/src/filters/generateDts' {
  import type { IFilter } from '@teku/builder/src/interfaces'
  const generateDts: IFilter;
  export default generateDts;
}
declare module '@teku/builder/src/filters/devServer' {
  import type { IFilter } from '@teku/builder/src/interfaces'
  const devServer: IFilter;
  export default devServer;
}
declare module '@teku/builder/src/ConfigDeps' {
  import type { IConfigDeps, IConfigDepsSetData, IDepWithDeps } from '@teku/builder/src/interfaces';
  export default class ConfigDeps implements IConfigDeps {
    get dependencies (): string[];
    requires (name: string): boolean;
    set (name: string, data: IConfigDepsSetData): IDepWithDeps;
    get (name: string): IDepWithDeps | undefined;
    unset (name: string): void;
  }
}
declare module '@teku/builder/src/ConfigEditor' {
  import type { IBuilderOptions, IConfigCustomizer, IConfigEditor, IConfigEditorParams, IEntryFilter, IFilter, IPathResolver, ITargetedExpandedEntries, IWebpackConfigs } from '@teku/builder/src/interfaces';
  export default class ConfigEditor implements IConfigCustomizer, IConfigEditor {
    readonly path: IPathResolver;
    constructor ({ envName, rootPath, filters, deps }: IConfigEditorParams);
    get configs (): IWebpackConfigs;
    get entries (): ITargetedExpandedEntries;
    get options (): IBuilderOptions;
    filter (filterName: string, filter: IFilter | null): void;
    updateEntries (entryFilter: IEntryFilter): void;
    updateOptions (customOptions: Partial<IBuilderOptions>): void;
    init (): Promise<void>;
  }
}
declare module '@teku/builder/src/lib/packages' {
  export const install: (...packages: string[]) => Promise<void>;
  export const getYarnVersion: () => Promise<string>;
  export const installSdk: (name: string) => Promise<void>;
  export const moduleFromFile: (path: string) => Promise<any>;
  export const moduleFromText: (name: string, code: string) => any;
}
declare module '@teku/builder/src/configs' {
  import type { IBuildEnvironment, IConfigDeps, IConfigEditor, IWebpackConfig } from '@teku/builder/src/interfaces';
  export const getConfigs: (rootPath: string, envName?: IBuildEnvironment) => Promise<{
    deps: IConfigDeps;
    editor: IConfigEditor;
    configs: IWebpackConfig[];
  }>;
}
declare module '@teku/builder/src/cmd/options' {
  import { Option } from 'commander';
  export const nodeEnv: Option;
  export const path: Option;
}
declare module '@teku/builder/src/cmd/dev' {
   const _default: {
    description: string;
    action: (options: any) => Promise<void>;
    options: import("commander").Option[];
  };
  export default _default;
}
declare module '@teku/builder/src/cmd/questions' {
  import type { CheckboxQuestionOptions, ConfirmQuestionOptions } from 'inquirer';
  interface CheckBoxOptions extends Omit<CheckboxQuestionOptions, 'choices'> {
    choices: string[];
  }
  export const components: CheckBoxOptions;
  export type IComponentAnswer = string[];
  export const sdk: ConfirmQuestionOptions;
  export type ISdkAnswer = boolean;
  export const editorConfigs: ConfirmQuestionOptions;
  export type IEditorConfigsAnswer = boolean
  const allQuestions: any;
  type IAskQuestionName = keyof typeof allQuestions;
  type IAskQuestions = Record<string, typeof allQuestions[IAskQuestionName]>;
  export const ask: <T>(questions: IAskQuestions) => Promise<T>;
}
declare module '@teku/builder/src/cmd/init/installPackages' {
  import type { IConfigDeps } from '@teku/builder/src/interfaces';
  import { type IComponentAnswer, type ISdkAnswer } from '@teku/builder/src/cmd/questions';
  interface IInstallPackagesParams {
    answers: {
      components: IComponentAnswer;
      sdk: ISdkAnswer;
    };
    deps: IConfigDeps;
  }
  export const installPackages: ({ answers, deps }: IInstallPackagesParams) => Promise<void>;
}
declare module '@teku/builder/src/cmd/init/copyConfigs' {
  import { type IConfigEditor, type IConfigDeps } from '@teku/builder/src/interfaces';
  import { type IEditorConfigsAnswer } from '@teku/builder/src/cmd/questions';
  interface ICopyConfigsParams {
    answers: {
      editorConfigs: IEditorConfigsAnswer;
    };
    deps: IConfigDeps;
    editor: IConfigEditor;
  }
  export const copyConfigs: ({ answers, deps, editor }: ICopyConfigsParams) => Promise<void>;
}
declare module '@teku/builder/src/cmd/init/updatePackageJson' {
  import { type IConfigEditor, type IConfigDeps } from '@teku/builder/src/interfaces';
  interface IUpdatePackageJsonParams {
    modify?: boolean;
    deps: IConfigDeps;
    editor: IConfigEditor;
  }
  export const updatePackageJson: ({ modify, deps, editor }: IUpdatePackageJsonParams) => Promise<void>;
}
declare module '@teku/builder/src/cmd/init' {
   const _default: {
    description: string;
    action: (options: any) => Promise<void>;
    options: import("commander").Option[];
  };
  export default _default;
}
declare module '@teku/builder/src/plugins/ProgressReportPlugin' {
  import type { Compiler } from 'webpack';
  export default class ProgressReportPlugin {
    apply (compiler: Compiler): void;
  }
}
declare module '@teku/builder/src/cmd/build' {
  import { type IBuildEnvironment } from '@teku/builder/src/interfaces';
  interface IBuildOptions {
    path: string;
    nodeEnv: IBuildEnvironment;
  } const _default: {
    description: string;
    action: (options: IBuildOptions) => Promise<void>;
    options: import("commander").Option[];
  };
  export default _default;
}
declare module '@teku/builder/src/App' {
  import { Command } from 'commander';
  export default class App extends Command {
    constructor ();
  }
}
declare module '@teku/builder/builder/cli/index' {
  export type { IFilter, IBuilderCustomOptions } from '@teku/builder/src/interfaces';
}
declare module 'builder/config/packages/dummy/cli/_index' {
  declare const main: () => Promise<void>;
}
declare module '@teku/builder/builder/tests/mocks/mockConfigs' {
  import type { IFilter, IBuilderOptions } from '@teku/builder/src/interfaces';
  export const getMockConfig: (options?: Partial<IBuilderOptions>, filters?: Record<string, IFilter>) => Promise<import("../../src/interfaces").IWebpackConfigs>;
}
declare module '@teku/builder' {
  export * from '@teku/builder/cli/index'
}
