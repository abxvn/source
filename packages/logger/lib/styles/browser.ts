import type { IModifierName, IFormatState, IStyledCssLog, IStyles, IFormatStateKey, IUnstyler, ILogStyler } from './interfaces'
import { Modifiers } from './interfaces'

const Colors = {
  black: '#000',
  bgBlack: '#222',
  gray: '#808', // 90
  bgGray: '#666',
  red: '#F00', // 31
  redBright: '#F55', // 91
  bgRed: '#A00', // 41
  bgRedBright: '#F50', // 101
  white: '#FDF', // 37
  whiteBright: '#FFF', // 97
  // text util colors
  green: '#0F0', // 32
  greenBright: '#0F6', // 92
  yellow: '#FF0', // 33
  yellowBright: '#FF7', // 93
  blue: '#00F', // 34
  blueBright: '#0FF', // 94
  cyan: '#0CE', // 36
  cyanBright: '#0FE', // 96
  magenta: '#F0F', // 35
  magentaBright: '#F5F', // 95
  // badge util bg colors
  bgGreen: '#070', // 42
  bgGreenBright: '#0D7', // 102
  bgYellow: '#AA0', // 43
  bgYellowBright: '#DD0', // 103
  bgBlue: '#00A', // 44
  bgBlueBright: '#05F', // 104
  bgCyan: '#0AA', // 46
  bgCyanBright: '#0DD', // 106
  bgMagenta: '#A0A', // 45
  bgMagentaBright: '#D0D', // 105
}

type IColorName = keyof typeof Colors

export const SPACE = '\u2009'
export const DIVIDER = `${SPACE}#${SPACE}`
// /\u2009#([^\u2009#]+)?#([^\u2009#]+)?#([^\u2009#]+)?\u2009/g
export const STYLE_REGEX_PATTERN = [
  SPACE,
  '([biu]+|)?',
  '([\\dA-F]{3}|)?',
  '([\\dA-F]{3}|)?',
].join('#') + SPACE
export const STYLE_DIVIDER_REGEX = new RegExp([STYLE_REGEX_PATTERN, DIVIDER].join('|'), 'g')

const modifierNames = Object.keys(Modifiers) as IModifierName[]
const colorNames = Object.keys(Colors) as IColorName[]
const defaultFormatState: IFormatState = {
  modified: false,
  bold: false,
  underline: false,
  italic: false,
  color: '',
  bgColor: '',
}

// example: bold to #b##
const convertStateToFormat = (state: IFormatState): string => {
  const modifierFormat = [
    state.bold && Modifiers.bold,
    state.italic && Modifiers.italic,
    state.underline && Modifiers.underline,
  ].filter(Boolean).join('')

  return `${SPACE}#${[modifierFormat, state.bgColor, state.color].join('#')}${SPACE}`
}

// example: bold italic to font-weight:bold;font-style:italic
const convertStateToCss = (state: IFormatState, baseState?: IFormatState): string => {
  const bgColor = state.bgColor || baseState?.bgColor || ''
  const color = state.color || baseState?.color || ''

  return [
    (state.bold || baseState?.bold) && 'font-weight:bold',
    (state.italic || baseState?.italic) && 'font-style:italic',
    (state.underline || baseState?.underline) && 'text-decoration:underline',
    bgColor && `background-color:#${bgColor}`,
    color && `color:#${color}`,
  ].filter(Boolean).join(';')
}

// example: bold italic to font-weight:inherit;font-style:inherit
const revertStateToCss = (state: IFormatState, baseState?: IFormatState): string => {
  return [
    baseState?.bold ? 'font-weight:bold' : (state.bold && 'font-weight:inherit'),
    baseState?.italic ? 'font-style:italic' : (state.italic && 'font-style:inherit'),
    baseState?.underline ? 'text-decoration:underline' : (state.underline && 'text-decoration:inherit'),
    baseState?.bgColor ? `background-color:#${baseState?.bgColor}` : (state.bgColor && 'background-color:inherit'),
    baseState?.color ? `color:#${baseState?.color}` : state.color && 'color:inherit',
  ].filter(Boolean).join(';')
}

// a function attached with chaining method to modify its state
const styler = (text: string, state?: IFormatState) => {
  if (!enabled || !state?.modified) {
    return text
  }

  const formatedText = `${convertStateToFormat(state)}${text}${DIVIDER}`

  return formatedText
}

// define state
Reflect.defineProperty(styler, 'state', {
  set (value: IFormatState) {
    this._state = value
  },
  get () {
    return this._state
  },
})

// define chained state editor
const defineStyleStateEditor = (
  name: string,
  stateKey: IFormatStateKey,
  stateValue: string | boolean
) => {
  Reflect.defineProperty(styler, name, {
    get () {
      const state = { ...(this._state || defaultFormatState) }
      const chainedStyle = (text: string) => styler(text, state)

      Reflect.setPrototypeOf(chainedStyle, styler) // clone functionality
      chainedStyle.state = state // replace cloned state
      state[stateKey] = stateValue
      state.modified = true

      return chainedStyle
    },
  })
}

modifierNames.forEach(name => {
  defineStyleStateEditor(name, name, true)
})

colorNames.forEach(name => {
  const stateKey = name.startsWith('bg') ? 'bgColor' : 'color'
  const colorCode: string = Colors[name].replace('#', '')

  defineStyleStateEditor(name, stateKey, colorCode)
})

export const enabled: boolean = typeof window !== 'undefined'

export const styles: IStyles = styler as IStyles

export const unstyle: IUnstyler = formatedText => formatedText.replace(STYLE_DIVIDER_REGEX, '')

interface ILogFormatState extends IFormatState {
  base?: IFormatState
}
export const styleLog: ILogStyler = formatedText => {
  const styledLog: IStyledCssLog = {
    text: '',
    css: [],
  }
  const logFormats: ILogFormatState[] = []

  styledLog.text = formatedText.replace(STYLE_DIVIDER_REGEX, (match, modifiers, bgColor, color) => {
    // divider
    if (match === DIVIDER) {
      const lastFormat = logFormats.pop()

      if (!lastFormat) {
        return ''
      } else {
        styledLog.css.push(revertStateToCss(lastFormat, lastFormat.base))

        return '%c'
      }
    }

    // formatter
    const baseFormat = logFormats[logFormats.length - 1]
    const format: ILogFormatState = {
      ...defaultFormatState,
      base: baseFormat ? { ...baseFormat, ...baseFormat.base } : undefined,
    }

    if (modifiers?.includes(Modifiers.bold)) {
      format.modified = true
      format.bold = true
    }

    if (modifiers?.includes(Modifiers.italic)) {
      format.modified = true
      format.italic = true
    }

    if (modifiers?.includes(Modifiers.underline)) {
      format.modified = true
      format.underline = true
    }

    if (bgColor) {
      format.modified = true
      format.bgColor = bgColor
    }

    if (color) {
      format.modified = true
      format.color = color
    }

    if (format.modified === true) {
      logFormats.push(format)
      styledLog.css.push(convertStateToCss(format, format.base))

      return '%c'
    } else {
      return ''
    }
  })

  return styledLog
}
