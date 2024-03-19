import { Bullet, GameConfig, Player, PlayerId } from "../../common/model"
import { Commander, Logger } from "./model"

enum GameState {
  Waiting,
  Started,
  Ended
}

const TARGET_PLAYERS_NUMBER = 2
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
      columns: 7,
      rows: 10
    }
    this.players = {}
    this.bullets = []
    this.logger = logger
    this.commander = commander
    this.gameLoop = null
  }

  public initialize() {
    // hardcode bullet
    this.bullets.push({ x: 2, y: 0, direction: 1 })
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
  }

  private addPlayer(id: string, name: string) {
    if(this.players[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }
    const playerCount = Object.keys(this.players).length
    this.players[id] = { id, name, isFirst: playerCount === 0 }
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    this.commander.sendPlayerJoined(this.players[id], this.config)
    
    if(playerCount + 1 === TARGET_PLAYERS_NUMBER) {
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
    for(const bullet of this.bullets) {
      bullet.y += bullet.direction
      if(bullet.y < 0 || bullet.y >= this.config.rows) {
        this.end()
      }
    }

    const inversedBullets = this.bullets.map(({ x, y, direction }): Bullet => ({
      x: this.config.columns - x,
      y: this.config.rows - y,
      direction: direction === 1 ? -1 : 1
    }))

    Object.values(this.players).forEach(({ id, isFirst }) => {
      this.commander.sendUpdateBoard(id, isFirst ? this.bullets : inversedBullets)
    })
  }

  private end() {
    clearInterval(this.gameLoop!)
    this.gameState = GameState.Ended
  }
}