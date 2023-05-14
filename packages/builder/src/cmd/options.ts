import { Option } from 'commander'

export const nodeEnv = new Option('--node-env <env>', 'Specify build environment')
  .choices(['development', 'production'])
  .default('development')
  .env('NODE_ENV')

export const path = new Option('--path <path>', 'Specify root path for compilation')
  .default(process.cwd())

export const production = new Option('--production', 'Production build')
  .default(false)
