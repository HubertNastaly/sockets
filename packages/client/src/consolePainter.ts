import readline from 'readline'
import { Bullet } from "../../common/model";
import { Painter } from "./model";

export class ConsolePainter implements Painter {
  private width: number = 0
  private height: number = 0
  private horizontalEdge: string = ''

  constructor() {}

  public initialize(width: number, height: number) {
    this.width = width
    this.height = height
    this.horizontalEdge = '_'.repeat(width + 2)
  }

  private clearBoard() {
    readline.moveCursor(process.stdout, 0, -(this.height + 2))
    readline.clearLine(process.stdout, 0)
  }

  public drawBoard(bullets: Bullet[], shouldClear = true) {
    if(shouldClear) {
      this.clearBoard()
    }

    bullets.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y)

    const lines: string[] = []
    lines.push(this.horizontalEdge)

    let bulletIndex = 0
    for(let rowIndex=0; rowIndex<this.height; rowIndex++) {
      let row = ''

      while(bulletIndex < bullets.length && bullets[bulletIndex].y === rowIndex) {
        row += ' '.repeat(bullets[bulletIndex].x - row.length)
        row += '*'
        bulletIndex++
      } 
      row += ' '.repeat(this.width - row.length)

      lines.push(`|${row}|`)
    }

    lines.push(this.horizontalEdge)

    console.log(lines.join('\n'))
  }
}
