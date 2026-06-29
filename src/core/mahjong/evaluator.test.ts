import { describe, expect, it } from 'vitest'
import { analyzeHand } from './evaluator'
import type { Tile } from '../../types/mahjong'

describe('evaluator', () => {
  it('detects tanyao and calculates 1 han', () => {
    const tiles: Tile[] = [
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
    const tiles: Tile[] = [
      { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 },
      { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 },
      { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 },
      { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 },
      { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 1 }
    ]

    const result = analyzeHand(tiles)
    expect(result.han).toBeLessThanOrEqual(8)
  })
})
