import { Bullet, GameConfig, Player, PlayerDirection } from "./model"

export enum SocketEvent {
  Join = 'join',
  Start = 'start',
  PlayerJoined = 'playerJoined',
  UpdateBoard = 'updateBoard',
  Fire = 'fire',
  Move = 'move',
  ConnectionEstablished = 'connectionEstablished',
  GameEnded = 'gameEnded'
}

export interface ServerEmittedEventsMap {
  [SocketEvent.Start]: () => void
  [SocketEvent.PlayerJoined]: (player: Player, config: GameConfig) => void
  [SocketEvent.UpdateBoard]: (players: Player[], bullets: Bullet[], reason: string) => void
  [SocketEvent.ConnectionEstablished]: (persistentSocketId: string) => void
  [SocketEvent.GameEnded]: (winner?: Player) => void
}

export interface ClientEmittedEventsMap {
  [SocketEvent.Join]: (name: string) => void
  [SocketEvent.Fire]: () => void
  [SocketEvent.Move]: (direction: PlayerDirection) => void
}
