import { describe, it, expect } from 'bun:test'
import { analyzeHand } from './evaluator'
import { calculatePayments } from './scoring'
import { createWall, dealHands } from './flow'

describe('mahjong evaluator', () => {
  it('detects tanyao and calculates han', () => {
    const tiles = [
      { suit: 'man', rank: 2 }, { suit: 'man', rank: 3 }, { suit: 'man', rank: 4 },
      { suit: 'pin', rank: 2 }, { suit: 'pin', rank: 3 }, { suit: 'pin', rank: 4 },
      { suit: 'sou', rank: 2 }, { suit: 'sou', rank: 3 }, { suit: 'sou', rank: 4 },
      { suit: 'man', rank: 5 }, { suit: 'man', rank: 6 }, { suit: 'man', rank: 7 },
      { suit: 'pin', rank: 5 }, { suit: 'pin', rank: 5 }
    ]

    const result = analyzeHand(tiles)
    expect(result.yaku).toContain('断幺九')
    expect(result.han).toBeGreaterThanOrEqual(1)
    expect(result.fu).toBeGreaterThanOrEqual(20)
  })

  it('caps han at yakuman limit', () => {
    const tiles = Array.from({ length: 14 }, () => ({ suit: 'sou', rank: 1 }))
    const result = analyzeHand(tiles)
    expect(result.han).toBeLessThanOrEqual(8)
  })
})

describe('mahjong scoring', () => {
  it('calculates payment for ron win', () => {
    const result = calculatePayments(2, 30, { isTsumo: false, isDealer: false, playerCount: 4 })
    expect(result.payments.ron).toBeGreaterThan(0)
    expect(result.winnerGain).toBe(result.payments.ron)
  })

  it('calculates dealer tsumo payment', () => {
    const result = calculatePayments(1, 30, { isTsumo: true, isDealer: true, playerCount: 4 })
    const shares = Object.values(result.payments)
    expect(shares.every((value) => value === shares[0])).toBe(true)
    expect(result.winnerGain).toBeGreaterThan(0)
  })

  it('caps yakuman correctly', () => {
    const result = calculatePayments(13, 30, { isTsumo: false, isDealer: false, playerCount: 4 })
    expect(result.basePoints).toBe(8000)
    expect(result.limit).toBe('yakuman')
  })
})

describe('mahjong tenpai and winning detection', () => {
  it('recognizes standard winning hand', () => {
    const tiles = [
      { suit: 'man', rank: 1 }, { suit: 'man', rank: 1 }, { suit: 'man', rank: 1 },
      { suit: 'pin', rank: 2 }, { suit: 'pin', rank: 3 }, { suit: 'pin', rank: 4 },
      { suit: 'sou', rank: 6 }, { suit: 'sou', rank: 7 }, { suit: 'sou', rank: 8 },
      { suit: 'honor', rank: 5 }, { suit: 'honor', rank: 5 }, { suit: 'honor', rank: 5 },
      { suit: 'man', rank: 5 }, { suit: 'man', rank: 5 }
    ]
    const result = analyzeHand(tiles)
    expect(result.isWinning).toBe(true)
    expect(result.yaku).toContain('役牌(三元牌)')
  })

  it('finds tenpai tiles for 13-tile hand', () => {
    const tiles = [
      { suit: 'man', rank: 2 }, { suit: 'man', rank: 3 }, { suit: 'man', rank: 4 },
      { suit: 'pin', rank: 3 }, { suit: 'pin', rank: 4 }, { suit: 'pin', rank: 5 },
      { suit: 'sou', rank: 7 }, { suit: 'sou', rank: 8 }, { suit: 'sou', rank: 9 },
      { suit: 'man', rank: 7 }, { suit: 'man', rank: 8 }, { suit: 'man', rank: 9 },
      { suit: 'honor', rank: 5 }
    ]
    const result = analyzeHand(tiles)
    expect(result.possibleWinningTiles.length).toBeGreaterThan(0)
    expect(result.possibleWinningTiles).toEqual(
      expect.arrayContaining([{ suit: 'honor', rank: 5 }])
    )
  })
})

describe('mahjong flow', () => {
  it('deals correct hand sizes and dead wall for 4 players', () => {
    const wall = createWall()
    const { hands, wall: remaining, deadWall } = dealHands(wall, 4, 0)

    expect(hands).toHaveLength(4)
    expect(hands[0]).toHaveLength(14)
    expect(hands[1]).toHaveLength(13)
    expect(hands[2]).toHaveLength(13)
    expect(hands[3]).toHaveLength(13)
    expect(deadWall).toHaveLength(14)
    expect(remaining.length).toBe(69)
  })
})
