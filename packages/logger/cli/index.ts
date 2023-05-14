import { Collapser } from '../lib/Collapser'
import type { ICollapsible } from '../lib/interfaces'

export type { ICollapsible } from '../lib/interfaces'

export const collapsible = (
  stream: NodeJS.WriteStream = process.stdout,
  collectFromStream = false
): ICollapsible => new Collapser(stream, collectFromStream)

export const collapse = collapsible()
