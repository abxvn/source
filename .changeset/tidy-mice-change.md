---
"@abux/builder": patch
---

Fix commands output:
+ `build`:
  - Allow alias flag for production build as `--production` (alias to `--node-env production`)
+ `dev`:
  - convert from minimal to normal webpack output
  - collapsible defailted output
+ `init`:
  - collapsible defailted output
+ move `logger` to new library
