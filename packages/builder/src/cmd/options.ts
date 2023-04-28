import { Option } from 'commander'

export const nodeEnv = new Option('--node-env <env>', 'Specify build environment')
  .choices(['development', 'production'])
  .default('development')
  .env('NODE_ENV')

export const path = new Option('--entry <path>', 'Specify paths to list entry files for compilation')
  .default('packages/*')
  .env('ENTRY')
