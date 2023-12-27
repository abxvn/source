/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testRegex: '.+/*\\.(test|spec)\\.(ts|tsx)$',
  preset: 'ts-jest',
  // testEnvironment: 'node'
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest'
      // { tsconfig: require('@abxvn/resolve').resolve('./custom.config.json') }
    ]
  }
}
