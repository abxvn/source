# @abxvn/builder

## 1.1.0

### Minor Changes

- Add package manager optional option to init command (npm, pnpm, yarn)

## 1.0.1

### Patch Changes

- Update docs
- Updated dependencies
  - @abxvn/webpack-dts@1.0.1
  - @abxvn/resolve@2.0.1
  - @abxvn/logger@2.0.1

## 1.0.0

### Major Changes

- Migrate scope, supports pnpm by default, rebuild

### Patch Changes

- Updated dependencies
  - @abxvn/webpack-dts@1.0.0
  - @abxvn/resolve@2.0.0
  - @abxvn/logger@2.0.0

## 0.3.4

### Patch Changes

- Move dts plugins into packages
- Updated dependencies
  - @abxvn/webpack-dts@0.0.1

## 0.3.3

### Patch Changes

- fix module dir listing
- Updated dependencies
  - @abxvn/resolve@1.1.2

## 0.3.2

### Patch Changes

- Updated dependencies
  - @abxvn/resolve@1.1.1

## 0.3.1

### Patch Changes

- Fix resolving loaders
- Updated dependencies
  - @abxvn/resolve@1.1.0

## 0.3.0

### Minor Changes

- introduce `ignores` option

## 0.2.5

### Patch Changes

- Fix empty dev server for windows

## 0.2.4

### Patch Changes

- Fix dev server static path for windows

## 0.2.3

### Patch Changes

- Update docs
- Updated dependencies
  - @abxvn/resolve@1.0.6
  - @abxvn/logger@1.0.3

## 0.2.2

### Patch Changes

- Updated dependencies
  - @abxvn/logger@1.0.2

## 0.2.1

### Patch Changes

- Updated dependencies
  - @abxvn/logger@1.0.1

## 0.2.0

### Patch Changes

- Update usage of `@abxvn/logger`
- Updated dependencies
  - @abxvn/logger@1.0.0

## 0.1.5

### Patch Changes

- replace logger utility
- Updated dependencies
  - @abxvn/logger@0.0.5

## 0.1.4

### Patch Changes

- Updated dependencies
  - @abxvn/logger@0.0.4

## 0.1.3

### Patch Changes

- Add changelog
- Updated dependencies
  - @abxvn/resolve@1.0.5
  - @abxvn/logger@0.0.3

## 0.1.2

### Patch Changes

- 58b2cdf: Fix commands output:
  - `build`: Allow alias flag for production build as `--production` (alias to `--node-env production`)
  - `dev`: convert from minimal to normal webpack output and collapsible defailted output
  - `init`: collapsible defailted output
  - move `logger` to new library
- 8706de6: Updated dependencies
  - @abxvn/logger@0.0.2
