import type { Compilation, Compiler } from 'webpack'
import { logInfo } from '../lib/logger'

type IEventName = keyof Compiler['hooks']
type IEvents = Partial<Record<IEventName, any>>

export default class ProgressReportPlugin {
  private readonly events: IEvents = {
    beforeRun (compiler: Compiler) {
      logInfo(`${compiler.name as string}: started building`)
    },
    compilation (compilation: Compilation) {
      logInfo(`${compilation.compiler.name as string}: compiling`)
    },
    afterCompile (compilation: Compilation) {
      logInfo(`${compilation.compiler.name as string}: compiled`)
    }
  }

  apply (compiler: Compiler) {
    (Object.keys(this.events) as Array<keyof IEvents>).forEach(eventName => {
      compiler.hooks[eventName].tap(
        `ProgressPlugin: ${eventName}`,
        this.events[eventName]
      )
    })
  }
}
