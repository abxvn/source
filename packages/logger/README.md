@abux/logger
=====

![build][badge-build]

An utility logger for CLI and web, to be reused in our projects

**Table of contents**
+ [Features](#features)
+ [Example: collapsible console logs](#example-collapsible-console-logs)
+ [Example: collapsible streams](#example-collapsible-streams)
+ [Example: manipulate other streams](#example-manipulate-other-streams)
+ [Example: styled loggers](#example-styled-loggers)

### Features:

- Designed to work as a log stream
- Stream writer can be piped and collapsed (replace previous lines with new data)
- Add watcher to collapse other streams (supports process.stdout and process.stderr too)
- Handle ANSI escape codes
- Some helper method for styled loggers

### Example: collapsible console logs

```typescript
import { collapse } from '@abux/logger/cli'

// These 2 lines are writen into stdout
collapse.write(`A`)
collapse.write(`B`)

// Previous 2 lines will be removed
collapse.collapse()
```

### Example: collapsible streams

```typescript
import { collapsible } from '@abux/logger/cli'

collapsible(process.stdout)
collapsible(process.stderr)
collapsible(<anyWritableStream>)
```

### Example: manipulate other streams

```typescript
import { collapsible } from '@abux/logger/cli'

// All data writen into stdout will be collected
// And can be collapse / hidden later
const stream = collapsible(process.stdout, true)

stream.collapse()
```

### Example: styled loggers

```typescript
import { 
  color, badge, bold, underline 
} from '@abux/logger'

color('text', 'blue')
badge('text', 'red', 'white') // white text badge with red background

bold('bold-text')
underline('underlined-text')
```

[badge-build]: https://github.com/abuxvn/source/actions/workflows/build.yaml/badge.svg
