import { Socket } from "socket.io-client";
import { Bullet, Player } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Painter {
  initialize(width: number, height: number): void;
  drawBoard(players: Player[], bullets: Bullet[], focusedPlayer: Player): void;
}

export type ClientSocket = Socket<ServerEmittedEventsMap, ClientEmittedEventsMap>
