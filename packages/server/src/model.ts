import io from "socket.io";
import { Bullet, GameConfig, Player, PlayerDirection, PlayerId } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Commander {
  setOnJoinCallback(callback: (id: PlayerId, name: string) => void): void;
  setOnFireCallback(callback: (playerId: PlayerId) => void): void;
  setOnMoveCallback(callback: (playerId: PlayerId, direction: PlayerDirection) => void): void;
  sendGameStarted(): void;
  sendGameEnded(winner?: Player): void;
  sendPlayerJoined(player: Player, config: GameConfig): void;
  sendUpdateBoard(players: Player[], bullets: Bullet[], reason: string): void;
}

export type SocketServer = io.Server<ClientEmittedEventsMap, ServerEmittedEventsMap>
export type Socket = io.Socket<ClientEmittedEventsMap, ServerEmittedEventsMap>
