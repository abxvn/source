import {
  forEachChild,
  sys,
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
  SyntaxKind,
  createCompilerHost,
  createProgram,
  createSourceFile,
  ScriptTarget
} from 'typescript'
import type {
  NamedExports,
  SourceFile,
  Node,
  Diagnostic,
  CompilerOptions,
  ImportDeclaration,
  ExternalModuleReference,
  StringLiteral,
  ExportAssignment,
  ExportDeclaration,
  ModuleDeclaration,
  LiteralExpression,
  VariableStatement
} from 'typescript'

import { minimatch } from 'minimatch'
import EventEmitter from 'events'
import { type WriteStream, createWriteStream, readFile, pathExists, mkdirp } from 'fs-extra'

import { getDir, merge, normalize, resolve, resolver } from '../paths'
import { type IPathResolver } from '../../interfaces'

const EOL = '\n'
const DTSLEN = '.d.ts'.length

interface IGenerateOptions {
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

export class Dts extends EventEmitter {
  async generate ({
    name,
    main,
    inputDir,
    projectPath,
    outputPath,
    files = [],
    references = [],
    filePatterns = []
  }: IGenerateOptions) {
    let compilerOptions: CompilerOptions = {}
    const inDir = resolver(inputDir)
    const outDir = outputPath ? resolver(outputPath).dir() : inDir

    outputPath = outputPath || inDir.resolve('index.d.ts')

    this.emit('log', `[dts] generate for ${inputDir} > ${outputPath}`)

    /* following tsc behaviour, if a project is specified, or if no files are specified then
    * attempt to load tsconfig.json */
    if (!files.length || projectPath) {
      // if project isn't specified, use baseDir.  If it is and it's a directory,
      // assume we want tsconfig.json in that directory.  If it is a file, though
      // use that as our tsconfig.json.  This allows for projects that have more
      // than one tsconfig.json file.
      const tsConfig = await this.getTsConfig(inputDir, projectPath)

      files = tsConfig.fileNames
      compilerOptions = tsConfig.compilerOptions
    }

    // use input values if tsconfig leaves any of these undefined.
    // this is for backwards compatibility
    compilerOptions.declaration = true
    compilerOptions.target = compilerOptions.target || ScriptTarget.Latest // is this necessary?
    // compilerOptions.moduleResolution = compilerOptions.moduleResolution
    compilerOptions.outDir = compilerOptions.outDir || outDir.rootPath

    const writeInputDirPath = inDir.rootPath || compilerOptions.rootDir || projectPath

    if (!writeInputDirPath) {
      throw Error('[dts] input dir path is required')
    }

    // TODO should compilerOptions.baseDir come into play?
    const writeInputDir = resolver(writeInputDirPath)
    const writeOutputDir = outDir.rootPath || compilerOptions.outDir
    const generatedFiles = files

    const params = [
      `baseDir = "${writeInputDir.rootPath}"`,
      `target = ${compilerOptions.target.toString()}`,
      `outDir = ${writeOutputDir || ''}`,
      `rootDir = ${compilerOptions.rootDir || ''}`,
      `moduleResolution = ${compilerOptions.moduleResolution?.toString() || ''}`,
      'files =',
      ...generatedFiles.map(file => `  ${file}`)
    ]

    this.emit(
      'log:verbose',
      '[dts] params:\n' + params.map(p => `  ${p}`).join('\n')
    )

    await mkdirp(getDir(outputPath))
    const writer = new DtsFilterWriter({
      outputPath,
      name,
      main,
      references
    }, {
      filePatterns
    })

    writer.on('log', msg => this.emit('log', msg))
    writer.on('log:verbose', msg => this.emit('log:verbose', msg))

    await writer.write(
      writeInputDir.rootPath,
      compilerOptions,
      generatedFiles
    )
  }

  private async getTsConfig (inputDir: string, projectPath?: string) {
    const inDir = resolver(inputDir)
    const tsconfigFiles = [
      projectPath && resolver(projectPath).resolve('tsconfig.json'),
      projectPath, // if projectPath is location of tsconfig.json
      inDir.resolve('tsconfig.json')
    ].filter(Boolean) as string[]

    for await (const tsconfigFile of tsconfigFiles) {
      if (await pathExists(tsconfigFile)) {
        this.emit('log', `[dts] tsconfig from ${tsconfigFile}`)

        return await parseTsConfig(tsconfigFile)
      }
    }

    throw Error(`Can't find tsconfig in ${projectPath || inDir.rootPath}`)
  }
}

interface IDtsWriterOptions {
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

interface IModuleResolution {
  currentModule: string
}

interface IModuleImportResolution {
  currentModule: string
  importedModule: string
  isExternal?: boolean
}

export class DtsWriter extends EventEmitter {
  readonly ident = '  '
  readonly options: IDtsWriterOptions

  protected mainId = ''
  protected resolvedMainId = ''
  protected externalModules: string[] = []
  protected inDir?: IPathResolver
  private _output?: WriteStream

  constructor (options: IDtsWriterOptions) {
    super()

    this.options = {
      references: [],
      excludedPatterns: [
        '**/node_modules/**/*.d.ts',
        '**/.yarn/**/*.d.ts'
      ],
      ...options
    }

    if (!this.options.main) {
      this.options.main = 'index'
    }

    this.on('done', () => { this.dispose() })
  }

  async write (
    inputDir: string,
    compilerOptions: CompilerOptions,
    filePaths: string[]
  ) {
    this.mainId = ''
    this.resolvedMainId = ''
    this.externalModules = []
    this.emit('start')
    this.emit('log', '[dtsw] start')

    const host = createCompilerHost(compilerOptions)
    const program = createProgram(filePaths, compilerOptions, host)
    const sourceFiles = program.getSourceFiles()
    const inDir = resolver(inputDir)
    let mainExports: string[] = []

    this.mainId = this.resolveMainId()
    this.inDir = inDir

    this.listExternals(sourceFiles)
    this.emit('log', '[dtsw] process files')
    this.writeReferences()

    sourceFiles.some(sourceFile => {
      const filePath = normalize(sourceFile.fileName)

      // Source file is a default library, or other dependency from another project, that should not be included in
      // our bundled output
      if (!inDir.includes(filePath)) {
        this.emit('log:verbose', `[dtsw] process: ignored library ${filePath}`)

        return false // continue
      }

      if (this.options.excludedPatterns?.some(pattern => minimatch(filePath, pattern))) {
        this.emit('log:verbose', `[dtsw] process: excluded ${filePath}`)

        return false // continue
      }

      // Source file is already a declaration file so should does not need to be pre-processed by the emitter
      if (filePath.slice(-DTSLEN) === '.d.ts') {
        this.emit('log:verbose', `[dtsw] process: d.ts ${filePath}`)
        this.writeDeclaration(sourceFile)

        return false // continue
      }

      const resolvedModuleId = this.resolveModule({
        currentModule: inDir.relative(removeExtension(filePath))
      })

      // We can optionally output the main module if there's something to export.
      if (this.mainId === resolvedModuleId) {
        this.resolvedMainId = resolvedModuleId
        this.emit('log:verbose', `[dtsw] main found ${resolvedModuleId}`)
        mainExports = this.getModuleExports(sourceFile)
      }

      const emitOutput = program.emit(sourceFile, (emittedPath: string, data: string) => {
        // Compiler is emitting the non-declaration file, which we do not care about
        if (emittedPath.slice(-DTSLEN) !== '.d.ts') {
          this.emit('log:verbose', `[dtsw] process: ignored d.ts ${filePath}`)

          return
        }

        this.emit('log:verbose', `[dtsw] process: ts ${filePath}`)
        this.writeDeclaration(createSourceFile(filePath, data, compilerOptions.target as any, true))
      })

      if (emitOutput.emitSkipped || emitOutput.diagnostics.length > 0) {
        this.emit('log:verbose', `[dtsw] process: ts ${filePath} error`)
        throw getTsError(
          emitOutput.diagnostics
            .concat(program.getSemanticDiagnostics(sourceFile))
            .concat(program.getSyntacticDiagnostics(sourceFile))
            .concat(program.getDeclarationDiagnostics(sourceFile))
        )
      }

      return false // continue
    })

    this.writeMainDeclaration(compilerOptions.target, mainExports)

    this.done()
  }

  private listExternals (declarationFiles: readonly SourceFile[]) {
    this.emit('log', '[dtsw] list externals')
    declarationFiles.forEach(sourceFile => {
      processTree(sourceFile, (node: Node) => {
        if (NodeKinds.isModuleDeclaration(node)) {
          const name = node.name

          if (NodeKinds.isStringLiteral(name)) {
            this.externalModules.push(name.text)
          }
        }

        return undefined
      })
    })

    if (!this.externalModules.length) {
      this.emit('log:verbose', '[dtsw] list externals: no externals found')
    } else {
      this.emit('log:verbose', [
        '[dtsw] list externals:',
        ...this.externalModules.map(name => `  - ${name}`)
      ].join('\n'))
    }
  }

  private writeReferences () {
    const pathRefRegex = /^\./

    this.options.references?.forEach((ref: string) => {
      if (pathRefRegex.test(ref)) {
        this.emit('log', `[dtsw] ref.path ${ref}`)
        this.writeOutput(`/// <reference path="${ref}" />`)
      } else {
        this.emit('log', `[dtsw] ref.types ${ref}`)
        this.writeOutput(`/// <reference types="${ref}" />`)
      }
    })
  }

  private writeDeclaration (declarationFile: SourceFile) {
    const filePath = resolve(declarationFile.fileName)
    const currentModule = removeExtension(this.inDir?.relative(filePath) || '')

    if (!currentModule) {
      throw Error(`[dtsw] unable to resolve current module for ${currentModule}`)
    }

    if ((declarationFile as any).externalModuleIndicator) {
      this.writeExternalDeclaration(declarationFile, currentModule)
    } else if (filePath !== this.output?.path) {
      this.emit('log:verbose', `[dtsw] declare ${currentModule} from text`)
      this.writeOutputModule(currentModule, declarationFile.text)
      this.emit('log:verbose', `[dtsw] declare ${currentModule} done`)
    } else {
      this.emit('log:verbose', `[dtsw] declare ignored ${currentModule}`)
    }
  }

  private writeMainDeclaration (buildTarget?: ScriptTarget, mainExports: string[] = []) {
    const main = this.resolvedMainId
    const declarations: string[] = []

    if (!mainExports.length) {
      return
    }

    if (!main) {
      return
    }

    this.emit('log:verbose', `[dtsw] declare:main ${main}`)

    if (!buildTarget || buildTarget < ScriptTarget.ES2015) {
      this.emit('log:verbose', '[dtsw] declare:main require')
      declarations.push(`import main = require('${main}');`)
      declarations.push('export = main;')
    } else {
      if (mainExports.includes('default')) {
        this.emit('log:verbose', '[dtsw] declare:main export default')
        declarations.push(`export { default } from '${main}';`)
      }

      // could be * or named exports
      const hasOtherExports = mainExports.some(e => e !== 'default')

      if (hasOtherExports) {
        this.emit('log:verbose', '[dtsw] declare:main export *')
        declarations.push(`export * from '${main}';`)
      }
    }

    if (!declarations.length) {
      this.emit('log:verbose', '[dtsw] declare:main no valid exports')
    }

    this.writeOutputModule(this.options.name, declarations.join(EOL))
  }

  private getModuleExports (sourceFile: SourceFile) {
    // collected named expxorts
    // or variable statement with modifier export keyword
    // or *
    // or default
    const exportedNames: string[] = []

    forEachChild(sourceFile, node => {
      if (NodeKinds.isExportAssignment(node)) {
        exportedNames.push('default')
      } else if (NodeKinds.isExportDeclaration(node)) {
        exportedNames.push('*')
      } else if (NodeKinds.isNamedExports(node)) {
        node.elements.forEach(element => {
          exportedNames.push(element.propertyName?.getText() || element.name.getText())
        })
      } else if (
        NodeKinds.isVariableStatement(node) &&
        node.modifiers?.some(m => m.kind === SyntaxKind.ExportKeyword) &&
        node.declarationList.declarations.length
      ) {
        exportedNames.push('*')
      }
    })

    return exportedNames
  }

  private writeExternalDeclaration (declarationFile: SourceFile, currentModule: string) {
    const resolvedModuleId = this.resolveModule({ currentModule })

    this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId} (${declarationFile.fileName})`)

    const content = processTree(declarationFile, (node: Node) => {
      if (NodeKinds.isExternalModuleReference(node)) {
        const expression = node.expression as LiteralExpression

        // convert both relative and non-relative module names in import = require(...)
        const resolvedImportedModule: string = this.resolveImport({
          importedModule: expression.text,
          currentModule
        })

        this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: require ${resolvedImportedModule}`)

        return ` require('${resolvedImportedModule}')`
      } else if (NodeKinds.isDeclareKeyWord(node)) {
        this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: ignored declare keyword`)

        return ''
      } else if (
        NodeKinds.isStringLiteral(node) && node.parent &&
        (NodeKinds.isExportDeclaration(node.parent) || NodeKinds.isImportDeclaration(node.parent))
      ) {
        // This block of code is modifying the names of imported modules
        const text = node.text
        const resolvedImportedModule: string = this.resolveImport({
          importedModule: text,
          currentModule
        })

        if (resolvedImportedModule) {
          this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId}: import ${resolvedImportedModule}`)

          return ` '${resolvedImportedModule}'`
        }
      }

      return undefined
    })

    this.writeOutputModule(resolvedModuleId, content.join(''))
    this.emit('log:verbose', `[dtsw] declare:external ${resolvedModuleId} done`)
  }

  protected writeOutput (message: string) {
    this.output.write(message + EOL)
  }

  protected writeOutputModule (moduleId: string, contents: string) {
    const lines = this.filterOutput(contents)

    if (!lines.length) {
      return
    }

    this.emit('log', `[dtsw] declared module ${moduleId}`)
    this.writeOutput(`declare module '${moduleId}' {`)
    this.writeOutput(lines.join(EOL))
    this.writeOutput('}')
  }

  protected filterOutput (contents: string): string[] {
    return contents.split(/[\r\n]+|; |;$/)
      .filter(line => line && line !== 'export {};') // remove empty lines
      .map(line => line.replace(/\t/g, this.ident)) // convert tabs to 2 space idents
      .map(line =>
        `${this.ident}${line}`.replace(/\s{4}/g, this.ident) // fix double indents (4 spaces)
          // .replace(/;$/, '') // removed last semicolon already
          .replace(/ (\w+)\(/, (all, name: string) =>
            name !== 'import' ? ` ${name} (` : all // add space after function names
          )
          .replace(/^\s+(private|protected) .+$/, '') // remove private / protected declarations
      )
      .filter(Boolean)
  }

  protected resolveModule (resolution: IModuleResolution) {
    let resolvedId = resolution.currentModule

    if (this.options.resolvedModule) {
      resolvedId = this.options.resolvedModule(resolution) || resolvedId
    } else {
      resolvedId = this.resolveModuleDefault(resolvedId)
    }

    resolvedId = this.prefixModule(resolvedId)

    this.emit('log:verbose', `[dtsw] resolve ${resolvedId} (${resolution.currentModule})`)

    return resolvedId
  }

  protected resolveImport (resolution: IModuleImportResolution) {
    const isExternal: boolean = this.externalModules.includes(resolution.importedModule) ||
      !/^\./.test(resolution.importedModule)
    const importedModule = !isExternal
      ? merge(getDir(resolution.currentModule), resolution.importedModule)
      : resolution.importedModule

    let resolvedId: string = importedModule

    if (this.options.resolvedImport) {
      resolvedId = this.options.resolvedImport({
        currentModule: resolution.currentModule,
        importedModule,
        isExternal
      }) || resolvedId
    } else {
      resolvedId = this.resolveModuleDefault(resolvedId)
    }

    resolvedId = this.prefixModule(resolvedId, isExternal)

    this.emit('log:verbose', `[dtsw] resolve:import ${resolvedId}${isExternal ? ' (external)' : ''} (${resolution.currentModule}, ${resolution.importedModule})`)

    return resolvedId
  }

  protected resolveModuleDefault (moduleId: string) {
    const resolvedId = moduleId.replace(/^.+\/src/, 'src') // shorten path to `src`
    const removedIndexId = resolvedId.replace(/\/index$/, '')

    if (
      this.mainId !== this.prefixModule(resolvedId) && // keep main id
      removedIndexId !== this.options.name // avoid collision with package name
    ) {
      return removedIndexId
    }

    return resolvedId
  }

  protected resolveMainId () {
    return `${this.options.name}/${this.options.main?.replace(/^\/+/, '') || 'index'}`
  }

  protected prefixModule (moduleId: string, isExternal = false) {
    return !isExternal ? `${this.options.name}/${moduleId}` : moduleId
  }

  private get output (): WriteStream {
    if (!this._output) {
      this._output = createWriteStream(this.options.outputPath, { mode: parseInt('644', 8) })
    }

    return this._output
  }

  protected dispose () {
    this.output?.close()
  }

  protected done () {
    this.emit('log', '[dtsw] done')
    this.emit('done')
  }
}

interface IDtsFilters {
  filePatterns?: string[]
}
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
      lines.join(EOL),
      '}'
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

const NodeKinds = {
  isDeclareKeyWord (node: Node): node is ImportDeclaration {
    return node && node.kind === SyntaxKind.DeclareKeyword
  },
  isImportDeclaration (node: Node): node is ImportDeclaration {
    return node && node.kind === SyntaxKind.ImportDeclaration
  },
  isExternalModuleReference (node: Node): node is ExternalModuleReference {
    return node && node.kind === SyntaxKind.ExternalModuleReference
  },
  isStringLiteral (node: Node): node is StringLiteral {
    return node && node.kind === SyntaxKind.StringLiteral
  },
  isExportDeclaration (node: Node): node is ExportDeclaration {
    return node && node.kind === SyntaxKind.ExportDeclaration
  },
  isExportAssignment (node: Node): node is ExportAssignment {
    return node && node.kind === SyntaxKind.ExportAssignment
  },
  isNamedExports (node: Node): node is NamedExports {
    return node && node.kind === SyntaxKind.NamedExports
  },
  isVariableStatement (node: Node): node is VariableStatement {
    return node && node.kind === SyntaxKind.VariableStatement
  },
  isModuleDeclaration (node: Node): node is ModuleDeclaration {
    return node && node.kind === SyntaxKind.ModuleDeclaration
  }
}

type IReplacer = (node: Node) => string | undefined
const processTree = (sourceFile: SourceFile, replacer: IReplacer): string[] => {
  const codes: string[] = []
  let cursorPosition = 0

  function skip (node: Node) {
    cursorPosition = node.end
  }

  function readThrough (node: Node) {
    codes.push(sourceFile.text.slice(cursorPosition, node.pos))
    cursorPosition = node.pos
  }

  function visit (node: Node) {
    readThrough(node)

    const replacement = replacer(node)

    if (replacement !== undefined) {
      codes.push(replacement)
      skip(node)
    } else {
      forEachChild(node, visit)
    }
  }

  visit(sourceFile)
  codes.push(sourceFile.text.slice(cursorPosition))

  return codes.filter(Boolean)
}

/**
 * Load and parse a TSConfig File
 * @param options The dts-generator options to load config into
 * @param fileName The path to the file
 */
const parseTsConfig = async (fileName: string): Promise<{
  fileNames: string[]
  compilerOptions: CompilerOptions
}> => {
  const configText = await readFile(fileName, { encoding: 'utf8' })
  const result = parseConfigFileTextToJson(fileName, configText)

  if (result.error) {
    throw getTsError([result.error])
  }
  const configObject = result.config
  const configParseResult = parseJsonConfigFileContent(configObject, sys, getDir(fileName))

  if (configParseResult.errors?.length) {
    throw getTsError(configParseResult.errors)
  }

  return {
    fileNames: configParseResult.fileNames,
    compilerOptions: configParseResult.options
  }
}

/**
 * A helper that takes TypeScript diagnostic errors and returns an error
 * object.
 * @param diagnostics The array of TypeScript Diagnostic objects
 */
const getTsError = (diagnostics: Diagnostic[]) => {
  const messages = ['Declaration generation failed']

  diagnostics.forEach(diagnostic => {
    const messageText = typeof diagnostic.messageText === 'string'
      ? diagnostic.messageText
      : diagnostic.messageText.messageText

    // not all errors have an associated file: in particular, problems with a
    // the tsconfig.json don't; the messageText is enough to diagnose in those
    // cases.
    if (diagnostic.file) {
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0)

      messages.push(
        `${diagnostic.file.fileName}(${position.line + 1},${position.character + 1}): ` +
        `error TS${diagnostic.code}: ${messageText}`
      )
    } else {
      messages.push(`error TS${diagnostic.code}: ${messageText}`)
    }
  })

  const error = new Error(messages.join('\n'))

  error.name = 'EmitterError'

  return error
}

const removeExtension = (filePath: string) => filePath.replace(/(\.d)?\.ts|\.js$/, '')
