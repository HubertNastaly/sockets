import * as readline from 'readline'
import { connect, Socket } from 'socket.io-client'
import { GameConfig, Player, PlayerJoinedPayload } from '../../common/model'

const SERVER_URL = 'http://localhost:3000'

class Client {
  public readonly name: string
  private gameConfig: GameConfig = { rows: 0, columns: 0 }

  constructor() {
    this.name = 'Adam'
  }

  public run() {
    const socket = connect(SERVER_URL)
  
    socket.on('connect', () => {
      console.log('Client socket connection established')
      this.registerPlayerJoined(socket)
      this.registerStart(socket)

      this.joinGame(socket)
    })
  
    socket.on('connect_error', (error) => {
      console.log({ error })
    })
  }

  private joinGame(socket: Socket) {
    socket.emit('join', { name: this.name })
  }

  private registerStart(socket: Socket) {
    socket.on('start', () => {
      console.log('Game started')
      this.drawBoard()
    })
  }

  private registerPlayerJoined(socket: Socket) {
    socket.on('playerJoined', ({ player, config }: PlayerJoinedPayload) => {
      this.gameConfig = config
      console.log('Player joined: ', { player, config })
    })
  }

  private drawBoard() {
    console.log()

    const horizontalEdge = '_'.repeat(this.gameConfig.columns + 2)
    const verticalEdges = '|' + ' '.repeat(this.gameConfig.columns) + '|'

    console.log(horizontalEdge)
    for(let i=0; i<this.gameConfig.rows; i++) {
      console.log(verticalEdges)
    }
    console.log(horizontalEdge)
  }
}

const client = new Client()
client.run()
