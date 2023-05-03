import execa from 'execa'

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
