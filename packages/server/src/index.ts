import express from 'express'
import { createServer, Server as HttpServer } from 'http'
import { Game } from './game'
import { SocketCommander } from './socketCommander'
import { ConsoleLogger } from '../../common/consoleLogger'

const PORT = 3000
const HOST = '0.0.0.0'

class Server {
  private readonly httpServer: HttpServer
  private readonly logger: ConsoleLogger
  private game: Game | undefined

  constructor() {
    const app = express()
    app.get('/health', (_, res) => {
      res.status(200).send('Running')
    })
    this.httpServer = createServer(app)
    this.logger = new ConsoleLogger()
  }

  public run() {
    this.httpServer.listen(PORT, HOST, undefined, () => {
      this.logger.log(`Server running on port ${PORT}`)
      this.createNewGameAndSocketConnection()
    })
  }

  private createNewGameAndSocketConnection() {
    const commander = new SocketCommander(this.logger)
    this.createNewGame(commander)

    commander.initialize(this.httpServer, () => {
      this.game?.terminate()
      this.createNewGame(commander)
    })
  }

  private createNewGame(commander: SocketCommander) {
    this.game = new Game(this.logger, commander)
    this.game.initialize(() => this.createNewGame(commander))
  }
}

const server = new Server()
server.run()
