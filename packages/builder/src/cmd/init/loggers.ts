import {
  loggers,
} from '@abux/logger/cli'

const {
  badge,
  progress,
  success,
  info,
} = loggers

export const logStep = (...messages: string[]) => {
  info(badge('init', 'blueBright', 'whiteBright'), ...messages)
}
export const logProgress = (...messages: string[]) => {
  progress(badge('init', 'cyan'), ...messages)
}
export const logSuccess = (...messages: string[]) => {
  success(badge('init', 'greenBright', 'whiteBright'), ...messages)
}
export const logWarn = (...messages: string[]) => {
  success(badge('init', 'yellow'), ...messages)
}
