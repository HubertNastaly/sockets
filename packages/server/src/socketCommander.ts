import { Server, Socket } from 'socket.io';
import { Commander, Logger, ServerSocket } from './model'
import { Server as HttpServer} from 'http'
import { Bullet, GameConfig, Player, PlayerId } from '../../common/model';
import { ClientEmittedEventsMap, ServerEmittedEventsMap, SocketEvent } from '../../common/events';

export class SocketCommander implements Commander {
  private readonly io: ServerSocket
  private readonly logger: Logger
  private gameCallbacks: {
    onJoin: (id: string, name: string) => void
  }

  constructor(logger: Logger) {
    this.logger = logger
    this.io = new Server<ClientEmittedEventsMap, ServerEmittedEventsMap>()
    this.gameCallbacks = {
      onJoin: () => {
        throw new Error('Not implemented: onJoin')
      }
    }
  }

  public initialize(httpServer: HttpServer) {
    this.io.on('connection', (socket) => {
      this.logger.log(`Socket connection established for socket: ${socket.id}`)

      this.registerOnJoin(socket)
    })

    this.io.on('connect_error', (error) => {
      this.logger.log({ error })
    })

    this.io.listen(httpServer)
  }

  private registerOnJoin(socket: Socket) {
    socket.on(SocketEvent.Join, (data: { name: string }) => {
      this.gameCallbacks.onJoin(socket.id, data.name)
    })
  }

  // methods used externally by Game

  setOnJoinCallback(gameCallback: (id: string, name: string) => void) {
    this.gameCallbacks.onJoin = gameCallback
  }

  start() {
    this.io.emit(SocketEvent.Start)
  }

  sendPlayerJoined(player: Player, config: GameConfig) {
    const { sockets } = this.io.sockets
    sockets.get(player.id)?.emit(SocketEvent.PlayerJoined, { player, config })
  }

  sendUpdateBoard(playerId: PlayerId, bullets: Bullet[]) {
    const { sockets } = this.io.sockets
    sockets.get(playerId)?.emit(SocketEvent.UpdateBoard, bullets)
  }
}
