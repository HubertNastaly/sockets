import { createServer, Server as HttpServer } from 'http'
import { Game } from './game'
import { SocketCommander } from './socketCommander'

const PORT = 3000
const HOST = 'localhost'

class Server {
  private readonly httpServer: HttpServer

  constructor() {
    this.httpServer = createServer()
  }

  public run() {
    this.httpServer.listen(PORT, HOST, undefined, () => {
      console.log(`Server running on port ${PORT}`)
      this.createNewGameAndSocketConnection()
    })
  }

  private createNewGameAndSocketConnection() {
    const commander = new SocketCommander(console)
    this.createNewGame(commander)

    commander.initialize(this.httpServer)
  }

  private createNewGame(commander: SocketCommander) {
    const game = new Game(console, commander)
    game.initialize(() => this.createNewGame(commander))
  }
}

const server = new Server()
server.run()
