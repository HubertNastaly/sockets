import { Socket } from "socket.io-client";
import { Bullet, Player, PlayerId } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Painter {
  initialize(width: number, height: number): void;
  drawBoard(players: Player[], bullets: Bullet[], focusedPlayerId: PlayerId): void;
  prepareForNewPaint(): void;
}

export type ClientSocket = Socket<ServerEmittedEventsMap, ClientEmittedEventsMap>
