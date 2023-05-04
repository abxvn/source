import execa from 'execa'
import { Module } from 'module'
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

console.log((Module as any)._cache)

const moduleCaches: Record<string, typeof Module> = (Module as any)._cache || {}

export const module = async (path: string): Promise<typeof Module> => {
  const resolvedPath = resolve(path)

  if (moduleCaches[resolvedPath]) {
    return (moduleCaches[resolvedPath] as any).exports
  }

  const fileCode = await readFile(resolvedPath, 'utf8')

  return moduleFromText(resolvedPath, fileCode)
}

export const moduleFromText = (name: string, code: string): typeof Module => {
  const m = new Module(name)

  (m)._compile(code)

  return m.exports
}
