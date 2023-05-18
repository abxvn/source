import { styles, SPACE, DIVIDER, unstyle, styleLog } from './browser'
import * as browser from './browser'

// @ts-expect-error temporarily enable for unit testing
browser.enabled = true // eslint-disable-line no-import-assign

describe('styles#browser#style', () => {
  it('should add modifier to text', () => {
    expect(styles.bold('test')).toBe(`${SPACE}#b##${SPACE}test${DIVIDER}`)
    expect(styles.underline('test')).toBe(`${SPACE}#u##${SPACE}test${DIVIDER}`)
    // expect(styles.italic('test')).toBe(`${SPACE}#i##${SPACE}test${DIVIDER}`)
  })

  it('should add color to text', () => {
    expect(styles.red('test')).toBe(`${SPACE}###F00${SPACE}test${DIVIDER}`)
    expect(styles.greenBright('test')).toBe(`${SPACE}###0F6${SPACE}test${DIVIDER}`)
    expect(styles.gray('test')).toBe(`${SPACE}###808${SPACE}test${DIVIDER}`)
  })

  it('should add background color to text', () => {
    expect(styles.bgRed('test')).toBe(`${SPACE}##A00#${SPACE}test${DIVIDER}`)
    expect(styles.bgGreenBright('test')).toBe(`${SPACE}##0D7#${SPACE}test${DIVIDER}`)
  })

  it('should combine modifiers by chaining', () => {
    expect(styles.bold.underline.italic('test')).toBe(`${SPACE}#biu##${SPACE}test${DIVIDER}`)
  })

  it('should combine text color and background color by chaining', () => {
    expect(styles.blue.bgBlue('test')).toBe(`${SPACE}##00A#00F${SPACE}test${DIVIDER}`)
  })

  it('should combine modifiers with colors by chaining', () => {
    expect(styles.bold.bgBlue('test')).toBe(`${SPACE}#b#00A#${SPACE}test${DIVIDER}`)
    expect(styles.bold.blue('test')).toBe(`${SPACE}#b##00F${SPACE}test${DIVIDER}`)
    expect(styles.bold.blue.bgBlue('test')).toBe(`${SPACE}#b#00A#00F${SPACE}test${DIVIDER}`)
  })

  it('should allow nested styling of text', () => {
    const nestedLogMessage = styles.bold([
      `Hello ${styles.blue.bgBlue('World')}!`,
      `How are ${styles.underline('you')}?`
    ].join(' '))

    expect(nestedLogMessage).toBe([
      `${SPACE}#b##${SPACE}`,
      `Hello ${SPACE}##00A#00F${SPACE}World${DIVIDER}! `,
      `How are ${SPACE}#u##${SPACE}you${DIVIDER}?`,
      DIVIDER
    ].join(''))
  })
})

describe('styles#browser#unstyle', () => {
  it('should support unstyling formated text', () => {
    expect(
      unstyle(styles.blue.bgBlue('test'))
    ).toBe('test')
  })
})

describe('styles#browser#styleLog', () => {
  it('should support style log messages', () => {
    expect(styleLog(styles.blue.bgBlue('test'))).toEqual(expect.objectContaining({
      css: [
        'background-color:#00A;color:#00F',
        'background-color:inherit;color:inherit'
      ],
      text: '%ctest%c'
    }))

    expect(styleLog(styles.bold.blue.bgBlue('test'))).toEqual(expect.objectContaining({
      css: [
        'font-weight:bold;background-color:#00A;color:#00F',
        'font-weight:inherit;background-color:inherit;color:inherit'
      ],
      text: '%ctest%c'
    }))
  })

  it('should support nested style log messages', () => {
    const nestedLogMessage = styles.bold([
      `Hello ${styles.blue.bgBlue('World')}!`,
      `How are ${styles.underline('you')}?`
    ].join(' '))

    expect(styleLog(nestedLogMessage)).toEqual(expect.objectContaining({
      css: [
        'font-weight:bold',
        'font-weight:bold;background-color:#00A;color:#00F',
        'font-weight:bold;background-color:inherit;color:inherit',
        'font-weight:bold;text-decoration:underline',
        'font-weight:bold;text-decoration:inherit',
        'font-weight:inherit'
      ],
      text: '%cHello %cWorld%c! How are %cyou%c?%c'
    }))

    const nestedLogMessage2 = styles.underline(styles.bold([
      `Hello ${styles.blue.bgBlue('World')}!`,
      `How are ${styles.underline('you')}?`
    ].join(' ')))

    expect(styleLog(nestedLogMessage2)).toEqual(expect.objectContaining({
      css: [
        'text-decoration:underline',
        'font-weight:bold;text-decoration:underline',
        'text-decoration:underline;background-color:#00A;color:#00F',
        'text-decoration:underline;background-color:inherit;color:inherit',
        'text-decoration:underline',
        'text-decoration:underline',
        'font-weight:inherit;text-decoration:underline',
        'text-decoration:inherit'
      ],
      text: '%c%cHello %cWorld%c! How are %cyou%c?%c%c'
    }))
  })
})
