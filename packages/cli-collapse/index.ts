import { Collapser } from './lib/Collapser'
import type { ICollapser } from './lib/interfaces'

export const collapser = (stream: NodeJS.WriteStream = process.stdout): ICollapser =>
  new Collapser(stream)
export const collapse = collapser()
