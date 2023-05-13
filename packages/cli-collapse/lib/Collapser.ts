import readline from 'readline'
import type { ICollapser } from './interfaces'
import { Writable } from 'stream'

const EOL = '\n'

export class Collapser extends Writable implements ICollapser {
  private lines: string[] = []
  constructor (readonly stream: NodeJS.WriteStream = process.stdout) {
    super()
  }

  collapse (clean = false) {
    if (!this.isCollapsible) {
      return
    }

    const lineCount = this.lines.length
    const moveUp = lineCount

    readline.cursorTo(this.stream, 0) // cursor to line start
    readline.moveCursor(this.stream, 0, -moveUp) // move up some lines
    for (let x = 0; x < moveUp; x++) {
      readline.clearLine(this.stream, 0) // clear current line
      readline.moveCursor(this.stream, 0, 1) // move to next line
    }
    readline.moveCursor(this.stream, 0, -moveUp) // move back up some lines
    readline.cursorTo(this.stream, 0) // cursor to line start

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
    let lines: string[] = message.split(EOL).filter(Boolean)

    if (!lines.length) {
      return
    }

    if (this.isCollapsible) { // collapsible
      lines = lines.map(line => line.substring(0, this.width))
    }

    lines.forEach(line => this.lines.push(line))

    this.stream._write(Buffer.from(lines.join(EOL) + EOL, 'utf-8'), encoding, callback)
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
