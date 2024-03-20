import readline from 'readline'
import { Bullet, Player, Vector } from "../../common/model";
import { Painter } from "./model";

type DrawObject = {
  position: Vector
  char: string
}

export class ConsolePainter implements Painter {
  private readonly bulletChar
  private readonly playerChar
  private readonly emptyFieldChar

  private boardWidth: number = 0
  private boardHeight: number = 0
  private drawAreaWidth: number = 0
  private drawAreaHeight: number = 0
  private horizontalEdge: string = ''

  constructor() {
    this.bulletChar = '*'
    this.playerChar = '$'
    this.emptyFieldChar = ' '
  }

  public initialize(boardWidth: number, boardHeight: number) {
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    this.drawAreaHeight = this.boardHeight + 2 // 2 horizontalEdges
    this.drawAreaWidth = boardWidth + 2 // left & right edge
    this.horizontalEdge = '_'.repeat(this.drawAreaWidth)
  }

  private clearBoard() {
    readline.moveCursor(process.stdout, 0, -(this.drawAreaHeight))
    readline.clearLine(process.stdout, 0)
  }

  public drawBoard(players: Player[], bullets: Bullet[], shouldClear = true) {
    if(shouldClear) {
      this.clearBoard()
    }

    const objects = [
      ...players.map(({ position }): DrawObject => ({ position, char: this.playerChar })),
      ...bullets.map(({ position }): DrawObject => ({ position, char: this.bulletChar }))
    ].sort(({ position: [ax, ay] }, { position: [bx, by]}) => ay === by ? ax - bx : ay - by)

    const lines: string[] = []
    lines.push(this.horizontalEdge)

    let objectIndex = 0
    for(let rowIndex=0; rowIndex<this.boardHeight; rowIndex++) {
      let row = ''

      while(objectIndex < objects.length && objects[objectIndex].position[1] === rowIndex) {
        row += this.emptyFieldChar.repeat(objects[objectIndex].position[0] - row.length)
        row += objects[objectIndex].char
        objectIndex++
      } 
      row += this.emptyFieldChar.repeat(this.boardWidth - row.length)

      lines.push(`|${row}|`)
    }

    lines.push(this.horizontalEdge)

    console.log(lines.join('\n'))
  }
}
