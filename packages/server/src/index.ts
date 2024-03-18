import { createServer, Server as HttpServer } from 'http'
import { Game } from './game'
import { SocketCommander } from './socketCommander'

const PORT = 3000
const HOST = 'localhost'

class Server {
  private readonly httpServer: HttpServer
  private readonly commander: SocketCommander
  private readonly game: Game

  constructor() {
    this.httpServer = createServer()
    this.commander = new SocketCommander(console)
    this.game = new Game(console, this.commander)
  }

  public run() {
    this.httpServer.listen(PORT, HOST, undefined, () => {
      console.log(`Server running on port ${PORT}`)
    })
    this.game.initialize()
    this.commander.initialize(this.httpServer)
  }
}

const server = new Server()
server.run()
