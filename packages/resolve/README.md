@teku/resolve
=====
Provide an async [`node require.resolve algorithmn`](https://nodejs.org/api/modules.html#modules_all_together), with **extra features:**
  - ⚡ Blazingly faster comparing to vanilla [require.resolve](https://nodejs.org/api/moduleshtml#modules_require_resolve_request_options) ([bench](#benchmarks)) (Especially when you need to work with large amount of modules)
  - 🌟 Supports resolving with [Yarn PnP API](https://yarnpkg.com/features/pnp)
  - 🌇 Supports resolving local packages, Yarn and Npm global packages, symlinks, workspaces, directory and files
  - _Allow multiple module resolving using wildcard (*) (coming soon)_
  - _Allow advanced search using file contents search (coming soon)_

**Table of contents**
+ [Installation](#installation)
+ [Usage](#usage)
  - [Resolve in async way](#resolve-in-async-way)
  - [Resolve modules](#resolve-modules)
  - [Options](#options)
  - [Play with CLI](#play-with-cli)
+ [Benchmarks](#benchmarks)
+ [Contribution](#contribution)

Installation
-----
Install using `yarn` or `npm`:
```
yarn add @teku/resolve
```

```
npm add @teku/resolve
```

Usage
----
### Resolve in async way
The `resolve` supports asynchronously resolving:
- full path to a file
- or a module's main (entry) path, to be used with `require`

```ts
import { resolve } from `@teku/resolve`

// Entry point / main to require
// pnp: <dir>/.yarn/cache/.../packageA/index.js
// non-pnp: <dir>/node_modules/packageA/index.js
console.log(resolve('packageA'))

// full path <dir>/src/index.js
console.log(resolve('./src/index.js'))

// full path <dir>/packages/workspaceA/main.js
// (main.js) is defined in workspaceA's package.json
console.log(resolve('workspaceA'))
console.log(resolve('../localWorkspaceB'))
```
### Resolve modules

The `resolveModule` supports asynchronously resolving module metadata

```ts
import { resolveModule } from `@teku/resolve`

console.log(resolveModule('packageA')) // => IModule
console.log(resolveModule('workspaceA')) // => IModule
console.log(resolveModule('../localWorkspaceB')) // => IModule
```

The resolved module metadata is:
```ts
interface IModule {
  // whether the module exists or not
  exists: boolean
  // input resolve query
  query: string
  // module dir path
  path: string
  // module main (entry) script
  main: string
  // module name
  name: string
  // module version
  version: string
  // module dependencies
  dependencies: string[]
  // error while resolving module
  error?: Error
}
```

### Options
We can pass custom options into the resolver:

```js
import { resolve } from `@teku/resolve`

resolve('moduleB', options)
```

All options are optional (We already provided a good configuration for you):
|        **Name**       | **Type** |                                                            **Description**                                                            |            **Default**           |
|:---------------------:|:--------:|:-------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------:|
| callerPath           | string   | Base path to resolve requested modules | current script path (or working directory)                            |
| moduleDirs | string[] | _(non pnp)_ node_modules paths | resolving up algorithm including global npm or yarn packages |

### Resolves modules using custom file contents filter
(Coming soon)

### Play with CLI

You can quickly get any modules or files requirable path by this command:

```bash
resolve <...paths>
```

if you want CLI to search for module metadata, please call with flag `-m` or `--metadata`, for example:

```bash
resolve @teku/resolve lodash -m
```

Benchmarks
-----
We tested with 2 cases, to compare speed using vanilla `require.resolve` and this library's resolver. Here are the results:

**Test loading 10 packages**

<img width="494" alt="Screen Shot 2021-03-23 at 00 08 01" src="https://user-images.githubusercontent.com/13363340/112029482-e1251f00-8b6b-11eb-9cf8-8074f72de6ab.png">

**Test loading 80 packages**

<img width="494" alt="Screen Shot 2021-03-23 at 00 07 18" src="https://user-images.githubusercontent.com/13363340/112029502-e6826980-8b6b-11eb-9e16-bd6c790d003b.png">

All tests were done on my Mac intel i5 10th (2020), RAM 16 GB

Contribution
-----
All contributions are welcomed. Feel free to clone this project, make changes that your feel necessary and pull request anytime you want.

Install dependencies
```
yarn install
```

Run development build
```
yarn start
```

If you have any other suggestions, you can even open new issues with `type: enhancement` and `package: resolve` labels.

-----

🍻 Cheers
