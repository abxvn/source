# labs

### Init source code
```
yarn init -2
yarn add webpack typescript eslint
yarn dlx @yarnpkg/sdks vscode
```

Copy these files / folders:
- .vscode
- .editorconfig
- .gitattributes
- .gitignore

Enable / install recommended VSCode extensions

Copy `config/ts` folder and `.eslintignore`, `.eslintrc.js`

Add workspaces into `package.json`

```
yarn add -D jest @types/jest
yarn add -D eslint-plugin-jest
```

Jest Config:
```
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  // testEnvironment: 'node'
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: require.resolve('./config/ts/tsconfig.packages.json') }
    ]
  }
}
```
