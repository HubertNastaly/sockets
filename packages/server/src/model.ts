import io from "socket.io";
import { Bullet, GameConfig, Player, PlayerId } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}

export interface Commander {
  setOnJoinCallback(callback: (id: PlayerId, name: string) => void): void;
  setOnFireCallback(callback: (playerId: PlayerId, column: number) => void): void;
  start(): void;
  sendPlayerJoined(player: Player, config: GameConfig): void;
  sendUpdateBoard(players: PlayerId, bullets: Bullet[]): void;
}

export type SocketServer = io.Server<ClientEmittedEventsMap, ServerEmittedEventsMap>
export type Socket = io.Socket<ClientEmittedEventsMap, ServerEmittedEventsMap>
