declare module '@abxvn/dts/lib/interfaces' {
  import type { Node } from 'typescript';
  export interface IDtsFilters {
    filePatterns?: string[];
  }
  export interface IGenerateOptions {
    name: string;
    inputDir: string;
    main?: string;
    projectPath?: string;
    outputPath?: string;
    files?: string[];
    references?: string[];
    filePatterns?: string[];
  }
  export interface IDtsWriterOptions {
    name: string;
    main?: string;
    outputPath: string;
    references?: string[];
    excludedPatterns?: string[];
    resolvedModule?: (resolution: IModuleResolution) => string;
    resolvedImport?: (resolution: IModuleImportResolution) => string;
  }
  export interface IModuleResolution {
    currentModule: string;
  }
  export interface IModuleImportResolution {
    currentModule: string;
    importedModule: string;
    isExternal?: boolean;
  }
  export type IReplacer = (node: Node) => string | undefined;
}
declare module '@abxvn/dts/lib/Dts' {
  /// <reference types="node" />
  import EventEmitter from 'events';
  import type { IGenerateOptions } from '@abxvn/dts/lib/interfaces';
  export class Dts extends EventEmitter {
    generate ({ name, main, inputDir, projectPath, outputPath, files, references, filePatterns, }: IGenerateOptions): Promise<void>;
  }
}
declare module '@abxvn/dts/index' {
  export * from '@abxvn/dts/lib/Dts';
}
declare module '@abxvn/dts' {
  export * from '@abxvn/dts/index'
}
