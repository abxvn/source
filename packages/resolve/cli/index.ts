import { Command } from 'commander'
import { resolve, resolveModule } from '@abxvn/resolve'

const main = async (args: any) => {
  const app = new Command('@abxvn/resolve')

  app.argument('<paths...>', 'modules or paths to resolve from current working dir')
  app.description('Resolving files, module entry paths or metadata')
  app.option('-m, --module', 'Resolve module metadata', false)

  const options = app.parse(args).opts()
  const resolveOptions = {
    callerPath: process.cwd(),
  }

  let messages = []

  if (!options.module) {
    messages = await Promise.all(app.args.map(async path => {
      try {
        return await resolve(path, resolveOptions)
      } catch (err: any) {
        return err.message.replace(/[\r\n\s]+(.[\n\r]?)+$/, '')
      }
    }))
  } else {
    messages = await Promise.all(app.args.map(async path => {
      const module = await resolveModule(path, resolveOptions)

      return {
        ...module,
        error: module.error?.message?.replace(/[\r\n\s]+(.[\n\r]?)+$/, ''),
      }
    }))
  }

  messages.forEach(message => { console.log(message) })
}

main(process.argv)
  .catch(err => { console.error(err) })
