import { Collapser } from '../lib/Collapser'
import type { ICollapsible } from '../lib/interfaces'
import { styles as _styles, unstyle as _unstyle } from '../lib/styles/console'
import { createLoggers } from '../lib/styles/loggers'

export type { ICollapsible } from '../lib/interfaces'

export const collapsible = (
  stream: NodeJS.WriteStream = process.stdout,
  collectFromStream = false
): ICollapsible => new Collapser(stream, collectFromStream)

export const collapse = collapsible()

export const unstyle = _unstyle
export const styles = _styles
export const loggers = createLoggers(styles, unstyle, console)
