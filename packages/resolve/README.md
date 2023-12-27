@abxvn/resolve
=====
[![build][badge-build]][changelog]
[![version][npm-version-badge]][npm-url]
[![downloads][npm-downloads-badge]][npm-url]
[![code style][code-style-badge]][code-style-url]

Provide an async [`node require.resolve algorithmn`](https://nodejs.org/api/modules.html#modules_all_together), with **extra features:**
  - ⚡ Blazingly faster comparing to vanilla [require.resolve](https://nodejs.org/api/moduleshtml#modules_require_resolve_request_options) ([bench](#benchmarks)) (Especially when you need to work with large amount of modules)
  - 🌟 Supports resolving with [Yarn PnP API](https://yarnpkg.com/features/pnp)
  - 🌇 Supports resolving local packages, Yarn and Npm global packages, symlinks, workspaces, directory and files
  - _Allow multiple module resolving using wildcard (*) (coming soon)_
  - _Allow advanced search using file contents search (coming soon)_

**Table of contents**
* [Installation](#installation)
* [Usage](#usage)
  + [Resolve in async way](#resolve-in-async-way)
  + [Resolve modules](#resolve-modules)
  + [Options](#options)
  + [Play with CLI](#play-with-cli)
  + [Resolve in classic way](#resolve-in-classic-way)
* [Benchmarks](#benchmarks)
* [Changelog](#changelog)
* [Contribution](#contribution)

Installation
-----
Install using `yarn` or `npm`:
```
yarn add @abxvn/resolve
```

```
npm add @abxvn/resolve
```

Usage
----
### Resolve in async way
The `resolve` supports asynchronously resolving:
- full path to a file
- or a module's main (entry) path, to be used with `require`

```ts
import { resolve } from `@abxvn/resolve`

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
import { resolveModule } from `@abxvn/resolve`

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
import { resolve } from `@abxvn/resolve`

resolve('moduleB', options)
```

All options are optional (We already provided a good configuration for you):
|        **Name**       | **Type** |                                                            **Description**                                                            |            **Default**           |
|:---------------------:|:--------:|:-------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------:|
| callerPath           | string   | Base path to resolve requested modules | current script path (or working directory)                            |
| moduleDirs | string[] | _(non pnp)_ node_modules paths | resolving up algorithm including global npm or yarn packages |

### Play with CLI

You can quickly get any modules or files requirable path by this command:

```bash
resolve <...paths>
```

if you want CLI to search for module metadata, please call with flag `-m` or `--metadata`, for example:

```bash
resolve @abxvn/resolve lodash -m
```

### Resolve in classic way
You can also `resolve` in classic, I mean synchronously resolving, but with this tool's extra features as mentioned earlier:
- Custom caller path for starting point of resolving
- Custom list of node_modules dirs for searching

```ts
import { resolveSync } from `@abxvn/resolve`

// Entry point / main to require
// pnp: <dir>/.yarn/cache/.../packageA/index.js
// non-pnp: <dir>/node_modules/packageA/index.js
console.log(resolveSync('packageA'))

// full path <dir>/src/index.js
console.log(resolveSync('./src/index.js'))
```

Benchmarks
-----
We tested with 2 cases, to compare speed using vanilla `require.resolve` and this library's resolver. Here are the results:

**Test loading 10 packages**

<img width="494" alt="Screen Shot 2021-03-23 at 00 08 01" src="https://user-images.githubusercontent.com/13363340/112029482-e1251f00-8b6b-11eb-9cf8-8074f72de6ab.png">

**Test loading 80 packages**

<img width="494" alt="Screen Shot 2021-03-23 at 00 07 18" src="https://user-images.githubusercontent.com/13363340/112029502-e6826980-8b6b-11eb-9e16-bd6c790d003b.png">

All tests were done on my Mac intel i5 10th (2020), RAM 16 GB

Changelog
-----
See [CHANGELOG.md][changelog]

Contribution
-----

All PRs and ideas for improvement are welcomed. 

If you got any issues using this package, don't hesitate to create new [🐞 Bug report][issues] with a proper `package:<name>` label.

Feel free to clone this project, make changes that your feel necessary and pull request anytime you want.

Install dependencies and run development build:
```
yarn install
yarn start
```

**Working on your first Pull Request?**

You can learn how from this free video series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of good first issues that contain bugs that have a relatively limited scope. This is a great place to get started.

-----
Cheers 🍻

[changelog]: https://github.com/abxvnvn/source/blob/main/packages/resolve/CHANGELOG.md
[issues]: https://github.com/abxvnvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Apackage%3Aresolve
[good-first]: https://github.com/abxvnvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Aflag%3Agood-first
[badge-build]: https://github.com/abxvnvn/source/actions/workflows/build.yaml/badge.svg
[npm-url]: https://www.npmjs.com/package/@abxvn/resolve
[npm-downloads-badge]: https://img.shields.io/npm/dw/@abxvn/resolve
[npm-version-badge]: https://img.shields.io/npm/v/@abxvn/resolve
[code-style-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[code-style-url]: https://standardjs.com
