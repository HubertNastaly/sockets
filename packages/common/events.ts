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
  [SocketEvent.PlayerJoined]: (payload: {
    player: Player
    playerCount: number
    config: GameConfig
  }) => void
  [SocketEvent.UpdateBoard]: (players: Player[], bullets: Bullet[], timeLeftSec: number, reason: string) => void
  [SocketEvent.ConnectionEstablished]: (persistentSocketId: string) => void
  [SocketEvent.GameEnded]: (winner?: Player) => void
}

export interface ClientEmittedEventsMap {
  [SocketEvent.Join]: (payload: { name: string }) => void
  [SocketEvent.Fire]: () => void
  [SocketEvent.Move]: (payload: { direction: PlayerDirection }) => void
}
