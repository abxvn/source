import type { Writable } from 'stream'

export interface ICollapser extends Writable {
  // write: (message: string) => void
  expand: () => void
  collapse: (clean?: boolean) => void
}
