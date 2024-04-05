import readline from 'readline'
import path from 'path'
import { connect } from 'socket.io-client'
import { Bullet, Player, PlayerDirection, PlayerId } from '../../common/model'
import { ClientSocket } from './model'
import { ConsolePainter } from './consolePainter'
import { SocketEvent } from '../../common/events'
import { FileLogger } from '../../common/fileLogger'
import { Benchmark } from '../../common/benchmark'

const SERVER_URL = 'http://localhost:3000'

const getFileName = (id: string) => path.join('logs', `${id}.txt`)

class Client {
  private socket: ClientSocket
  private logger: FileLogger
  private benchmark: Benchmark
  public name: string
  private painter: ConsolePainter
  private playerId: PlayerId
  private gameEnded: boolean

  constructor() {
    this.name = ''
    this.painter = new ConsolePainter()
    this.logger = {} as FileLogger
    this.playerId = ''
    this.gameEnded = false
    this.socket = {} as ClientSocket
    this.benchmark = new Benchmark(['fire', 'move', 'repaint'])
  }

  public run() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Type name: ', (name) => {
      this.name = name
      this.logger = new FileLogger(getFileName(name))
      this.setupSocket()
    })
  }

  private setupSocket() {
    const socket = connect(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Client socket connection established')
      this.joinGame()
    })
  
    socket.on('connect_error', (error) => {
      console.log('connect_error', { error })
    })

    this.socket = socket

    this.registerConnectionEstablished()
    this.registerPlayerJoined()
    this.registerStart()
    this.registerUpdateBoard()
    this.registerGameEnded()
    this.registerKeyPress()
  }

  private joinGame() {
    this.socket.emit(SocketEvent.Join, { name: this.name })
  }

  private move(direction: PlayerDirection) {
    this.socket.emit(SocketEvent.Move, { direction })
  }

  private fire() {
    this.logger.log('Fire')
    this.benchmark.start('fire')
    this.socket.emit(SocketEvent.Fire)
  }

  private registerStart() {
    this.socket.on(SocketEvent.Start, () => {
      this.logger.log('Game started')
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
    this.socket.on(SocketEvent.UpdateBoard, (players, bullets, reason) => {
      if(reason === 'fire') {
        this.benchmark.stop('fire')
        this.logger.log('Update board')
        this.benchmark.start('repaint')
      }

      this.painter.prepareForNewPaint()
      this.painter.drawBoard(players, bullets, this.playerId)

      if(reason === 'fire') {
        this.benchmark.stop('repaint')
        this.logger.log('Board repainted')
        this.logger.log('Current average: ' + this.benchmark.getAverage('repaint'))
      }
    })
  }

  private registerConnectionEstablished() {
    this.socket.on(SocketEvent.ConnectionEstablished, (persistentSocketId) => {
      this.socket.auth = { persistentSocketId }
    })
  }

  private registerGameEnded() {
    this.socket.on(SocketEvent.GameEnded, (winner) => {
      this.logger.log(this.benchmark.getAverage('fire').toString())
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
