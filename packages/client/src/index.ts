import readline from 'readline'
import { connect } from 'socket.io-client'
import { Bullet, Player, PlayerDirection, PlayerId } from '../../common/model'
import { ClientSocket } from './model'
import { ConsolePainter } from './consolePainter'
import { SocketEvent } from '../../common/events'

const SERVER_URL = 'http://localhost:3000'

class Client {
  private socket: ClientSocket
  public readonly name: string
  private painter: ConsolePainter
  private playerId: PlayerId
  private gameEnded: boolean

  constructor() {
    this.name = 'Adam'
    this.painter = new ConsolePainter()
    this.playerId = ''
    this.gameEnded = false
    this.socket = {} as ClientSocket
  }

  public run() {
    this.socket = connect(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    this.registerConnectionEstablished()
    this.registerPlayerJoined()
    this.registerStart()
    this.registerUpdateBoard()
    this.registerGameEnded()
    this.registerKeyPress()

    this.socket.on('connect', () => {
      console.log('Client socket connection established')
      this.joinGame()
    })
  
    this.socket.on('connect_error', (error) => {
      console.log({ error })
    })
  }

  private joinGame() {
    this.socket.emit(SocketEvent.Join, { name: this.name })
  }

  private move(direction: PlayerDirection) {
    this.socket.emit(SocketEvent.Move, { direction })
  }

  private fire() {
    this.socket.emit(SocketEvent.Fire)
  }

  private registerStart() {
    this.socket.on(SocketEvent.Start, () => {
      console.log('Game started')
      this.painter.drawBoard([], [], this.playerId)
    })
  }

  private registerPlayerJoined() {
    this.socket.on(SocketEvent.PlayerJoined, ({ player, config }) => {
      this.painter.initialize(config.columns, config.rows)
      // TODO: send only id
      this.playerId = player.id
    })
  }

  private registerUpdateBoard() {
    this.socket.on(SocketEvent.UpdateBoard, (players: Player[], bullets: Bullet[]) => {
      this.painter.prepareForNewPaint()
      this.painter.drawBoard(players, bullets, this.playerId)
    })
  }

  private registerConnectionEstablished() {
    this.socket.on(SocketEvent.ConnectionEstablished, (persistentSocketId) => {
      this.socket.auth = { persistentSocketId }
    })
  }

  private registerGameEnded() {
    this.socket.on(SocketEvent.GameEnded, (winner?: Player) => {
      this.gameEnded = true
      this.painter.clearBoard()
      this.painter.drawGameEnded(winner)
    })
  }

  private registerKeyPress() {
    readline.emitKeypressEvents(process.stdin)
    process.stdin.on('keypress', (_, key) => {
      if(this.gameEnded) {
        if(key.name === 'p') {
          this.gameEnded = false
          this.joinGame()
        } else {
          process.exit()
        }
      }

      switch(key.name) {
        case 'up':
          this.move('up')
          return
        case 'right':
          this.move('right')
          return
        case 'down':
          this.move('down')
          return
        case 'left':
          this.move('left')
          return
        case 'space':
          this.fire()
          return
        case 'x':
          process.exit()
      }
    })
    process.stdin.setRawMode(true)
  }
}

const client = new Client()
client.run()
