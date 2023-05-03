import execa from 'execa'

export { copy } from 'fs-extra'

const cliOptions = {
  env: {
    FORCE_COLOR: 'true'
  }
}

export const install = async (...packages: string[]) => {
  const subProcess = execa('yarn', ['add', '--silent', ...packages], cliOptions)

  subProcess.stdout?.pipe(process.stdout)

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
