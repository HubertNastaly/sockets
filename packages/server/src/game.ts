import { Bullet, Direction, GameConfig, Player, PlayerDirection, PlayerId, Vector } from "../../common/model"
import { Commander, Logger } from "./model"

enum GameState {
  Waiting,
  Started,
  Ended
}

const FRAME_INTERVAL = 100 //ms

const DIRECTIONS_MAP: Record<PlayerDirection, Direction> = {
  'down': [0, 1],
  'left': [-1, 0],
  'right': [1, 0],
  'up': [0, -1]
}

export class Game {
  private readonly config: GameConfig
  private readonly commander: Commander
  private readonly logger: Logger

  private gameState: GameState = GameState.Waiting
  private playersMap: Record<PlayerId, Player>
  private players: Player[]
  private bullets: Bullet[]

  private gameLoop: NodeJS.Timeout | null

  constructor(logger: Logger, commander: Commander) {
    this.config = {
      columns: 10,
      rows: 10,
      playersNumber: 2
    }
    this.playersMap = {}
    this.players = []
    this.bullets = []
    this.logger = logger
    this.commander = commander
    this.gameLoop = null
  }

  public initialize() {
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
    this.commander.setOnFireCallback(this.createBullet.bind(this))
    this.commander.setOnMoveCallback(this.movePlayer.bind(this))
  }

  private addPlayer(id: string, name: string) {
    if(this.playersMap[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }
    const player: Player = { id, name, position: [0, this.players.length], direction: [0, 1] }
    this.playersMap[id] = player
    this.players.push(player)
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    this.commander.sendPlayerJoined(this.playersMap[id], this.config)
    
    if(this.players.length === this.config.playersNumber) {
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
    this.commander.sendUpdateBoard(this.players, updatedBullets)
  }

  private movePlayer(playerId: PlayerId, playerDirection: PlayerDirection) {
    const [dx, dy] = DIRECTIONS_MAP[playerDirection]
    const player = this.playersMap[playerId]
    const [px, py] = player.position
    const x = this.clampX(px + dx)
    const y = this.clampY(py + dy)

    const collidesWithAnotherPlayer =
      this.players.some(({ id, position: [_x, _y] }) => _x === x && _y === y && id !== playerId)
    if(!collidesWithAnotherPlayer) {
      player.position = [x, y]
    }
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

  private clampX(x: number) {
    return Math.min(this.config.columns - 1, Math.max(0, x))
  }

  private clampY(y: number) {
    return Math.min(this.config.rows - 1, Math.max(0, y))
  }
}
