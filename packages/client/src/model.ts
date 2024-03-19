import { Socket } from "socket.io-client";
import { Bullet } from "../../common/model";
import { ClientEmittedEventsMap, ServerEmittedEventsMap } from "../../common/events";

export interface Painter {
  initialize(width: number, height: number): void;
  drawBoard(bullets: Bullet[]): void;
}

export type ClientSocket = Socket<ServerEmittedEventsMap, ClientEmittedEventsMap>
