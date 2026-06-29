import type { Tile } from '../../types/mahjong'
import { randomShuffle } from '../../utils/shuffle'

export function createWall(): Tile[] {
  const suits = ['man', 'pin', 'sou'] as const
  const wall: Tile[] = []
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank += 1) {
      for (let copy = 0; copy < 4; copy += 1) {
        wall.push({ suit, rank })
      }
    }
  }
  for (let rank = 1; rank <= 7; rank += 1) {
    for (let copy = 0; copy < 4; copy += 1) {
      wall.push({ suit: 'honor', rank })
    }
  }
  return randomShuffle(wall)
}

export function drawTiles(wall: Tile[], count: number): Tile[] {
  return wall.splice(0, count)
}

export function dealHands(wall: Tile[], playerCount: number, dealerIndex = 0): { hands: Tile[][]; wall: Tile[]; deadWall: Tile[] } {
  const hands: Tile[][] = []
  for (let i = 0; i < playerCount; i += 1) {
    const count = i === dealerIndex ? 14 : 13
    hands.push(wall.splice(0, count))
  }
  const deadWall = wall.splice(0, 14)
  return { hands, wall, deadWall }
}

export function getPlayerOrder(playerCount: number): string[] {
  if (playerCount === 2) return ['p1', 'p2']
  if (playerCount === 3) return ['p1', 'p2', 'p3']
  return ['p1', 'p2', 'p3', 'p4']
}

export function nextPlayerId(currentId: string, playerCount: number): string {
  const order = getPlayerOrder(playerCount)
  const index = order.indexOf(currentId)
  return order[(index + 1) % order.length]
}

export function previousPlayerId(currentId: string, playerCount: number): string {
  const order = getPlayerOrder(playerCount)
  const index = order.indexOf(currentId)
  return order[(index - 1 + order.length) % order.length]
}

// Meld helpers: basic checks and constructors for pon/kan/chi (lightweight)
import type { Tile, Meld } from '../../types/mahjong'

export function countTileInHand(hand: Tile[], tile: Tile) {
  return hand.filter((t) => t.suit === tile.suit && t.rank === tile.rank).length
}

export function canPon(hand: Tile[], tile: Tile) {
  return countTileInHand(hand, tile) >= 2
}

export function canKan(hand: Tile[], tile: Tile) {
  return countTileInHand(hand, tile) >= 3
}

// Returns possible chi sequences (each as array of two tiles from hand that with `tile` form a sequence)
export function possibleChiSequences(hand: Tile[], tile: Tile): Tile[][] {
  const sequences: Tile[][] = []
  if (tile.suit === 'honor') return sequences
  const ranks = hand.filter((t) => t.suit === tile.suit).map((t) => t.rank)
  const needSets = [
    [tile.rank - 2, tile.rank - 1],
    [tile.rank - 1, tile.rank + 1],
    [tile.rank + 1, tile.rank + 2]
  ]
  for (const pair of needSets) {
    if (pair[0] >= 1 && pair[1] <= 9) {
      if (ranks.includes(pair[0]) && ranks.includes(pair[1])) {
        sequences.push([{ suit: tile.suit, rank: pair[0] }, { suit: tile.suit, rank: pair[1] }])
      }
    }
  }
  return sequences
}

export function makePonMeld(tile: Tile): Meld {
  return { type: 'pon', tiles: [tile, tile, tile] }
}

export function makeKanMeld(tile: Tile): Meld {
  return { type: 'kan', tiles: [tile, tile, tile, tile] }
}

export function makeChiMeld(tile: Tile, companionA: Tile, companionB: Tile): Meld {
  return { type: 'chi', tiles: [companionA, companionB, tile].sort((a, b) => a.rank - b.rank) }
}
