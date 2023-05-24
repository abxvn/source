/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import execa from 'execa'
import Module from 'module'
import { resolve } from './paths'
import { readFile } from './vendors'

const cliOptions = {
  env: {
    FORCE_COLOR: 'true'
  }
}

interface IWritable {
  write: (message: string) => void
}

interface IInstallOptions {
  dev?: boolean
  outputStream?: IWritable
  errorStream?: IWritable
}

export const install = async (
  packages: string[],
  options?: IInstallOptions
) => {
  const {
    dev = false,
    outputStream = process.stdout,
    errorStream = process.stderr
  } = options || {}

  const subProcess = execa('yarn', [
    'add',
    '--silent',
    dev ? '--dev' : '',
    ...packages
  ].filter(Boolean), cliOptions)

  if (outputStream) {
    // Filter out specific messages and pipe remaining output to process.stdout
    subProcess.stdout?.on('data', (chunk: Buffer) => {
      const line = chunk.toString()

      if (!line.includes('fetched from')) {
        outputStream.write(line)
      }
    })
  }

  if (errorStream) {
    subProcess.stderr?.pipe(errorStream as NodeJS.WritableStream)
  }

  await subProcess
}

export const getYarnVersion = async (): Promise<string> => {
  const { stdout } = await execa('yarn', ['--version'], cliOptions)

  return stdout.match(/\d+(\.\d+)*/)?.[0] || ''
}

export const installSdk = async (name: string, options?: Omit<IInstallOptions, 'dev'>) => {
  const {
    outputStream = process.stdout,
    errorStream = process.stderr
  } = options || {}
  const subProcess = execa('yarn', ['dlx', '@yarnpkg/sdks', name], cliOptions)

  if (outputStream) {
    // Filter out specific messages and pipe remaining output to process.stdout
    subProcess.stdout?.on('data', (chunk: Buffer) => {
      const line = chunk.toString()

      if (!line.includes('fetched from')) {
        outputStream.write(line)
      }
    })
  }

  if (errorStream) {
    subProcess.stderr?.pipe(errorStream as NodeJS.WritableStream)
  }

  await subProcess
}

const moduleCaches: Record<string, any> = (Module as any)._cache || {}

export const moduleFromFile = async (path: string): Promise<any> => {
  const resolvedPath = resolve(path)

  if (moduleCaches[resolvedPath]) {
    return moduleCaches[resolvedPath].exports
  }

  const fileCode = await readFile(resolvedPath, 'utf8')

  return moduleFromText(resolvedPath, fileCode)
}

type IModuleCompile = (code: string, path: string) => void
export const moduleFromText = (name: string, code: string): any => {
  const moduleObject = new Module(name)
  const moduleCompile: IModuleCompile = (moduleObject as any)._compile

  if (!moduleCompile) {
    throw Error('module _compiler is not function')
  }

  moduleCompile.apply(moduleObject, [code, name])

  return moduleObject.exports
}
