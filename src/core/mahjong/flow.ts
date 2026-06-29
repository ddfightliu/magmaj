/**
 * 日麻对局流程工具函数
 * 负责牌墙创建、发牌、玩家顺序、吃碰杠检测与副露构造等
 */
import type { Tile } from '../../types/mahjong'
import { randomShuffle } from '../../utils/shuffle'

/**
 * 创建并洗牌墙
 * 生成完整的136张牌（万筒索各36张 + 字牌28张），然后随机洗牌
 */
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

/**
 * 从牌墙中抽取指定数量的牌
 */
export function drawTiles(wall: Tile[], count: number): Tile[] {
  return wall.splice(0, count)
}

/**
 * 发牌给所有玩家
 * 庄家获得14张牌，闲家各获得13张牌
 * 同时从牌墙末尾提取14张作为王牌（死墙）
 */
export function dealHands(wall: Tile[], playerCount: number, dealerIndex = 0): { hands: Tile[][]; wall: Tile[]; deadWall: Tile[] } {
  const hands: Tile[][] = []
  for (let i = 0; i < playerCount; i += 1) {
    const count = i === dealerIndex ? 14 : 13
    hands.push(wall.splice(0, count))
  }
  const deadWall = wall.splice(0, 14)
  return { hands, wall, deadWall }
}

/**
 * 获取玩家顺序列表
 * 根据对局人数返回对应的玩家ID列表（p1, p2, p3, p4）
 */
export function getPlayerOrder(playerCount: number): string[] {
  if (playerCount === 2) return ['p1', 'p2']
  if (playerCount === 3) return ['p1', 'p2', 'p3']
  return ['p1', 'p2', 'p3', 'p4']
}

/**
 * 获取下一个玩家的ID
 * 用于确定出牌权的转移（按顺时针顺序）
 */
export function nextPlayerId(currentId: string, playerCount: number): string {
  const order = getPlayerOrder(playerCount)
  const index = order.indexOf(currentId)
  return order[(index + 1) % order.length]
}

/**
 * 获取上一个玩家的ID
 * 用于确定点炮者或上家（按逆时针顺序）
 */
export function previousPlayerId(currentId: string, playerCount: number): string {
  const order = getPlayerOrder(playerCount)
  const index = order.indexOf(currentId)
  return order[(index - 1 + order.length) % order.length]
}

// 副露辅助函数：碰/杠/吃的基本检测与构造
import type { Tile, Meld } from '../../types/mahjong'

/**
 * 统计手牌中指定牌的数量
 */
export function countTileInHand(hand: Tile[], tile: Tile) {
  return hand.filter((t) => t.suit === tile.suit && t.rank === tile.rank).length
}

/**
 * 检测是否可以碰牌
 * 需要手牌中有至少2张与弃牌相同的牌
 */
export function canPon(hand: Tile[], tile: Tile) {
  return countTileInHand(hand, tile) >= 2
}

/**
 * 检测是否可以杠牌
 * 需要手牌中有至少3张与弃牌相同的牌
 */
export function canKan(hand: Tile[], tile: Tile) {
  return countTileInHand(hand, tile) >= 3
}

/**
 * 获取所有可能的吃牌组合
 * 返回可以与弃牌组成顺子的手牌配对列表
 * 吃牌只能吃上家的弃牌，且只能吃同花色的连续牌
 */
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

/**
 * 构造碰牌副露（刻子）
 */
export function makePonMeld(tile: Tile): Meld {
  return { type: 'pon', tiles: [tile, tile, tile] }
}

/**
 * 构造杠牌副露（杠子）
 */
export function makeKanMeld(tile: Tile): Meld {
  return { type: 'kan', tiles: [tile, tile, tile, tile] }
}

/**
 * 构造吃牌副露（顺子）
 * 将三张牌按点数排序后返回
 */
export function makeChiMeld(tile: Tile, companionA: Tile, companionB: Tile): Meld {
  return { type: 'chi', tiles: [companionA, companionB, tile].sort((a, b) => a.rank - b.rank) }
}