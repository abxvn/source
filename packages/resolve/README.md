@teku/resolve
=====
Provide an async [`node require.resolve algorithmn`](https://nodejs.org/api/modules.html#modules_all_together), with **extra features:**
  - ⚡ Blazingly faster comparing to vanilla [require.resolve](https://nodejs.org/api/moduleshtml#modules_require_resolve_request_options) ([bench](#benchmarks)) (Especially when you need to work with large amount of modules)
  - 📄 Load package.json contents by the time modules are resolved to be used anytime (built-in function only return requireable paths)
  - 🌇 Supports Yarn and Npm global, symlinks by default (can be disabled if you want)
  - 🌟 Allow multiple module resolving using wildcard (*)
  - _Allow advanced search using file contents search (coming soon)_

**Table of contents**
+ [Installation](#installation)
+ [Usage](#usage)
  - [Resolves modules in async way](#resolves-modules-in-async-way)
  - [Options](#options)
  - [Resolves wildcard modules](#resolves-wildcard-modules)
  - [Play with CLI](#play-with-cli)
+ [TekuModule](#tekumodule)
+ [Benchmarks](#benchmarks)
+ [Contribution](#contribution)

Installation
-----
Install using `yarn` or `npm`:
```
yarn add @teku/resolve
```

Usage
----
### Resolves modules in async way
The `resolve` function return a Promise with module's entry path and package.json contents, which some other information (as a [TekuModule](#TekuModule))
```js
import resolve from `@teku/resolve`

/** @var ITekuModule */
const module = await resolve('moduleA')

// Package.json contents
console.log(module.meta) // { name: "moduleA", dependencies ... }
// Entry point / main to require
console.log(module.entry) // node_modules/moduleA/index.js
```

### Options
We can pass custom options into the resolver:

```js
import resolve, { createResolver } from `@teku/resolve`

resolve('moduleB', options) // pass through resolve function
createResolver(options) // pass through a shared resolver
```

All options are optional (We already provided a good configuration for you):
|        **Name**       | **Type** |                                                            **Description**                                                            |            **Default**           |
|:---------------------:|:--------:|:-------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------:|
| types                 | string[] | Supported types of module, whether it's loaded from a file, a directory or a package (node_modules). By default we supports all types | ['file', 'directory', 'package'] |
| baseDirPath           | string   | Base directory to resolve modules, if it isn't provided, the current working directory will be used                                   | _cwd_                            |
| baseNodeModulesPath   | string   | Node_modules folder inside base directory                                                                                             | 'node_modules'                   |
| packageFile           | string   | Package meta file (can be customized)                                                                                                 | 'package.json'                   |
| extensions            | string[] | Extensions of resolved file (if no extensions provided in the path)                                                                   | ['js']                           |
| extraNodeModulesPaths | string[] | Extra node_modules paths other than baseDir/node_modules (By default we support both Yarn and Npm global packages)                    | [_yarnGlobal_, _npmGlobal_]      |

### Resolves wildcard modules

> For now we only support resolving wildcard from node_modules (our use cases). If you need extra features please open new issue with `enhancement` label

For example, to resolve all modules belonging to [`@teku`](https://teku.asia) organization
```js
// {
//    '@teku/form': formModule,
//    '@teku/react': reactModule,
//    '@teku/firebase': firebaseModule
// }
const tekuModules = await resolve('@teku/*')
```

### Resolves modules using custom file contents filter
(Coming soon)

### Play with CLI

You can quickly check any modules' resolved information using command

```bash
resolve <module_paths>
```

if you want CLI to show resolved entry paths only, please call with flag `-p` or `--path-only`, for example:

```bash
resolve @teku/resolve lodash -p
```

TekuModule
-----
This class provide simple APIs to gain information about a resolved module, using path.

There are 3 types of modules (file / directory / package), hopefully this interface shows all the APIs you need:

```typescript
export interface ITekuModule {
  // Determine where module is loaded from
  // Where it's from a file, a directory or a package
  type: ModuleType
  // posible error during module resolving
  error?: Error
  // entry / main path to require module
  entry?: string
  // module metadata, mostly loaded from package.json files
  meta: any
  // module path (provided path)
  path: string

  // Check if module is a Yarn global module
  isYarnGlobal: () => boolean
  // Check if module is a Npm global module
  isNpmGlobal: () => boolean
  // Check if module is a NodeJS core module
  isCore: () => boolean
}
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

If you have any other suggestions, you can even open new issues with `enhancement` label.

-----

🍻 Cheers
