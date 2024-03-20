import { Bullet, GameConfig, Player, PlayerId } from "../../common/model"
import { Commander, Logger } from "./model"

enum GameState {
  Waiting,
  Started,
  Ended
}

const FRAME_INTERVAL = 100 //ms

export class Game {
  private readonly config: GameConfig
  private readonly commander: Commander
  private readonly logger: Logger

  private gameState: GameState = GameState.Waiting
  private players: Record<PlayerId, Player>
  private bullets: Bullet[]

  private gameLoop: NodeJS.Timeout | null

  constructor(logger: Logger, commander: Commander) {
    this.config = {
      columns: 10,
      rows: 10,
      playersNumber: 2
    }
    this.players = {}
    this.bullets = []
    this.logger = logger
    this.commander = commander
    this.gameLoop = null
  }

  public initialize() {
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
    this.commander.setOnFireCallback(this.createBullet.bind(this))
  }

  private addPlayer(id: string, name: string) {
    if(this.players[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }
    this.players[id] = { id, name, position: [0, Object.values(this.players).length], direction: [0, 1] }
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    this.commander.sendPlayerJoined(this.players[id], this.config)
    
    if(Object.keys(this.players).length === this.config.playersNumber) {
      this.start()
    }
  }

  private start() {
    this.gameState = GameState.Started
    this.logger.log('Game started')
    this.commander.start()

    this.gameLoop = setInterval(this.updateBoard.bind(this), FRAME_INTERVAL)
  }

  private updateBoard() {
    const updatedBullets = this.bullets
      .map((bullet) => {
        bullet.position[1] += bullet.direction
        return bullet
      })
      .filter(({ position: [_, y] }) => y >= 0 || y < this.config.rows)

    this.bullets = updatedBullets
    this.commander.sendUpdateBoard(Object.values(this.players), updatedBullets)
  }

  private createBullet(playerId: PlayerId, column: number) {
    // const { isFirst } = this.players[playerId]
    // const bullet: Bullet = {
    //   x: column,
    //   y: this.config.rows - 1,
    //   direction: -1
    // }
    // this.bullets.push(isFirst ? bullet : this.inverseBullet(bullet))
  }

  private end() {
    console.log('-- end game --')
    clearInterval(this.gameLoop!)
    this.gameState = GameState.Ended
  }
}
