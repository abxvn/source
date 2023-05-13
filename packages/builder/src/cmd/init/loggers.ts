import {
  badge,
  logProgress as _logProgress,
  logSuccess as _logSuccess,
  logInfo
} from '../../lib/logger'

export const logStep = (...messages: string[]) => {
  logInfo(badge('init', 'blueBright', 'whiteBright'), ...messages)
}
export const logProgress = (...messages: string[]) => {
  _logProgress(badge('init', 'cyan'), ...messages)
}
export const logSuccess = (...messages: string[]) => {
  _logSuccess(badge('init', 'greenBright', 'whiteBright'), ...messages)
}
export const logWarn = (...messages: string[]) => {
  _logSuccess(badge('init', 'yellow'), ...messages)
}
