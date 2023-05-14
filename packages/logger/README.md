@abux/logger
=====

![build][badge-build]

An utility logger for CLI and web, to be reused in our projects

### Features:

- Designed to work as a log stream
- Stream writer can be piped and collapsed (replace previous lines with new data)
- Add watcher to collapse other streams (supports process.stdout and process.stderr too)
- Handle ANSI escape codes

### Examples: collapsible console logs

```typescript
import { collapse } from '@abux/logger'

// These 2 lines are writen into stdout
collapse.write(`A`)
collapse.write(`B`)

// Previous 2 lines will be removed
collapse.collapse()
```

### Examples: collapsible streams

```typescript
import { collapsible } from '@abux/logger'

collapsible(process.stdout)
collapsible(process.stderr)
collapsible(<anyWritableStream>)
```

### Examples: manipulate other streams

```typescript
import { collapsible } from '@abux/logger'

// All data writen into stdout will be collected
// And can be collapse / hidden later
const stream = collapsible(process.stdout, true)

stream.collapse()
```

[badge-build]: https://github.com/abuxvn/source/actions/workflows/build.yaml/badge.svg
