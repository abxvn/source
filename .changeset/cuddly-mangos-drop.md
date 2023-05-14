---
"@abux/logger": patch
---
- designed to work as a log stream
- stream writer can be piped and collapsed (replace previous lines with new data)
- add watcher to collapse other streams (supports process.stdout and process.stderr too)
