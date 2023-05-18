import type {
  IStyles,
  ILoggers,
  ITextEffectColor,
  IBadgeEffectColor,
  IUnstyler,
  ILogStyler,
  ILogger,
  IStyledCssLog
} from './interfaces'

const customLog = (logFunction: ILogger, logStyler?: ILogStyler, ...items: any[]) => {
  let css: string[] = []

  logFunction(...items.map(item => {
    if (!logStyler) {
      return item
    }

    const styledLog = logStyler(item)

    css = css.concat(styledLog.css) // support css styled logs on browser

    return styledLog.text
  }), ...css)
}

export const createLoggers = <T extends string | IStyledCssLog>(
  styles: IStyles,
  unstyle: IUnstyler,
  logFunctions: any = console,
  styleLog?: ILogStyler
): ILoggers<T> => {
  const { bold, red, gray } = styles
  const textColorNames: ITextEffectColor[] = [
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright'
  ]

  const log = logFunctions.log.bind(console)
  const error = logFunctions.error.bind(console)
  const info = logFunctions.info.bind(console)

  return {
    log (...items) { customLog(log, styleLog, ...items) },
    info (...items) { customLog(info, styleLog, bold.blueBright('ℹ'), ...items) },
    progress (...items) { customLog(info, styleLog, gray('➤'), ...items) },
    warn (...items) { customLog(log, styleLog, red('△'), ...items) },
    success (...items) { customLog(info, styleLog, bold.greenBright('✔'), ...items) },
    error (...items) {
      items.forEach(item => {
        customLog(error, styleLog, bold.redBright('✘'), item)
      })
    },
    color (message, textColor = 'blue') {
      if (typeof textColor === 'number') {
        textColor = textColorNames[textColor % textColorNames.length]
      }

      return (textColor ? styles[textColor](message) : message) as T
    },
    badge (label, bgColor = 'blueBright', textColor?) {
      if (typeof bgColor === 'number') {
        bgColor = textColorNames[bgColor % textColorNames.length]
      }

      if (typeof textColor === 'number') {
        textColor = textColorNames[textColor % textColorNames.length]
      }

      if (!bgColor) {
        return label as T
      }

      const mappedBgColor = `bg${capitalize(bgColor)}` as IBadgeEffectColor

      let painter = styles[mappedBgColor]

      if (textColor) {
        painter = painter[textColor]
      }

      return painter.bold(` ${unstyle(label)} `) as T
    }
  }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
