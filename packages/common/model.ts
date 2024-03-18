export interface GameConfig {
  rows: number
  columns: number
}

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

export interface PlayerJoinedPayload {
  player: Player
  config: GameConfig
}
