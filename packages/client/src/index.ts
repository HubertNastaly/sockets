import * as io from 'socket.io-client'
import { createServer, Server as HttpServer } from 'http'
import { Player } from '../../common/model'

const PORT = Number(process.env.PORT || 3001)
const HOST = 'localhost'
const SERVER_URL = 'http://localhost:3000'

class Client {
  public readonly name: string
  private readonly httpServer: HttpServer

  constructor() {
    this.name = 'Adam'
    this.httpServer = createServer()
  }

  public run() {
    this.httpServer.listen(PORT, HOST, undefined, () => {
      console.log(`Client running on port ${PORT}`)
    
      const socket = io.connect(SERVER_URL)
    
      socket.on('connect', () => {
        console.log('Client socket connection established')
        this.registerConfirmJoin(socket)
        this.registerStart(socket)

        this.joinGame(socket)
      })
    
      socket.on('connect_error', (error) => {
        console.log({ error })
      })
    })
  }

  private joinGame(socket: io.Socket) {
    socket.emit('join', { name: this.name })
  }

  private registerStart(socket: io.Socket) {
    socket.on('start', () => {
      console.log('Game started')
    })
  }

  private registerConfirmJoin(socket: io.Socket) {
    socket.on('playerJoined', (player: Player) => {
      console.log('Player joined: ', { player })
    })
  }
}

const client = new Client()
client.run()
