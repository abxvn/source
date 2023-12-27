@abxvn/builder
=====
[![build][badge-build]][changelog]
[![version][npm-version-badge]][npm-url]
[![downloads][npm-downloads-badge]][npm-url]
[![code style][code-style-badge]][code-style-url]

<img src="https://i.imgflip.com/8akbxm.jpg" alt="Features" width="300" style="margin: 0 auto" />

**Table of contents**
+ [Usage](#usage)
  - [Scaffold new code base](#scaffold-new-code-base)
  - [Commands](#commands)
  - [Customization](#customization)
+ [Changelog](#changelog)
+ [Contribution](#contribution)

Usage
-----
### Scaffold new code base

*Optionally, for yarn berry only and if you start with an empty repo, you can setup yarn berry by: `yarn init -2`*

Pick **one of** these commands for the builder to setup necessary dependencies and code base:

```
pnpm dlx @abxvn/builder init
npx @abxvn/builder init
yarn dlx @abxvn/builder init
```

Usage: @abxvn/builder init [options]
```
Options:
  --path <path>  Specify root path for compilation (default: "current folder")
  --pm <name>    Optional package manager (choices: "pnpm", "npm", "yarn")
  -h, --help     display help for command
```

### Commands

_Documentation coming soon_

### Customization

_Documentation coming soon_

Changelog
-----
See [CHANGELOG.md][changelog]

Contribution
-----

All PRs and ideas for improvement are welcomed. 

If you got any issues using this package, don't hesitate to create new [🐞 Bug report][issues] with a proper `package:<name>` label.

Feel free to clone this project, make changes that your feel necessary and pull request anytime you want.

Install dependencies and run development build
```
pnpm install
pnpm start
```

**Working on your first Pull Request?**

You can learn how from this free video series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of good first issues that contain bugs that have a relatively limited scope. This is a great place to get started.

-----
Cheers 🍻

[changelog]: https://github.com/abxvn/source/blob/main/packages/builder/CHANGELOG.md
[issues]: https://github.com/abxvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Apackage%3Abuilder
[good-first]: https://github.com/abxvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Aflag%3Agood-first
[badge-build]: https://github.com/abxvn/source/actions/workflows/build.yaml/badge.svg
[npm-url]: https://www.npmjs.com/package/@abxvn/builder
[npm-downloads-badge]: https://img.shields.io/npm/dw/@abxvn/builder
[npm-version-badge]: https://img.shields.io/npm/v/@abxvn/builder
[code-style-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[code-style-url]: https://standardjs.com
