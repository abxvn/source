/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { IWatchCallback, IWritable, IWriteParams } from './interfaces'

class CollapserWatcher {
  private readonly streams: IWritable[] = []
  private readonly streamCallbacks: Record<number, IWatchCallback[]> = {}

  watch (stream: IWritable, callback: IWatchCallback) {
    let streamId = this.streams.findIndex(str => str === stream)

    if (streamId === -1) {
      streamId = this.streams.length
      this.streams.push(stream)
      this.streamCallbacks[streamId] = []
      this.installWatcher(stream)
    }

    if (!this.streamCallbacks[streamId].includes(callback)) {
      this.streamCallbacks[streamId].push(callback)
    }
  }

  private installWatcher (stream: IWritable) {
    const isStdout = stream === process.stdout
    const isStderr = stream === process.stderr

    if (isStdout) {
      const originalWrite = process.stdout._write
      const customWrite = (...args: IWriteParams) => {
        originalWrite.apply(process.stdout, args)
        this.onWatcherData(stream, args[0])
      }

      process.stdout._write = customWrite
    } else if (isStderr) {
      const originalWrite = process.stderr._write
      const customWrite = (...args: IWriteParams) => {
        originalWrite.apply(process.stderr, args)
        this.onWatcherData(stream, args[0])
      }

      process.stderr._write = customWrite
    } else {
      stream.on('data', (data: Buffer) => {
        this.onWatcherData(stream, data)
      })
    }
  }

  private onWatcherData (stream: IWritable, data: Buffer) {
    const streamId = this.streams.findIndex(str => str === stream)

    if (streamId === -1) {
      return
    }

    const callbacks = this.streamCallbacks[streamId]

    callbacks.forEach(callback => { callback(data) })
  }
}

const watcher = new CollapserWatcher()

export const watch = (stream: IWritable, callback: IWatchCallback) => {
  watcher.watch(stream, callback)
}
