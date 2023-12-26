/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import {
  forEachChild,
  SyntaxKind,
  createCompilerHost,
  createProgram,
  createSourceFile,
  ScriptTarget,
} from 'typescript'
import type {
  SourceFile,
  Node,
  CompilerOptions,
  LiteralExpression,
} from 'typescript'
import { type IPathResolver, resolver, normalize, resolve, merge, getDir } from '@abux/paths'
import EventEmitter from 'events'
import { type WriteStream, createWriteStream } from './fs'
import { minimatch } from 'minimatch'
import { NodeKinds, getTsError, removeExtension, DTSLEN, EOL, processTree } from './helpers'
import type { IModuleResolution, IDtsWriterOptions, IModuleImportResolution } from './interfaces'

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
        '**/.yarn/**/*.d.ts',
      ],
      ...options,
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
        currentModule: inDir.relative(removeExtension(filePath)),
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
        ...this.externalModules.map(name => `  - ${name}`),
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
    const currentModule = '/' + removeExtension(this.inDir?.relative(filePath) || '')

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
          currentModule,
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
          currentModule,
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
    this.writeOutput(this.deduplicateLines(lines).join(EOL))
    this.writeOutput('}')
  }

  protected deduplicateLines (lines: string[]) {
    return lines
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
        isExternal,
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
    return !isExternal ? `${this.options.name}/${moduleId.replace(/^\//, '')}` : moduleId.replace(/^\//, '')
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
