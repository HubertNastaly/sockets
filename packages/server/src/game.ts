import { Bullet, Direction, GameConfig, Logger, Player, PlayerDirection, PlayerId, Vector } from "../../common/model"
import { Commander } from "./model"

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

  private gameState: GameState
  private playersMap: Record<PlayerId, Player>
  private livePlayers: Player[]
  private bullets: Bullet[]

  private gameLoop: NodeJS.Timeout | null
  private onGameEnd: () => void

  constructor(logger: Logger, commander: Commander) {
    this.config = {
      columns: 30,
      rows: 30,
      playersNumber: 2,
      initialLifePoints: 3
    }
    this.playersMap = {}
    this.livePlayers = []
    this.bullets = []
    this.logger = logger
    this.commander = commander

    this.gameState = GameState.Waiting
    this.gameLoop = null
    this.onGameEnd = () => null
  }

  public initialize(onGameEnd: () => void) {
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
    this.commander.setOnFireCallback(this.fireBullet.bind(this))
    this.commander.setOnMoveCallback(this.movePlayer.bind(this))
    this.onGameEnd = onGameEnd
  }

  private addPlayer(id: string, name: string) {
    if(this.playersMap[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }

    if(this.gameState !== GameState.Waiting) {
      // TODO: send reject response
      return
    }

    const player: Player = {
      id,
      name,
      position: this.randomizePlayerPosition(),
      direction: [0, 1],
      lifePoints: this.config.initialLifePoints
    }
    this.playersMap[id] = player
    this.livePlayers.push(player)
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    this.commander.sendPlayerJoined(this.playersMap[id], this.config)
    
    if(this.livePlayers.length === this.config.playersNumber) {
      this.start()
    }
  }

  private randomizePlayerPosition(): Vector {
    const unavailableColumns = this.livePlayers.map(({ position: [x] }) => x)
    const unavailableRows = this.livePlayers.map(({ position: [y] }) => y)

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
    this.commander.sendGameStarted()

    this.gameLoop = setInterval(() => {
      this.updateBoard()
      this.sendUpdateBoard('loop')
    }, FRAME_INTERVAL)
  }

  private updateBoard() {
    const updatedBullets = this.moveBullets()
    const remainingBullets = this.livePlayers.reduce((bullets, player) => {
      return this.applyBulletShoots(player, bullets)
    }, updatedBullets)

    this.bullets = remainingBullets
  }

  private moveBullets() {
    return this.bullets
      .map((bullet) => {
        bullet.position[0] += bullet.direction[0]
        bullet.position[1] += bullet.direction[1]
        return bullet
      })
      .filter(({ position }) => this.isOnBoard(position))
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
      this.livePlayers.some(({ id, position: [_x, _y] }) => _x === x && _y === y && id !== playerId)

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
      this.sendUpdateBoard('move')
    }
  }

  private applyBulletShoots(player: Player, bullets: Bullet[]): Bullet[] {
    const { position: [px, py] } = player
    const remainingBullets = bullets.filter(bullet => {
      const [bx, by] = bullet.position
      if (bx === px && by === py) {
        this.shootPlayer(player)
        return false
      }
      return true
    })

    if(this.livePlayers.length < 2) {
      this.end()
    }

    return remainingBullets
  }

  private shootPlayer(player: Player) {
    player.lifePoints--
    if(player.lifePoints === 0) {
      this.livePlayers = this.livePlayers.filter(({ id }) => id !== player.id)
    }
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
    const newBulletPosition: Vector = [px + direction[0], py + direction[1]]

    const isSimilarBulletJustFired = this.bullets.some(bullet => (
      bullet.position[0] === newBulletPosition[0] &&
      bullet.position[1] === newBulletPosition[1] &&
      bullet.direction[0] === direction[0] &&
      bullet.direction[1] === direction[1]
    ))

    if(isSimilarBulletJustFired) return;

    const bullet: Bullet = {
      position: newBulletPosition,
      direction
    }
    this.bullets.push(bullet)
    this.sendUpdateBoard('fire')
  }

  private sendUpdateBoard(reason: string) {
    if(this.gameState === GameState.Started) {
      this.commander.sendUpdateBoard(this.livePlayers, this.bullets, reason)
    }
  }

  private end() {
    if(this.gameState !== GameState.Started) return;

    this.logger.log('-- Game Ended --')

    clearInterval(this.gameLoop!)
    this.gameState = GameState.Ended

    const winner = this.livePlayers.length > 0 ? this.livePlayers.at(0) : undefined
    this.commander.sendGameEnded(winner)

    this.onGameEnd()
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
