import readline from 'readline'
import chalk, { Chalk } from 'chalk'
import { Bullet, Player, Vector } from "../../common/model";
import { Painter } from "./model";

type DrawObject = {
  position: Vector
  char: string
  color?: Chalk
}

export class ConsolePainter implements Painter {
  private readonly bulletChar
  private readonly playerChar
  private readonly emptyFieldChar
  private readonly verticalEdgeChar
  private readonly playerColors: Chalk[]

  private boardWidth: number = 0
  private boardHeight: number = 0
  private drawAreaWidth: number = 0
  private drawAreaHeight: number = 0
  private horizontalEdge: string = ''

  constructor() {
    this.bulletChar = '*'
    this.playerChar = '$'
    this.emptyFieldChar = ' '
    this.verticalEdgeChar = '|'
    this.playerColors = [chalk.red, chalk.blue, chalk.green]
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
      ...players.map(({ position }, index): DrawObject => ({ position, char: this.playerChar, color: this.playerColors[index] })),
      ...bullets.map(({ position }): DrawObject => ({ position, char: this.bulletChar }))
    ].sort(({ position: [ax, ay] }, { position: [bx, by]}) => ay === by ? ax - bx : ay - by)

    process.stdout.write(this.horizontalEdge + '\n')

    let objectIndex = 0
    for(let rowIndex=0; rowIndex<this.boardHeight; rowIndex++) {
      process.stdout.write(this.verticalEdgeChar)
      let printedChars = 0

      while(objectIndex < objects.length && objects[objectIndex].position[1] === rowIndex) {
        const { position, char, color } = objects[objectIndex]
        const emptyChars = position[0] - printedChars
        process.stdout.write(this.emptyFieldChar.repeat(emptyChars))
        process.stdout.write(color ? color(char) : char)
        printedChars += emptyChars + 1
        objectIndex++
      } 
      process.stdout.write(this.emptyFieldChar.repeat(this.boardWidth - printedChars))
      process.stdout.write('|\n')
    }

    process.stdout.write(this.horizontalEdge + '\n')
  }
}
