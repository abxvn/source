import { resolve, resolveModule } from '@teku/resolve'

const main = async () => {
  console.log([
    await resolve('@teku/resolve'),
    await resolveModule('@teku/resolve')
  ])
}

main()
  .catch(err => {
    console.error(err)
  })
