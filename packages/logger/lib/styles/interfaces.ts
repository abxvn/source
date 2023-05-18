export const Modifiers = {
  bold: 'b',
  underline: 'u',
  italic: 'i'
}
export type IModifierName = keyof typeof Modifiers
export type IModifier = typeof Modifiers[IModifierName]

export interface IFormatState {
  modified?: boolean
  bold: boolean
  italic: boolean
  underline: boolean
  bgColor: string
  color: string
}

export type IFormatStateKey = keyof IFormatState

export interface IStyledCssLog {
  text: string
  css: string[]
}

export interface IStyles {
  (text: string): string
  bold: IStyles
  italic: IStyles
  underline: IStyles
  // colors
  black: IStyles
  bgBlack: IStyles
  gray: IStyles
  bgGray: IStyles
  red: IStyles
  redBright: IStyles
  bgRed: IStyles
  bgRedBright: IStyles
  white: IStyles
  whiteBright: IStyles
  // text util colors
  green: IStyles
  greenBright: IStyles
  yellow: IStyles
  yellowBright: IStyles
  blue: IStyles
  blueBright: IStyles
  cyan: IStyles
  cyanBright: IStyles
  magenta: IStyles
  magentaBright: IStyles
  // badge util bg colors
  bgGreen: IStyles
  bgGreenBright: IStyles
  bgYellow: IStyles
  bgYellowBright: IStyles
  bgBlue: IStyles
  bgBlueBright: IStyles
  bgCyan: IStyles
  bgCyanBright: IStyles
  bgMagenta: IStyles
  bgMagentaBright: IStyles
}

export type ILogger = (...items: any[]) => void
export type IUnstyler = (formattedText: string) => string
export type ILogStyler = (formattedText: string) => IStyledCssLog

export type ITextEffectColor = 'green' | 'greenBright' | 'yellow' | 'yellowBright' | 'blue' | 'blueBright' |
'cyan' | 'cyanBright' | 'magenta' | 'magentaBright'
// 'red' | 'redBright' | 'gray' | 'black' | 'white' | 'whiteBright'

export type IBadgeEffectColor = 'bgGreen' | 'bgGreenBright' | 'bgYellow' | 'bgYellowBright' | 'bgBlue' | 'bgBlueBright' |
'bgCyan' | 'bgCyanBright' | 'bgMagenta' | 'bgMagentaBright'
// | 'bgRed' | 'bgRedBright' | 'bgBlack' | 'bgGray'

export interface ILoggers {
  log: ILogger
  info: ILogger
  warn: ILogger
  progress: ILogger
  success: ILogger
  error: ILogger
  color: (
    message: string,
    textColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black' | 'white' | 'whiteBright'
  ) => string | IStyledCssLog
  badge: (
    label: string,
    bgColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black',
    textColor?: ITextEffectColor | number | 'red' | 'redBright' | 'gray' | 'black' | 'white' | 'whiteBright'
  ) => string | IStyledCssLog
}
