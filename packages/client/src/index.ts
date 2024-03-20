import readline from 'readline'
import { connect } from 'socket.io-client'
import { Bullet, Player } from '../../common/model'
import { ClientSocket } from './model'
import { ConsolePainter } from './consolePainter'
import { SocketEvent } from '../../common/events'

const SERVER_URL = 'http://localhost:3000'

class Client {
  public readonly name: string
  private painter: ConsolePainter

  constructor() {
    this.name = 'Adam'
    this.painter = new ConsolePainter()
  }

  public run() {
    const socket: ClientSocket = connect(SERVER_URL)
  
    socket.on('connect', () => {
      console.log('Client socket connection established')

      this.registerPlayerJoined(socket)
      this.registerStart(socket)
      this.registerUpdateBoard(socket)
      this.registerKeyPress(socket)

      this.joinGame(socket)
    })
  
    socket.on('connect_error', (error) => {
      console.log({ error })
    })
  }

  private joinGame(socket: ClientSocket) {
    socket.emit(SocketEvent.Join, { name: this.name })
  }

  private registerStart(socket: ClientSocket) {
    socket.on(SocketEvent.Start, () => {
      console.log('Game started')
      this.painter.drawBoard([], [], false)
    })
  }

  private registerPlayerJoined(socket: ClientSocket) {
    socket.on(SocketEvent.PlayerJoined, ({ config }) => {
      this.painter.initialize(config.columns, config.rows)
    })
  }

  private registerUpdateBoard(socket: ClientSocket) {
    socket.on(SocketEvent.UpdateBoard, (players: Player[], bullets: Bullet[]) => {
      this.painter.drawBoard(players, bullets)
    })
  }

  private registerKeyPress(socket: ClientSocket) {
    readline.emitKeypressEvents(process.stdin)
    process.stdin.on('keypress', (_, key) => {
      switch(key.name) {
        case 'up':
          socket.emit(SocketEvent.Move, { direction: 'up' })
          return
        case 'right':
          socket.emit(SocketEvent.Move, { direction: 'right' })
          return
        case 'down':
          socket.emit(SocketEvent.Move, { direction: 'down' })
          return
        case 'left':
          socket.emit(SocketEvent.Move, { direction: 'left' })
          return
        case 'space':
          socket.emit(SocketEvent.Fire)
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
