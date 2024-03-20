import readline from 'readline'
import { connect } from 'socket.io-client'
import { Bullet } from '../../common/model'
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
      this.painter.drawBoard([], false)
    })
  }

  private registerPlayerJoined(socket: ClientSocket) {
    socket.on(SocketEvent.PlayerJoined, ({ player, config }) => {
      this.painter.initialize(config.columns, config.rows)
      console.log('Player joined', { player })
    })
  }

  private registerUpdateBoard(socket: ClientSocket) {
    socket.on(SocketEvent.UpdateBoard, (bullets: Bullet[]) => {
      this.painter.drawBoard(bullets)
    })
  }

  private registerKeyPress(socket: ClientSocket) {
    readline.emitKeypressEvents(process.stdin)
    process.stdin.on('keypress', (char) => {
      if('123456789'.includes(char)) {
        socket.emit(SocketEvent.Fire, { column: Number(char) - 1 })
      }
      if(char === 'x') {
        process.exit()
      }
    })
    process.stdin.setRawMode(true)
  }
}

const client = new Client()
client.run()
