import kindOf from 'kind-of'
import { minimatch } from 'minimatch'

export const map = async (iterable: any, transform: (item: any, key: number | string) => Promise<any>): Promise<any> => {
  switch (kindOf(iterable)) {
    case 'object':
      // eslint-disable-next-line no-case-declarations
      const newObject: any = {}

      await Promise.all(
        Object.keys(iterable).map(async key => {
          newObject[key] = await transform(iterable[key], key)
        })
      )

      return newObject
    case 'array':
      return await Promise.all(iterable.map(transform))
    default:
      throw Error('Please provide object or array input')
  }
}

export const filter = async (iterable: any, filter: (item: any, key: number | string) => Promise<boolean>): Promise<any> => {
  let result: any

  switch (kindOf(iterable)) {
    case 'object':
      result = {}
      await Promise.all(Object.keys(iterable).map(async key => {
        const value = iterable[key]

        if (await filter(value, key)) {
          result[key] = value
        }
      }))

      return result
    case 'array':
      result = []

      await Promise.all(iterable.map(async (value: any, idx: number) => {
        if (await filter(value, idx)) {
          result.push(value)
        }
      }))

      return result
    default:
      throw Error('Please provide object or array input')
  }
}

export const extractPattern = (regex: RegExp): string => regex.toString().replace(/^\/(.*)\/[a-z]*$/, '$1')

export const extractMatch = (str: string, regex: RegExp): string => {
  const match = str.match(regex)

  return match ? str.slice(0, (match.index ?? 0) + match[0].length) : ''
}

export const matchPattern = (str: string, pattern: RegExp | string | undefined) => {
  if (!pattern) {
    return true
  } else if (pattern instanceof RegExp) {
    return pattern.test(str)
  } else if (typeof pattern === 'string') {
    return minimatch(str, pattern)
  } else {
    return true
  }
}
