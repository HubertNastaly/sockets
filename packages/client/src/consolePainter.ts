import readline from 'readline'
import chalk, { Chalk } from 'chalk'
import { Bullet, Player, PlayerId, Vector } from "../../common/model";
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
  private readonly lifePointChar
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
    this.lifePointChar = '♥️'
    this.playerColors = [chalk.red, chalk.blue, chalk.green]
  }

  public initialize(boardWidth: number, boardHeight: number) {
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    this.drawAreaHeight = this.boardHeight + 2 // 2 horizontalEdges
    this.drawAreaWidth = boardWidth + 2 // left & right edge
    this.horizontalEdge = '_'.repeat(this.drawAreaWidth)
  }

  public prepareForNewPaint() {
    // clear life points white space before and new line after
    readline.moveCursor(process.stdout, 0, -3)
    readline.clearScreenDown(process.stdout)

    // does not need to clear the board as it has fixed size and will be repainted, just move cursor
    readline.moveCursor(process.stdout, 0, -this.drawAreaHeight)
  }

  public clearBoard() {
    const totalHeight = this.drawAreaHeight + 2
    readline.moveCursor(process.stdout, 0, -totalHeight)
    readline.clearScreenDown(process.stdout)
  }

  public drawGameEnded(winner?: Player) {
    this.printLine()
    this.printLine('* * * GAME ENDED * * *')
    this.printLine(winner ? `🏆 ${winner.name} is the winner` : `🤯 Nobody won`)
    this.printLine()
    this.printLine('Press P to play again or any other key to disconnect')
  }

  public drawBoard(players: Player[], bullets: Bullet[], focusedPlayerId: PlayerId) {
    const focusedPlayer = players.find(({ id }) => id === focusedPlayerId)

    const objects = [
      ...players.map(({ position }, index): DrawObject => ({ position, char: this.playerChar, color: this.playerColors[index] })),
      ...bullets.map(({ position }): DrawObject => ({ position, char: this.bulletChar }))
    ].sort(({ position: [ax, ay] }, { position: [bx, by]}) => ay === by ? ax - bx : ay - by)

    this.printLine()
    this.printLine(this.horizontalEdge)

    let objectIndex = 0
    for(let rowIndex=0; rowIndex<this.boardHeight; rowIndex++) {
      this.print(this.verticalEdgeChar)
      let printedChars = 0

      while(objectIndex < objects.length && objects[objectIndex].position[1] === rowIndex) {
        const { position, char, color } = objects[objectIndex]
        const emptyChars = position[0] - printedChars
        this.print(this.emptyFieldChar.repeat(emptyChars))
        this.print(color ? color(char) : char)
        printedChars += emptyChars + 1
        objectIndex++
      } 
      this.print(this.emptyFieldChar.repeat(this.boardWidth - printedChars))
      this.print('|\n')
    }

    this.printLine(this.horizontalEdge)
    this.printLine()
    this.printLine('Life: ' + (focusedPlayer ? `${this.lifePointChar} `.repeat(focusedPlayer.lifePoints).trim() : ''))
  }

  private printLine(line = '') {
    this.print(line + '\n')
  }

  private print(text: string) {
    process.stdout.write(text)
  }
}
