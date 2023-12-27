import { cursorTo, moveCursor, clearLine } from 'readline'
import type { ICollapsible, IWritable } from './interfaces'
import { Writable } from 'stream'
import { watch } from './CollapserWatcher'
import { unstyle } from 'ansi-colors'

const EOL = '\n'

export class Collapser extends Writable implements ICollapsible, IWritable {
  private lines: string[] = []
  private isWriting = false

  constructor (readonly stream: NodeJS.WriteStream = process.stdout, watchStream = false) {
    super()

    if (!this.stream) {
      throw Error('[collapser] please provide stream')
    }

    if (watchStream && this.isCollapsible) { // install watcher
      watch(stream, (data: Buffer) => { this.watchOnData(data) })
    }
  }

  collapse (clean = true) {
    if (!this.isCollapsible) {
      return
    }

    const lines = this.lines
    const moveUp = lines.length

    if (moveUp === 0) {
      return
    }

    this.isWriting = true
    cursorTo(this.stream, 0) // cursor to line start
    moveCursor(this.stream, 0, -moveUp) // move up some lines
    for (let x = 0; x < moveUp; x++) {
      clearLine(this.stream, 0) // clear current line
      moveCursor(this.stream, 0, 1) // move to next line
    }
    moveCursor(this.stream, 0, -moveUp) // move back up some lines
    cursorTo(this.stream, 0) // cursor to line start
    this.isWriting = false

    if (clean) {
      this.lines = []
    }
  }

  expand () {
    if (!this.lines.length) {
      return
    }

    this.isWriting = true
    this.stream.write(this.lines.join(EOL))
    this.isWriting = false
  }

  _write (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    const message = chunk?.toString() || ''
    const lines = message.split(EOL).filter(Boolean)

    if (!lines.length) {
      return
    }

    this.isWriting = true
    this.stream._write(
      Buffer.from(this.collectLines(lines).join(EOL) + EOL, 'utf-8'),
      encoding,
      (error) => {
        this.isWriting = false
        callback(error)
      }
    )
  }

  private watchOnData (data: Buffer) {
    if (this.isWriting) {
      return
    }

    const lines = data.toString().split(EOL)

    this.collectLines(lines)
  }

  get isCollapsible (): boolean {
    return this.stream.isTTY
  }

  // get terminal width
  get width (): number {
    // set max width to 80 in tty-mode and 200 in notty-mode
    return this.stream.columns || (this.stream.isTTY ? 80 : 200)
  }

  get count (): number {
    return this.lines.length
  }

  private collectLines (lines: string[]) {
    if (!lines.length) {
      return lines
    }

    if (this.isCollapsible) { // collapsible
      lines.forEach(line => {
        this.interactLineChunks(line, this.width).forEach(chunk => {
          this.lines.push(chunk)
        })
      })
    }

    return lines
  }

  private chunks (str: string, chunkSize: number): string[] {
    const chunks: string[] = []
    let start = 0
    let end = chunkSize

    while (start < str.length) {
      chunks.push(str.substring(start, end))
      start = end
      end += chunkSize
    }

    return chunks
  }

  private interactLineChunks (line: string, chunkSize: number): string[] {
    // \1xB is ANSI escape code, follow with these modifiers:
    // end with 'm' to modify colors and styles
    // cursor line A up, B down, E down start, F up start
    // cursor position C right, D left, G start
    // n;mH to exact position
    // J to clear screen
    // K to clear line
    // scroll S up T down
    // eslint-disable-next-line no-control-regex
    const ansiRegex = /\u001b(?:\[(\d+)([ABEF]))/g
    let match = ansiRegex.exec(line)

    while (match) {
      const count = +match[1]
      const mod = match[2]
      const isUp = mod === 'A' || mod === 'F'

      if (isUp) {
        console.log('Moved up', count)
        this.lines = this.lines.slice(0, -count)
      } else {
        console.log('Moved down', match[1], count)
        this.lines = this.lines.concat(Array(count).fill(''))
      }

      match = ansiRegex.exec(line)
    }

    return this.chunks(unstyle(line), chunkSize)
  }
}
