import { createLoggers } from './loggers'
import * as browserLib from './browser'
import * as consoleLib from './console'
import type { IStyledCssLog } from './interfaces'

// @ts-expect-error temporarily enable for unit testing
browserLib.enabled = true // eslint-disable-line no-import-assign

describe('loggers#browser', () => {
  const mockLog = jest.fn()
  const { styles, unstyle, styleLog, SPACE } = browserLib
  const loggers = createLoggers<IStyledCssLog>(styles, unstyle, {
    log: mockLog,
    error: mockLog,
    info: mockLog
  }, styleLog)

  it('should support logging styled logs', () => {
    loggers.log(styles.blue('Hello'))
    expect(mockLog).toHaveBeenNthCalledWith(1, '%cHello%c', 'color:#00F', 'color:inherit')
  })

  it('should have text color utility', () => {
    expect(loggers.color('Test', 'black')).toBe(
      `${SPACE}###000${SPACE}Test${SPACE}#${SPACE}`
    )
  })

  it('should have badge utility', () => {
    expect(loggers.badge('Test', 'black', 'white')).toBe(
      `${SPACE}#b#222#FDF${SPACE} Test ${SPACE}#${SPACE}`
    )
  })
})

describe('loggers#console', () => {
  const mockLog = jest.fn()
  const { styles, unstyle } = consoleLib
  const loggers = createLoggers<string>(styles, unstyle, {
    log: mockLog,
    error: mockLog,
    info: mockLog
  })

  it('should support logging styled logs', () => {
    loggers.log(styles.blue('Hello'))
    expect(mockLog).toHaveBeenNthCalledWith(1, '\u001b[34mHello\u001b[39m')
  })

  it('should have text color utility', () => {
    expect(loggers.color('Test', 'black')).toBe(
      // black
      '\u001b[30mTest\u001b[39m'
    )
  })

  it('should have badge utility', () => {
    expect(loggers.badge('Test', 'black', 'white')).toBe(
      // bgBlack-white-bold
      '\u001b[40m\u001b[37m\u001b[1m Test \u001b[22m\u001b[39m\u001b[49m'
    )
  })
})
