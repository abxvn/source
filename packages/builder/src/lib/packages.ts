import execa from 'execa'
import Module from 'module'
import { resolve } from './paths'
import { readFile } from 'fs-extra'

const cliOptions = {
  env: {
    FORCE_COLOR: 'true'
  }
}

export const install = async (...packages: string[]) => {
  const subProcess = execa('yarn', ['add', '--silent', ...packages], cliOptions)

  // Filter out specific messages and pipe remaining output to process.stdout
  subProcess.stdout?.on('data', (chunk: Buffer) => {
    const line = chunk.toString()

    if (!line.includes('fetched from')) {
      process.stdout.write(line)
    }
  })

  subProcess.stderr?.pipe(process.stderr)

  await subProcess
}

export const getYarnVersion = async (): Promise<string> => {
  const { stdout } = await execa('yarn', ['--version'], cliOptions)

  return stdout.match(/\d+(\.\d+)*/)?.[0] || ''
}

export const installSdk = async (name: string) => {
  const subProcess = execa('yarn', ['dlx', '@yarnpkg/sdks', name], cliOptions)

  subProcess.stdout?.pipe(process.stdout)

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
