import type { Writable } from 'stream'

export type IWriteParams = [
  chunk: any,
  encoding: BufferEncoding,
  callback: (error?: Error | null) => void
]
export type IWrite = (
  chunk: any,
  encoding: BufferEncoding,
  callback: (error?: Error | null) => void
) => void

export interface IWritable {
  on: (...args: any[]) => void
  _write: IWrite
}

export type IWatchCallback = (data: Buffer) => void

export interface ICollapsible extends Writable {
  // write: (message: string) => void
  expand: () => void
  collapse: (clean?: boolean) => void
  isCollapsible: boolean
  width: number
  count: number
}
