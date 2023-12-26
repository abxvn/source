/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import type { Compilation, Compiler } from 'webpack'
import { loggers } from '@abux/logger/cli'

const { progress } = loggers

type IEventName = keyof Compiler['hooks']
type IEvents = Partial<Record<IEventName, any>>

export default class ProgressReportPlugin {
  private readonly events: IEvents = {
    beforeRun (compiler: Compiler) {
      progress(`${compiler.name as string}: start building`)
    },
    compilation (compilation: Compilation) {
      progress(`${compilation.compiler.name as string}: compiling`)
    },
    afterCompile (compilation: Compilation) {
      progress(`${compilation.compiler.name as string}: compiled`)
    },
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
