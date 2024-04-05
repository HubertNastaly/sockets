import { createServer, Server as HttpServer } from 'http'
import { Game } from './game'
import { SocketCommander } from './socketCommander'
import { ConsoleLogger } from '../../common/consoleLogger'

const PORT = 3000
const HOST = 'localhost'

class Server {
  private readonly httpServer: HttpServer
  private readonly logger: ConsoleLogger

  constructor() {
    this.httpServer = createServer()
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

    commander.initialize(this.httpServer)
  }

  private createNewGame(commander: SocketCommander) {
    const game = new Game(this.logger, commander)
    game.initialize(() => this.createNewGame(commander))
  }
}

const server = new Server()
server.run()
