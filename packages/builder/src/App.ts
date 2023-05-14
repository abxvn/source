import { Command, type Option } from 'commander'
// import pkg from '../package.json'
import dev from './cmd/dev'
import init from './cmd/init'
import build from './cmd/build'
import { bold, logInfo } from '@abux/logger'
import { type IApp } from './interfaces'

interface ICommand {
  description: string
  action: (...argOptions: any[]) => Promise<void>
  options?: Option[]
}

export default class App extends Command implements IApp {
  private readonly _name: string = process.env.BUILDER_PACKAGE_NAME || ''
  private readonly _version: string = process.env.BUILDER_PACKAGE_VERSION || ''
  private readonly _description: string = process.env.BUILDER_PACKAGE_DESCRIPTION || ''

  get appName () {
    return this._name
  }

  get appVersion () {
    return this._version
  }

  constructor () {
    super()

    this.name(this._name)
      .version(this._version)
      .description(this._description)

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
        .action(async (...args: any[]) => {
          logInfo(`${bold(this._name)} v${this._version}`)
          await action.bind(this)(...args)
        })

      options.forEach(option => cmd.addOption(option))
    })
  }
}
