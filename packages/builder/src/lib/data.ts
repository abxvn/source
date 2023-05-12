import kindOf from 'kind-of'

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

export const filter = (iterable: any, filter: (item: any, key: number | string) => boolean): any => {
  switch (kindOf(iterable)) {
    case 'object':
      return Object.keys(iterable).reduce((newObj: any, key) => {
        if (filter(iterable[key], key)) {
          newObj[key] = iterable[key]
        }

        return newObj
      }, {})
    case 'array':
      return iterable.filter(filter)
    default:
      throw Error('Please provide object or array input')
  }
}

export const extractPattern = (regex: RegExp): string => regex.toString().replace(/^\/(.*)\/[a-z]*$/, '$1')

export const extractMatch = (str: string, regex: RegExp): string => {
  const match = str.match(regex)

  return match ? str.slice(0, (match.index ?? 0) + match[0].length) : ''
}
