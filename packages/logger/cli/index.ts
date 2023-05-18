import { Collapser } from '../lib/Collapser'
import { styles as _styles, unstyle as _unstyle } from '../lib/styles/console'
import { createLoggers } from '../lib/styles/loggers'
import type { ICollapsible } from '../lib/interfaces'
import type { ILoggers, IStyles, IUnstyler } from '../lib/styles/interfaces'

export type { ICollapsible } from '../lib/interfaces'

export const collapsible = (
  stream: NodeJS.WriteStream = process.stdout,
  collectFromStream = false
): ICollapsible => new Collapser(stream, collectFromStream)

export const collapse = collapsible()

export const unstyle: IUnstyler = _unstyle
export const styles: IStyles = _styles
export const loggers: ILoggers = createLoggers(styles, unstyle, console)
