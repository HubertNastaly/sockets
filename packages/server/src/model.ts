import { Server } from "socket.io";
import { Bullet, GameConfig, Player, PlayerId } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}

export interface Commander {
  setOnJoinCallback(callback: (id: PlayerId, name: string) => void): void;
  start(): void;
  sendPlayerJoined(player: Player, config: GameConfig): void;
  sendUpdateBoard(players: PlayerId, bullets: Bullet[]): void;
}

export type ServerSocket = Server<ClientEmittedEventsMap, ServerEmittedEventsMap>
