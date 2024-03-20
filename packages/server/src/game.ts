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
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
    this.commander.setOnFireCallback(this.createBullet.bind(this))
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
    const updatedBullets = this.bullets
      .map((bullet) => {
        bullet.y += bullet.direction
        return bullet
      })
      .filter(({ y }) => y >= 0 || y < this.config.rows)

    const inversedBullets = updatedBullets.map(({ x, y, direction }): Bullet => ({
      x: this.config.columns - 1 - x,
      y: this.config.rows - 1 - y,
      direction: direction === 1 ? -1 : 1
    }))

    Object.values(this.players).forEach(({ id, isFirst }) => {
      this.commander.sendUpdateBoard(id, isFirst ? updatedBullets : inversedBullets)
    })
  }

  private createBullet(playerId: PlayerId, column: number) {
    const { isFirst } = this.players[playerId]
    const bullet: Bullet = {
      x: column,
      y: this.config.rows - 1,
      direction: -1
    }
    this.bullets.push(isFirst ? bullet : this.inverseBullet(bullet))
  }

  private end() {
    console.log('-- end game --')
    clearInterval(this.gameLoop!)
    this.gameState = GameState.Ended
  }

  private inverseBullet({ x, y, direction }: Bullet): Bullet {
    return {
      x: this.config.columns - 1 - x,
      y: this.config.rows - 1 - y,
      direction: direction === 1 ? -1 : 1
    }
  }
}
