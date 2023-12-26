/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { ScriptTarget } from 'typescript'
import type { CompilerOptions } from 'typescript'
import EventEmitter from 'events'
import { getDir, resolver } from '@abux/paths'
import { pathExists, mkdirp } from './fs'
import type { IGenerateOptions } from './interfaces'
import { parseTsConfig } from './helpers'
import { DtsFilterWriter } from './DtsFilterWriter'

export class Dts extends EventEmitter {
  async generate ({
    name,
    main,
    inputDir,
    projectPath,
    outputPath,
    files = [],
    references = [],
    filePatterns = [],
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
      ...generatedFiles.map(file => `  ${file}`),
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
      references,
    }, {
      filePatterns,
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
      inDir.resolve('tsconfig.json'),
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
