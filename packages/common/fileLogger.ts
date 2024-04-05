import fs from 'fs'
import { Logger } from "./model";

export class FileLogger implements Logger {
  private file: string
  private start: bigint

  constructor(file: string) {
    if(fs.existsSync(file)) {
      fs.rmSync(file)
    }
    this.file = file
    this.start = BigInt(0)
  }

  private printTimestamp() {
    const elapsed = process.hrtime.bigint() - this.start
    this.start += elapsed
    return `[+ ${elapsed.toString().padStart(15, ' ')} ns]`
  }

  log(...values: string[]) {
    const line = [this.printTimestamp(), ...values].join(' ').concat('\n')

    fs.appendFile(this.file, line, (error) => {
      if(error) {
        console.error('log', error)
      }
    })
  };

  error(...values: string[]) {
    const line = [this.printTimestamp(), 'ERROR', ...values].join(' ').concat('\n')

    fs.appendFile(this.file, line, (error) => {
      if(error) {
        console.error('error', error)
      }
    })
  };
}
