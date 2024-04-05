import { Logger } from "./model";

export class ConsoleLogger implements Logger {
  constructor() {}

  private printTimestamp() {
    return `[${new Date().toISOString()}]`
  }

  log(...values: any[]) {
    console.log(this.printTimestamp(), ...values)
  }

  error(...values: any[]) {
    console.error(this.printTimestamp(), ...values)
  };
}
