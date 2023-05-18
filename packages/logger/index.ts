import { styles as _styles, unstyle as _unstyle, styleLog } from './lib/styles/browser'
import { createLoggers } from './lib/styles/loggers'

export const unstyle = _unstyle
export const styles = _styles
export const loggers = createLoggers(styles, unstyle, console, styleLog)
