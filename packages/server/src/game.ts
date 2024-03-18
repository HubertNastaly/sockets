import { GameConfig } from "../../common/model"
import { Commander, Logger, Player, PlayerId } from "./model"

interface Bullet {
  x: number
  y: number
  direction: 'up' | 'down'
}

enum GameState {
  Waiting,
  Started,
  Ended
}

const TARGET_PLAYERS_NUMBER = 2

export class Game {
  private readonly config: GameConfig
  private readonly commander: Commander
  private readonly logger: Logger

  private gameState: GameState = GameState.Waiting
  private players: Record<PlayerId, Player>
  private bullets: Bullet[]

  constructor(logger: Logger, commander: Commander) {
    this.config = {
      columns: 7,
      rows: 30
    }
    this.players = {}
    this.bullets = []
    this.logger = logger
    this.commander = commander
  }

  public initialize() {
    this.commander.setOnJoinCallback(this.addPlayer.bind(this))
  }

  private addPlayer(id: string, name: string) {
    if(this.players[id]) {
      throw new Error(`Player with id ${id} already exists`)
    }
    this.players[id] = { id, name }
    this.logger.log(`Player ${name} (id: ${id}) joined`)

    if(Object.values(this.players).length === TARGET_PLAYERS_NUMBER) {
      this.start()
    }
  }

  private start() {
    this.gameState = GameState.Started
    this.logger.log('Game started')
    this.commander.start()
  }

  private end() {
    this.gameState = GameState.Ended
  }
}