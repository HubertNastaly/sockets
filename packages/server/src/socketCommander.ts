import { Server } from 'socket.io';
import { Commander, Logger } from './model'
import { Server as HttpServer} from 'http'

export class SocketCommander implements Commander {
  private readonly io: Server
  private readonly logger: Logger
  private gameCallbacks: {
    onJoin: (id: string, name: string) => void
  }

  constructor(logger: Logger) {
    this.logger = logger
    this.io = new Server()
    this.gameCallbacks = {
      onJoin: () => {
        throw new Error('Not implemented: onJoin')
      }
    }
  }

  public initialize(httpServer: HttpServer) {
    this.io.on('connection', (socket) => {
      this.logger.log(`Socket connection established for socket: ${socket.id}`)

      socket.on('join', (data: { name: string }) => {
        this.gameCallbacks.onJoin(socket.id, data.name)
      })
    })

    this.io.on('connect_error', (error) => {
      this.logger.log({ error })
    })

    this.io.listen(httpServer)
  }

  // methods used externally by Game

  setOnJoinCallback(gameCallback: (id: string, name: string) => void) {
    this.gameCallbacks.onJoin = gameCallback
  }

  start() {
    this.io.emit('start')
  }
}
