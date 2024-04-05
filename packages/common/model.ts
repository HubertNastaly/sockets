export interface GameConfig {
  rows: number
  columns: number
  playersNumber: number
  initialLifePoints: number
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
export enum PlayerDirection {
  up = 'u',
  right = 'r',
  down = 'd',
  left = 'l'
}

export interface Bullet {
  position: Vector
  direction: Direction
}

/**
 * {x},{y},{dir}
 */
export type EncodedBullet = string

/**
 * encoded bullets separated with ";"
 */
export type EncodedBullets = string

/**
 * {id},{x},{y},{dir},{life}, further optimization 5 chars: {index}{x}{y}{dir}{life}
 */
export type EncodedPlayer = string

/**
 * encoded players separated with ";"
 */
export type EncodedPlayers = string

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}

export const DIRECTIONS_MAP: Record<string, Direction> = {
  d: [0, 1],
  l: [-1, 0],
  r: [1, 0],
  u: [0, -1]
} satisfies Record<PlayerDirection, Direction>

export const REVERSED_DIRECTIONS_MAP: Record<string, PlayerDirection> = {
  '01': PlayerDirection.down,
  '-10': PlayerDirection.left,
  '10': PlayerDirection.right,
  '0-1': PlayerDirection.up
}
