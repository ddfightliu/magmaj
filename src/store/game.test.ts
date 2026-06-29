import { describe, it, expect, beforeEach } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from './game'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('game store settlement and draw', () => {
  it('starts a round and clears previous result', () => {
    const store = useGameStore()
    store.result = { winnerId: 'p1', score: 1000, yaku: ['断幺九'], type: 'ron' }
    store.startRound()
    expect(store.round.phase).toBe('playing')
    expect(store.result).toBeUndefined()
  })

  it('records draw result when the wall is empty', () => {
    const store = useGameStore()
    store.startRound()
    store.round.wall = []
    store.drawTile()
    expect(store.round.phase).toBe('scoring')
    expect(store.result?.type).toBe('draw')
    expect(store.result?.score).toBe(0)
  })

  it('declares ron and applies payment from previous player in 2p', () => {
    const store = useGameStore()
    store.startRound()
    store.round.currentPlayerId = 'p2'
    store.round.lastDiscard = { suit: 'man', rank: 1 }
    store.players = store.players.map((player) => ({
      ...player,
      hand: player.id === 'p2'
        ? [
            { suit: 'man', rank: 1 }, { suit: 'man', rank: 1 },
            { suit: 'pin', rank: 2 }, { suit: 'pin', rank: 3 }, { suit: 'pin', rank: 4 },
            { suit: 'sou', rank: 6 }, { suit: 'sou', rank: 7 }, { suit: 'sou', rank: 8 },
            { suit: 'honor', rank: 5 }, { suit: 'honor', rank: 5 }, { suit: 'honor', rank: 5 },
            { suit: 'man', rank: 5 }, { suit: 'man', rank: 5 }
          ]
        : player.hand
    }))
    expect(store.players.find((p) => p.id === 'p2')?.hand).toHaveLength(13)

    const beforeDealerScore = store.players.find((p) => p.id === 'p1')?.score ?? 0
    const beforeWinnerScore = store.players.find((p) => p.id === 'p2')?.score ?? 0
    store.declareRon()

    expect(store.round.phase).toBe('scoring')
    expect(store.result?.type).toBe('ron')
    expect(store.result?.winnerId).toBe('p2')
    expect(store.players.find((p) => p.id === 'p1')?.score).toBeLessThan(beforeDealerScore)
    expect(store.players.find((p) => p.id === 'p2')?.score).toBeGreaterThan(beforeWinnerScore)
  })
})
