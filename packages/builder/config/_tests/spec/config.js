import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  rootDir: resolve(__dirname, '../..'),
  setupFilesAfterEnv: [
    '<rootDir>/tests/spec/setup.mjs'
  ],
  testRegex: '.+/*\\.(test|spec)\\.(ts|tsx)$',
  // preset: 'ts-jest',
  // transform: {
  //   '^.+\\.tsx?$': [
  //     'ts-jest'
  //     // { tsconfig: require('@abxvn/resolve').resolve('./custom.config.json') }
  //   ]
  // },
  extensionsToTreatAsEsm: ['.ts'],
  // verbose: true,
  // preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }]
  }
}
