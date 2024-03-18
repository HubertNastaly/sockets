export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}

export interface Commander {
  setOnJoinCallback(callback: (id: PlayerId, name: string) => void): void;
  start(): void;
}
