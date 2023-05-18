@abux/logger
=====
[![build][badge-build]][changelog]
[![version][npm-version-badge]][npm-url]
[![downloads][npm-downloads-badge]][npm-url]

An utility logger for CLI and web, to be reused in our projects

**Table of contents**
* [Features:](#features)
* [Examples](#examples)
  + [Collapsible console logs](#collapsible-console-logs)
  + [Collapsible streams](#collapsible-streams)
  + [Manipulate other streams](#manipulate-other-streams)
  + [Styled loggers](#styled-loggers)
* [Changelog](#changelog)

Features:
-----
+ Collapsible:
  - Designed to work as a log stream
  - Stream writer can be piped and collapsed (replace previous lines with new data)
  - Add watcher to collapse other streams (supports process.stdout and process.stderr too)
  - Handle ANSI escape codes
+ Styled Loggers:
  - Some helper methods for styled loggers
  - Support both browser and CLI color logging

Examples
-----
### Collapsible console logs

```typescript
import { collapse } from '@abux/logger/cli'

// These 2 lines are writen into stdout
collapse.write(`A`)
collapse.write(`B`)

// Previous 2 lines will be removed
collapse.collapse()
```

### Collapsible streams

```typescript
import { collapsible } from '@abux/logger/cli'

collapsible(process.stdout)
collapsible(process.stderr)
collapsible(<anyWritableStream>)
```

### Manipulate other streams

```typescript
import { collapsible } from '@abux/logger/cli'

// All data writen into stdout will be collected
// And can be collapse / hidden later
const stream = collapsible(process.stdout, true)

stream.collapse()
```

### Styled loggers

For browser:
```typescript
import { styles, logInfo } from '@abux/logger'

console.log(color, badge, bold, underline)

color('text', 'blue')
badge('text', 'red', 'white') // white text badge with red background

bold('bold-text')
logInfo(underline('underlined-text'))
```

For CLI:
```typescript
import { styles, logInfo } from '@abux/logger/cli'

console.log(color, badge, bold, underline)

color('text', 'blue')
badge('text', 'red', 'white') // white text badge with red background

bold('bold-text')
logInfo(underline('underlined-text'))
```

Changelog
-----
See [CHANGELOG.md][changelog]

-----
Cheers 🍻

[changelog]: https://github.com/abuxvn/source/blob/main/packages/logger/CHANGELOG.md
[badge-build]: https://github.com/abuxvn/source/actions/workflows/build.yaml/badge.svg
[npm-url]: https://www.npmjs.com/package/@abux/logger
[npm-downloads-badge]: https://img.shields.io/npm/dw/@abux/logger
[npm-version-badge]: https://img.shields.io/npm/v/@abux/logger
