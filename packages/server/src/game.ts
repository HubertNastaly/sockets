import { Bullet, Direction, GameConfig, Player, PlayerDirection, PlayerId, Vector } from "../../common/model"
import { Commander, Logger } from "./model"

enum GameState {
  Waiting,
  Started,
  Ended
}

const FRAME_INTERVAL = 50 //ms

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
      columns: 30,
      rows: 30,
      playersNumber: 2,
      initialLifePoints: 3
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
    this.commander.setOnFireCallback(this.fireBullet.bind(this))
    this.commander.setOnMoveCallback(this.movePlayer.bind(this))
  }

  private addPlayer(id: string, name: string) {
    if(this.playersMap[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }
    const player: Player = {
      id,
      name,
      position: this.randomizePlayerPosition(),
      direction: [0, 1],
      lifePoints: this.config.initialLifePoints
    }
    this.playersMap[id] = player
    this.players.push(player)
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    this.commander.sendPlayerJoined(this.playersMap[id], this.config)
    
    if(this.players.length === this.config.playersNumber) {
      this.start()
    }
  }

  private randomizePlayerPosition(): Vector {
    const unavailableColumns = this.players.map(({ position: [x] }) => x)
    const unavailableRows = this.players.map(({ position: [y] }) => y)

    const availableColumns = [...new Array(this.config.columns)]
      .map((_, index) => index)
      .filter(index => !unavailableColumns.includes(index))

    const availableRows = [...new Array(this.config.rows)]
      .map((_, index) => index)
      .filter(index => !unavailableRows.includes(index))

    const columnIndex = Math.round(Math.random() * availableColumns.length)
    const rowIndex = Math.round(Math.random() * availableRows.length)

    return [columnIndex, rowIndex]
  }

  private start() {
    this.gameState = GameState.Started
    this.logger.log('Game started')
    this.commander.start()

    this.gameLoop = setInterval(() => {
      this.updateBoard()
      this.sendUpdateBoard()
    }, FRAME_INTERVAL)
  }

  private updateBoard() {
    const updatedBullets = this.bullets
      .map((bullet) => {
        bullet.position[0] += bullet.direction[0]
        bullet.position[1] += bullet.direction[1]
        return bullet
      })
      .filter(({ position }) => this.isOnBoard(position))

    const remainingBullets = this.players.reduce((bullets, player) => {
      return this.applyBulletShoots(player, bullets)
    }, updatedBullets)

    this.bullets = remainingBullets
    this.sendUpdateBoard()
  }

  private movePlayer(playerId: PlayerId, playerDirection: PlayerDirection) {
    const direction = DIRECTIONS_MAP[playerDirection]
    const player = this.playersMap[playerId]
    player.direction = direction
    
    const [dirX, dirY] = direction
    const [px, py] = player.position
    const x = this.clampX(px + dirX)
    const y = this.clampY(py + dirY)

    const collidesWithAnotherPlayer =
      this.players.some(({ id, position: [_x, _y] }) => _x === x && _y === y && id !== playerId)

    const bulletSteppingOnFromBack = 
      this.bullets.find(bullet => this.isSteppingOnBulletFromBack(player, bullet, [x, y]))

    if(bulletSteppingOnFromBack) {
      const shootingBulletsCandidates = this.bullets.filter(bullet => bullet !== bulletSteppingOnFromBack)
      const remainingBullets = this.applyBulletShoots(player, shootingBulletsCandidates)
      this.bullets = [...remainingBullets, bulletSteppingOnFromBack]
    } else {
      this.bullets = this.applyBulletShoots(player, this.bullets)
    }

    const canMoveOnDesiredPosition = !collidesWithAnotherPlayer && !bulletSteppingOnFromBack

    if(canMoveOnDesiredPosition) {
      player.position = [x, y]
      this.sendUpdateBoard()
    }
  }

  private applyBulletShoots(player: Player, bullets: Bullet[]): Bullet[] {
    const { position: [px, py] } = player
    return bullets.filter(bullet => {
      const [bx, by] = bullet.position
      if (bx === px && by === py) {
        player.lifePoints = Math.max(0, player.lifePoints - 1)
        console.log({ player })
        return false
      }
      return true
    })
  }

  private isSteppingOnBulletFromBack(player: Player, bullet: Bullet, desiredPlayerPosition: Vector) {
    const [px, py] = player.position
    const [bx, by] = bullet.position
    const [x, y] = desiredPlayerPosition

    const [pDirX, pDirY] = player.direction
    const [bDirX, bDirY] = bullet.direction

    return (
      bx === x &&
      by === y &&
      bDirX === pDirX &&
      bDirY === pDirY && (
        (pDirX === 1 && px < bx) ||
        (pDirX === -1 && px > bx )||
        (pDirY === 1 && py < by) ||
        (pDirY === -1 && py > by)
      )
    )
  }

  private fireBullet(playerId: PlayerId) {
    const { position: [px, py], direction } = this.playersMap[playerId]
    const bullet: Bullet = {
      position: [px + direction[0], py + direction[1]],
      direction
    }
    this.bullets.push(bullet)
    this.sendUpdateBoard()
  }

  private sendUpdateBoard() {
    this.commander.sendUpdateBoard(this.players, this.bullets)
  }

  private end() {
    console.log('-- end game --')
    clearInterval(this.gameLoop!)
    this.gameState = GameState.Ended
  }

  private isOnBoard([x, y]: Vector) {
    return x >= 0 && x < this.config.columns && y >= 0 && y < this.config.rows
  }

  private clampX(x: number) {
    return Math.min(this.config.columns - 1, Math.max(0, x))
  }

  private clampY(y: number) {
    return Math.min(this.config.rows - 1, Math.max(0, y))
  }
}
