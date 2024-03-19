export interface GameConfig {
  rows: number
  columns: number
}

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

export interface Bullet {
  x: number
  y: number
  direction: 1 | -1 // down | up
}
