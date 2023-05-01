import execa from 'execa'

export { copy } from 'fs-extra'

export const install = async (...packages: string[]) => {
  const subProcess = execa('yarn', ['add', ...packages])

  subProcess.stdout?.pipe(process.stdout)

  await subProcess
}

export const getYarnVersion = async (): Promise<string> => {
  const { stdout } = await execa('yarn', ['--version'])

  return stdout.match(/\d+(\.\d+)*/)?.[0] || ''
}

export const installSdk = async (name: string) => {
  const subProcess = execa('yarn', ['dlx', '@yarnpkg/sdks', name])

  subProcess.stdout?.pipe(process.stdout)

  await subProcess
}
