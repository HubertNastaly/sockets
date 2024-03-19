import { Bullet, GameConfig, Player } from "./model"

export enum SocketEvent {
  Join = 'join',
  Start = 'start',
  PlayerJoined = 'playerJoined',
  UpdateBoard = 'updateBoard'
}

export interface ServerEmittedEventsMap {
  [SocketEvent.Start]: () => void
  [SocketEvent.PlayerJoined]: (payload: {
    player: Player
    config: GameConfig
  }) => void
  [SocketEvent.UpdateBoard]: (bullets: Bullet[]) => void
}

export interface ClientEmittedEventsMap {
  [SocketEvent.Join]: (payload: { name: string }) => void
}
