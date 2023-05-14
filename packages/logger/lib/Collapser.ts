import { cursorTo, moveCursor, clearLine } from 'readline'
import type { ICollapsible, IWritable } from './interfaces'
import { Writable } from 'stream'
import { watch } from './CollapserWatcher'

const EOL = '\n'

export class Collapser extends Writable implements ICollapsible, IWritable {
  private lines: string[] = []
  private isWriting = false
  constructor (readonly stream: NodeJS.WriteStream = process.stdout, watchStream = false) {
    super()

    if (!this.stream) {
      throw Error('[collapser] please provide stream')
    }

    if (watchStream) { // install watcher
      watch(stream, (data: Buffer) => { this.watchOnData(data) })
    }
  }

  collapse (clean = true) {
    if (!this.isCollapsible) {
      return
    }

    const lineCount = this.lines.length
    const moveUp = lineCount

    cursorTo(this.stream, 0) // cursor to line start
    moveCursor(this.stream, 0, -moveUp) // move up some lines
    for (let x = 0; x < moveUp; x++) {
      clearLine(this.stream, 0) // clear current line
      moveCursor(this.stream, 0, 1) // move to next line
    }
    moveCursor(this.stream, 0, -moveUp) // move back up some lines
    cursorTo(this.stream, 0) // cursor to line start

    if (clean) {
      this.lines = []
    }
  }

  expand () {
    if (!this.lines.length) {
      return
    }

    this.stream.write(this.lines.join(EOL))
  }

  _write (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    const message = chunk?.toString() || ''

    this.isWriting = true
    this.stream._write(
      Buffer.from(this.getLines(message).join(EOL) + EOL, 'utf-8'),
      encoding,
      callback
    )
    this.isWriting = false
  }

  private getLines (message: string) {
    let lines: string[] = message.split(EOL).filter(Boolean)

    if (!lines.length) {
      return lines
    }

    if (this.isCollapsible) { // collapsible
      lines = lines.map(line => line.substring(0, this.width))
    }

    lines.forEach(line => this.lines.push(line))

    return lines
  }

  private watchOnData (data: Buffer) {
    if (this.isWriting) {
      return
    }

    this.getLines(data.toString()).forEach(line => this.lines.push(line))
  }

  get isCollapsible (): boolean {
    return this.stream.isTTY
  }

  // get terminal width
  get width (): number {
    // set max width to 80 in tty-mode and 200 in notty-mode
    return this.stream.columns || (this.stream.isTTY ? 80 : 200)
  }
}
