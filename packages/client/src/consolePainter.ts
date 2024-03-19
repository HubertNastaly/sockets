import readline from 'readline'
import { Bullet } from "../../common/model";
import { Painter } from "./model";

export class ConsolePainter implements Painter {
  private boardWidth: number = 0
  private boardHeight: number = 0
  private drawAreaWidth: number = 0
  private drawAreaHeight: number = 0
  private horizontalEdge: string = ''
  private numbersRow: string = ''

  constructor() {}

  public initialize(boardWidth: number, boardHeight: number) {
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    this.drawAreaHeight = this.boardHeight + 3 // 2 horizontalEdges + numbers
    this.drawAreaWidth = boardWidth + 2 // left & right edge
    this.horizontalEdge = '_'.repeat(this.drawAreaWidth)
    this.numbersRow = this.constructNumbersRow()
  }

  private constructNumbersRow() {
    let numbersRow = ' '
    for(let i=0; i<this.boardWidth; i++) {
      numbersRow += (i + 1)
    }
    return numbersRow
  }

  private clearBoard() {
    readline.moveCursor(process.stdout, 0, -(this.drawAreaHeight))
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
    for(let rowIndex=0; rowIndex<this.boardHeight; rowIndex++) {
      let row = ''

      while(bulletIndex < bullets.length && bullets[bulletIndex].y === rowIndex) {
        row += ' '.repeat(bullets[bulletIndex].x - row.length)
        row += '*'
        bulletIndex++
      } 
      row += ' '.repeat(this.boardWidth - row.length)

      lines.push(`|${row}|`)
    }

    lines.push(this.horizontalEdge, this.numbersRow)

    console.log(lines.join('\n'))
  }
}
