import { Bullet, DIRECTIONS_MAP, EncodedBullets, EncodedPlayers, Player, REVERSED_DIRECTIONS_MAP } from "./model";

export function decodeBullets(encodedBullets: EncodedBullets): Bullet[] {
  return encodedBullets
    .split(';')
    .map((bullet): Bullet => {
      const [xStr, yStr, dirStr] = bullet.split(',')
      return {
        position: [Number(xStr), Number(yStr)],
        direction: DIRECTIONS_MAP[dirStr]
      }
    })
}

export function encodeBullets(bullets: Bullet[]): EncodedBullets {
  return bullets
    .map(({ position: [x, y], direction }): string => {
      const directionStr = direction[0].toString() + direction[1].toString()
      return `${x},${y},${REVERSED_DIRECTIONS_MAP[directionStr]}`
    })
    .join(';')
}

export function decodePlayers(encodedPlayers: EncodedPlayers): Player[] {
  return encodedPlayers
    .split(';')
    .map((player): Player => {
      const [id, xStr, yStr, dirStr, lifePointsStr] = player.split(',')
      return {
        id,
        name: '',
        position: [Number(xStr), Number(yStr)],
        direction: DIRECTIONS_MAP[dirStr],
        lifePoints: Number(lifePointsStr)
      }
    })
}

export function encodePlayers(players: Player[]): EncodedPlayers {
  return players
    .map(({ id, position: [x, y], direction, lifePoints }) => {
      const directionStr = direction[0].toString() + direction[1].toString()
      return `${id},${x},${y},${REVERSED_DIRECTIONS_MAP[directionStr]},${lifePoints}`
    })
    .join(';')
}
