import io from 'socket.io';
import { Commander, SocketServer, Socket } from './model'
import { Server as HttpServer} from 'http'
import { Bullet, GameConfig, Logger, Player, PlayerDirection, PlayerId } from '../../common/model';
import { ClientEmittedEventsMap, ServerEmittedEventsMap, SocketEvent } from '../../common/events';
import { encodeBullets, encodePlayers } from '../../common/coders';

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

  public initialize(httpServer: HttpServer) {
    this.io.on('connection', (socket) => {
      if(!socket.recovered) {
        this.logger.log(`Socket connection established for socket: ${socket.id}`, { socket })
        this.registerOnJoin(socket)

        const persistentSocketId = socket.id
        const playerId = socket.id
        this.persistentSocketIdToPlayerId[persistentSocketId] = playerId
        this.persistentSocketIdToSocket[persistentSocketId] = socket

        socket.emit(SocketEvent.ConnectionEstablished, persistentSocketId)
      } else {
        this.logger.log(`Socket reconnected: `, { socket, persistentSocketIdToSocket: this.persistentSocketIdToSocket })
        const { persistentSocketId } = socket.handshake.auth
        if(!persistentSocketId) {
          throw new Error('Missing persistent socket id')
        }
        this.persistentSocketIdToSocket[persistentSocketId] = socket
      }

      this.registerOnFire(socket)
      this.registerOnMove(socket)
    })

    this.io.on('connect_error', (error) => {
      this.logger.log({ error })
    })

    this.io.listen(httpServer)
  }

  private registerOnJoin(socket: Socket) {
    socket.on(SocketEvent.Join, (name) => {
      this.gameCallbacks.onJoin(socket.id, name)
    })
  }

  private registerOnFire(socket: Socket) {
    socket.on(SocketEvent.Fire, () => {
      this.gameCallbacks.onFire(socket.id)
    })
  }

  private registerOnMove(socket: Socket) {
    socket.on(SocketEvent.Move, (direction) => {
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

  sendPlayerJoined(player: Player, config: GameConfig) {
    const { sockets } = this.io.sockets
    sockets.get(player.id)?.emit(SocketEvent.PlayerJoined, player, config)
  }

  sendUpdateBoard(players: Player[], bullets: Bullet[], reason: string) {
    this.io.emit(SocketEvent.UpdateBoard, encodePlayers(players), encodeBullets(bullets), reason)
  }

  private notImplemented(detail: string) {
    return () => {
      throw new Error('Not implmented: ' + detail)
    }
  }
}
