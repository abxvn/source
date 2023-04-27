import { resolve } from '@teku/resolve'

const main = async () => {
  console.log([
    await resolve('@teku/resolve')
  ])
}

main()
  .catch(err => {
    console.error(err)
  })
