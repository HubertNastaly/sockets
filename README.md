## 💡 About
This is a project utilizing socket.io library to build a dead simple multiplayer shooting game based on web socket communication.
It's done for training purpose. Project may have a big room for optimizations and refactoring, but it was supposed to be POC. You can play around with it. Enjoy 🙌

## 🎯 Main purposes
- Get familiar with sockets,
- Train building event driven software,
- Build software based on abstractions.

## 👷‍♂️ Architecture
The system consists of 2 main modules: server and client, and some common classes and interfaces.

### ⚙️ Server
There's one server in the system responsible for updating game state and reacting to clients' actions.
Server consumes:
- Game class - responsible for the main game logic,
- Commander class - responsible for communication (implemented variant utilizes sockets for this purpose),
- Logger class - responsible for logging (in this case it's a simple console logger).

Game accepts commander and logger as dependencies. However, as it is the core part of the system including the business logic, it operates only on abstraction.
Therefore it doesn't know anything about sockets as well as console.

### 🎮 Client
There can be many client instances in the system, each of them representing a player.
Client consumes:
- Painter class - responsible for drawing the current game state (implemented class takes advantage of terminal),
- Logger class - responsible for logging (writing to file in this case),
- Benchmark class - which can be used to measure time of specific actions and calculate average results.

## 🤓 Usage
Fork the repo and run `npm install`. To run it locally:
1. Adjust config in `packages/server/src/gameConfig.ts` for your needs and run terminals in the number of players + 1,
2. In the first terminal go to `cd packages/server` and run `npm run start`. You should see the message that your server is running,
3. In the remaining terminals go to `cd packages/client` and run `npm run start`. After providing name for each player, connection should be created. When all required players join, the game should start automatically.

## ♟️ Game rules
1. Players can move and shoot,
2. Each player has limited life points,
3. Player looses game if he runs out of life points,
4. Game ends when at most one player survives or time left goes down to zero.
