export interface GameConfig {
  rows: number
  columns: number
  playersNumber: number
  initialLifePoints: number
  timeoutSec: number
}

export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
  position: Vector
  direction: Direction
  lifePoints: number
}

export type Vector = [x: number, y: number]
export type Direction = [0, -1] | [1, 0] | [0, 1] | [-1, 0]
export type PlayerDirection = 'up' | 'right' | 'down' | 'left'

export interface Bullet {
  position: Vector
  direction: Direction
}

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}
