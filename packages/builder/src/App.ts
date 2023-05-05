import { Command, type Option } from 'commander'
// import pkg from '../package.json'
import dev from './cmd/dev'
import init from './cmd/init'
import build from './cmd/build'

interface ICommand {
  description: string
  action: (...argOptions: any[]) => Promise<void>
  options?: Option[]
}

export default class App extends Command {
  constructor () {
    super()

    // this.name(pkg.name)
    //   .version(pkg.version)
    //   .description(pkg.description)

    this.registerCommands({
      dev,
      build,
      init
    })
  }

  private registerCommands (commands: Record<string, ICommand>) {
    Object.keys(commands).forEach(commandName => {
      const { action, description, options = [] } = commands[commandName]

      const cmd = this.command(commandName)
        .description(description)
        .action(action)

      options.forEach(option => cmd.addOption(option))
    })
  }
}
