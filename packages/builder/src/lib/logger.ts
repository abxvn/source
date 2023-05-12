import {
  bold,
  italic,
  red,
  gray,
  // text util colors
  green, yellow, blue, magenta, cyan, greenBright, yellowBright, blueBright, magentaBright, cyanBright,
  // badge util bg colors
  bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgGreenBright, bgYellowBright, bgBlueBright, bgMagentaBright, bgCyanBright,
  bgRed, bgRedBright
} from 'chalk'
import type { IWebpackConfig } from '../interfaces'

export { bold } from 'chalk'

export const log = console.log.bind(console)
export const logInfo = (...items: any[]) => {
  console.info(bold.blueBright('ℹ'), ...items)
}
export const logProgress = (...items: any[]) => {
  console.info(gray('➤'), ...items)
}
export const logWarn = (...items: any[]) => {
  console.info(red('△'), ...items)
}
export const logError = (...items: any[]) => {
  items.forEach(item => {
    console.error(bold.underline.redBright('✘'), item)
  })
}
export const logSuccess = (...items: any[]) => {
  console.info(bold.greenBright('✔'), ...items)
}

export const logEntries = (configs: IWebpackConfig[]) => {
  logInfo(bold.cyanBright('Building entries:'))

  configs.forEach(({ name, target, entry }) => {
    log(`   ${name} (${italic(target)}):`)
    Object.keys(entry).forEach(entryName => { log(`     ${entryName}`) })
  })
}

const TextColors = {
  green,
  yellow,
  blue,
  magenta,
  cyan,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright
}
const textColorNames = Object.keys(TextColors)
const BadgeColors = {
  green: bgGreen,
  yellow: bgYellow,
  blue: bgBlue,
  magenta: bgMagenta,
  cyan: bgCyan,
  greenBright: bgGreenBright,
  yellowBright: bgYellowBright,
  blueBright: bgBlueBright,
  magentaBright: bgMagentaBright,
  cyanBright: bgCyanBright,
  red: bgRed,
  redBright: bgRedBright
}

type ITextColorName = keyof typeof TextColors
export const color = (message: string, color: ITextColorName = 'blue') => {
  return color ? TextColors[color](message) : message
}

export const colorIndex = (message: string, colorIndex = 0) => {
  const colorName = textColorNames[colorIndex % textColorNames.length] as ITextColorName

  return color(message, colorName)
}

type IBadgeColorName = keyof typeof BadgeColors
export const badge = (message: string, color: IBadgeColorName = 'blueBright') => {
  // eslint-disable-next-line no-irregular-whitespace
  return color ? BadgeColors[color](` ${bold(message)} `) : message
}
