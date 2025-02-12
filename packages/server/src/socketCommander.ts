import io from 'socket.io';
import { Commander, SocketServer, Socket } from './model'
import { Server as HttpServer} from 'http'
import { Bullet, GameConfig, Logger, Player, PlayerDirection, PlayerId } from '../../common/model';
import { ClientEmittedEventsMap, ServerEmittedEventsMap, SocketEvent } from '../../common/events';

export class SocketCommander implements Commander {
  private readonly io: SocketServer
  private readonly logger: Logger
  private persistentSocketIdToPlayerId: Record<string, PlayerId>
  private persistentSocketIdToSocket: Record<string, Socket>
  private gameCallbacks: {
    onJoin: (id: string, name: string) => void
    onFire: (playerId: PlayerId) => void
    onMove: (playerId: string, direction: PlayerDirection) => void
  }

  constructor(logger: Logger) {
    this.logger = logger
    this.io = new io.Server<ClientEmittedEventsMap, ServerEmittedEventsMap>()
    this.persistentSocketIdToPlayerId = {}
    this.persistentSocketIdToSocket = {}
    this.gameCallbacks = {
      onJoin: this.notImplemented('onJoin'),
      onFire: this.notImplemented('onFire'),
      onMove: this.notImplemented('onMove')
    }
  }

  public initialize(httpServer: HttpServer, onAllClientsDisconnected: () => void) {
    this.io.on('connection', (socket) => {
      if(!socket.recovered) {
        this.logger.log(`Socket connection established for socket: ${socket.id}`)
        this.registerOnJoin(socket)

        const persistentSocketId = socket.id
        const playerId = socket.id
        this.persistentSocketIdToPlayerId[persistentSocketId] = playerId
        this.persistentSocketIdToSocket[persistentSocketId] = socket

        socket.emit(SocketEvent.ConnectionEstablished, persistentSocketId)
      } else {
        const { persistentSocketId } = socket.handshake.auth
        this.logger.log(`Socket reconnected (persistent socket id: ${persistentSocketId})`)
        if(!persistentSocketId) {
          throw new Error('Missing persistent socket id')
        }
        this.persistentSocketIdToSocket[persistentSocketId] = socket
      }

      socket.on('disconnect', () => {
        if(this.io.engine.clientsCount === 0) {
          onAllClientsDisconnected()
        }
      })

      this.registerOnFire(socket)
      this.registerOnMove(socket)
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
    socket.on(SocketEvent.Fire, () => {
      this.gameCallbacks.onFire(socket.id)
    })
  }

  private registerOnMove(socket: Socket) {
    socket.on(SocketEvent.Move, ({ direction }) => {
      this.gameCallbacks.onMove(socket.id, direction)
    })
  }

  // methods used externally by Game

  setOnJoinCallback(callback: typeof this.gameCallbacks.onJoin) {
    this.gameCallbacks.onJoin = callback
  }

  setOnFireCallback(callback: typeof this.gameCallbacks.onFire) {
    this.gameCallbacks.onFire = callback
  }

  setOnMoveCallback(callback: typeof this.gameCallbacks.onMove) {
    this.gameCallbacks.onMove = callback
  }

  sendGameStarted() {
    this.io.emit(SocketEvent.Start)
  }

  sendGameEnded(winner: Player) {
    this.io.emit(SocketEvent.GameEnded, winner)
  }

  sendPlayerJoined(player: Player, playerCount: number, config: GameConfig) {
    const { sockets } = this.io.sockets
    sockets.get(player.id)?.emit(SocketEvent.PlayerJoined, { player, config, playerCount })
  }

  sendUpdateBoard(players: Player[], bullets: Bullet[], timeLeftSec: number, reason: string) {
    this.io.emit(SocketEvent.UpdateBoard, players, bullets, timeLeftSec, reason)
  }

  private notImplemented(detail: string) {
    return () => {
      throw new Error('Not implmented: ' + detail)
    }
  }
}
