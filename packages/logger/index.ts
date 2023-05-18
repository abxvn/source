import { styles as _styles, unstyle as _unstyle, styleLog } from './lib/styles/browser'
import type { IBrowserLoggers, IStyles, IUnstyler } from './lib/styles/interfaces'
import { createLoggers } from './lib/styles/loggers'

export const unstyle: IUnstyler = _unstyle
export const styles: IStyles = _styles
export const loggers: IBrowserLoggers = createLoggers(styles, unstyle, console, styleLog)
