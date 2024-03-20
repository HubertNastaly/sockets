export interface GameConfig {
  rows: number
  columns: number
  playersNumber: number
}

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
  position: Vector
  direction: Direction
}

export type Vector = [x: number, y: number]
export type Direction = [0, 1] | [0, -1] | [1, 0] | [-1, 0]

export interface Bullet {
  position: Vector
  direction: 1 | -1 // down | up
}
