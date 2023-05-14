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

---
"@abux/logger": patch
---

- designed to work as a log stream
- stream writer can be piped and collapsed (replace previous lines with new data)
- add watcher to collapse other streams (supports process.stdout and process.stderr too)
