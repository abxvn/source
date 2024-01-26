const { resolve } = require('path')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: resolve(__dirname, '../..'),
  setupFilesAfterEnv: [
    '<rootDir>/tests/spec/setup.js',
  ],
  testRegex: '.+/*\\.spec\\.(ts|tsx)$',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
    ],
  },
}
