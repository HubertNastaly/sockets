import io from 'socket.io';
import { Commander, Logger, SocketServer, Socket } from './model'
import { Server as HttpServer} from 'http'
import { Bullet, GameConfig, Player, PlayerId } from '../../common/model';
import { ClientEmittedEventsMap, ServerEmittedEventsMap, SocketEvent } from '../../common/events';

export class SocketCommander implements Commander {
  private readonly io: SocketServer
  private readonly logger: Logger
  private gameCallbacks: {
    onJoin: (id: string, name: string) => void
    onFire: (playerId: PlayerId, column: number) => void
  }

  constructor(logger: Logger) {
    this.logger = logger
    this.io = new io.Server<ClientEmittedEventsMap, ServerEmittedEventsMap>()
    this.gameCallbacks = {
      onJoin: () => {
        this.notImplemented('onJoin')
      },
      onFire: () => {
        this.notImplemented('onFire')
      }
    }
  }

  public initialize(httpServer: HttpServer) {
    this.io.on('connection', (socket) => {
      this.logger.log(`Socket connection established for socket: ${socket.id}`)

      this.registerOnJoin(socket)
      this.registerOnFire(socket)
    })

    this.io.on('connect_error', (error) => {
      this.logger.log({ error })
    })

    this.io.listen(httpServer)
  }

  private registerOnJoin(socket: Socket) {
    socket.on(SocketEvent.Join, ({ name }) => {
      this.gameCallbacks.onJoin(socket.id, name)
    })
  }

  private registerOnFire(socket: Socket) {
    socket.on(SocketEvent.Fire, ({ column }) => {
      this.gameCallbacks.onFire(socket.id, column)
    })
  }

  // methods used externally by Game

  setOnJoinCallback(gameCallback: (id: string, name: string) => void) {
    this.gameCallbacks.onJoin = gameCallback
  }

  setOnFireCallback(gameCallback: (playerId: PlayerId, column: number) => void) {
    this.gameCallbacks.onFire = gameCallback
  }

  start() {
    this.io.emit(SocketEvent.Start)
  }

  sendPlayerJoined(player: Player, config: GameConfig) {
    const { sockets } = this.io.sockets
    sockets.get(player.id)?.emit(SocketEvent.PlayerJoined, { player, config })
  }

  sendUpdateBoard(players: Player[], bullets: Bullet[]) {
    this.io.emit(SocketEvent.UpdateBoard, players, bullets)
  }

  private notImplemented(detail: string) {
    throw new Error('Not implmented: ' + detail)
  }
}
