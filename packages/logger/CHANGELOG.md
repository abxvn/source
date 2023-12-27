# @abxvn/logger

## 1.0.3

### Patch Changes

- Update docs

## 1.0.2

### Patch Changes

- Fix types

## 1.0.1

### Patch Changes

- Update types

## 1.0.0

### Major Changes

- Update APIs to support color logging on browser
- Divide usages per environment:
  - `@abxvn/logger`: Browser logging, exports:
    - `styles`: styles of text for logging, color, background, bold...
    - `loggers`: loggers utilities like info, success, badge...
    - `unstyle`: revert a styled text
  - `@abxvn/logger/cli`: Console (CLI) logging, exports:
    - `collapsible`: Convert any writable stream to collapsible one
    - `collapse`: A collapsible stream bound to `process.stdout`
    - `styles`: styles of text for logging, color, background, bold...
    - `loggers`: loggers utilities like info, success, badge...
    - `unstyle`: revert a styled text

## 0.0.5

### Patch Changes

- replace logger utility

## 0.0.4

### Patch Changes

- Add d.ts file

## 0.0.3

### Patch Changes

- Add changelog

## 0.0.2

### Patch Changes

- 8706de6: Init logger
  - designed to work as a log stream
  - stream writer can be piped and collapsed (replace previous lines with new data)
  - add watcher to collapse other streams (supports process.stdout and process.stderr too)
