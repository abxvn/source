import { styles as _styles, unstyle as _unstyle, styleLog } from './lib/styles/browser'
import type { IStyles, IUnstyler, ILoggers } from './lib/styles/interfaces'
import { createLoggers } from './lib/styles/loggers'

export const unstyle: IUnstyler = _unstyle
export const styles: IStyles = _styles
export const logger: ILoggers = createLoggers(styles, unstyle, console, styleLog)
