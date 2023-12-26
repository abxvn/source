/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import {
  SyntaxKind, forEachChild, parseConfigFileTextToJson, parseJsonConfigFileContent, sys,
} from 'typescript'
import type {
  CompilerOptions,
  SourceFile,
  Diagnostic,
  NamedExports,
  Node,
  ImportDeclaration,
  ExternalModuleReference,
  StringLiteral,
  ExportAssignment,
  ExportDeclaration,
  ModuleDeclaration,
  VariableStatement,
} from 'typescript'
import { type IReplacer } from './interfaces'
import { readFile } from 'fs-extra'
import { getDir } from '@abux/paths'

export const DTSLEN = '.d.ts'.length
export const EOL = '\n'

export const NodeKinds = {
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
  },
}

export const removeExtension = (filePath: string) => filePath.replace(/(\.d)?\.ts|\.js$/, '')

/**
 * A helper that takes TypeScript diagnostic errors and returns an error
 * object.
 * @param diagnostics The array of TypeScript Diagnostic objects
 */
export const getTsError = (diagnostics: Diagnostic[]) => {
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

/**
 * Load and parse a TSConfig File
 * @param options The dts-generator options to load config into
 * @param fileName The path to the file
 */
export const parseTsConfig = async (fileName: string): Promise<{
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
    compilerOptions: configParseResult.options,
  }
}

export const processTree = (sourceFile: SourceFile, replacer: IReplacer): string[] => {
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
