import { Player, PlayerId } from "../../common/model";

export interface Logger {
  log: (...values: any[]) => void
  error: (...values: any[]) => void
}

export interface Commander {
  setOnJoinCallback(callback: (id: PlayerId, name: string) => void): void;
  start(): void;
  sendPlayerJoined(player: Player): void;
}
