import type { Node } from 'typescript'

export interface IDtsFilters {
  filePatterns?: string[]
}

export interface IGenerateOptions {
  // name of package
  name: string
  // input directory to list files
  inputDir: string
  // optional, main module, default is /index
  main?: string
  // path to locate tsconfig.json file
  // if it's not located in inputDir
  projectPath?: string
  // optional, path to place index.d.ts file
  // if omitted, index.d.ts file will be placed inside input dir
  outputPath?: string
  // optional, list of files
  // if omitted, the full list of files will be loaded
  // from parsed ts configuration
  files?: string[]
  // external types or path references
  references?: string[]
  // only emit files matching patterns
  filePatterns?: string[]
}

export interface IDtsWriterOptions {
  name: string
  main?: string
  outputPath: string

  references?: string[]
  // exclude files
  excludedPatterns?: string[]
  // return empty string '' to ignore module
  resolvedModule?: (resolution: IModuleResolution) => string
  // return empty string '' to ignore module
  resolvedImport?: (resolution: IModuleImportResolution) => string
}

export interface IModuleResolution {
  currentModule: string
}

export interface IModuleImportResolution {
  currentModule: string
  importedModule: string
  isExternal?: boolean
}

export type IReplacer = (node: Node) => string | undefined
