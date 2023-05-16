import {
  bold,
  red,
  gray,
  // text util colors
  green, yellow, blue, magenta, cyan, greenBright, yellowBright, blueBright, magentaBright, cyanBright,
  // badge util bg colors
  bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgGreenBright, bgYellowBright, bgBlueBright, bgMagentaBright, bgCyanBright,
  bgRed, bgRedBright, unstyle
} from 'ansi-colors'

export { bold, italic, underline, unstyle } from 'ansi-colors'

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
const badgeColorNames = Object.keys(TextColors)

type ITextColorName = keyof typeof TextColors
export const color = (
  message: string,
  textColor: ITextColorName | number = 'blue'
): string => {
  if (typeof textColor === 'number') {
    textColor = textColorNames[textColor % textColorNames.length] as ITextColorName
  }

  return textColor ? TextColors[textColor](message) : message
}

type IBadgeColorName = keyof typeof BadgeColors
export const badge = (
  label: string,
  bgColor: IBadgeColorName | number = 'blueBright',
  textColor?: ITextColorName | 'white' | 'whiteBright' | 'black' | number
): string => {
  if (typeof bgColor === 'number') {
    bgColor = badgeColorNames[bgColor % badgeColorNames.length] as IBadgeColorName
  }

  if (typeof textColor === 'number') {
    textColor = textColorNames[textColor % textColorNames.length] as ITextColorName
  }

  if (!bgColor) {
    return label
  }

  let painter = BadgeColors[bgColor]

  if (textColor) {
    painter = painter[textColor]
  }

  return painter(` ${bold(unstyle(label))} `)
}
