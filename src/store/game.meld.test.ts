import { describe, it, expect, beforeEach } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from './game'
import { createTileSet } from '../core/mahjong/flow'

beforeEach(() => {
  setActivePinia(createPinia())
})

// Minimal tests for meld actions

describe('game store melds', () => {
  it('allows pon when caller has two matching tiles', () => {
    const store = useGameStore()
    store.players = store.players.map((p) => ({
      ...p,
      hand: [],
      openMelds: [],
      discards: []
    }))
    const tile = { suit: 'man', rank: 5 }
    store.players[1].hand.push(tile, tile, { suit: 'man', rank: 1 })
    const ok = store.callPon('p2', 'p1', tile)
    expect(ok).toBeTruthy()
    expect(store.players[1].openMelds.length).toBeGreaterThan(0)
  })

  it('prevents pon when not enough tiles', () => {
    const store = useGameStore()
    store.players = store.players.map((p) => ({
      ...p,
      hand: [],
      openMelds: [],
      discards: []
    }))
    const tile = { suit: 'pin', rank: 2 }
    store.players[1].hand.push(tile, { suit: 'pin', rank: 3 })
    const ok = store.callPon('p2', 'p1', tile)
    expect(ok).toBeFalsy()
  })

  it('allows kan when caller has three matching tiles', () => {
    const store = useGameStore()
    store.players = store.players.map((p) => ({
      ...p,
      hand: [],
      openMelds: [],
      discards: []
    }))
    const tile = { suit: 'sou', rank: 7 }
    store.players[0].hand.push(tile, tile, tile, { suit: 'man', rank: 1 })
    const ok = store.callKan('p1', 'p2', tile)
    expect(ok).toBeTruthy()
    expect(store.players[0].openMelds[0]?.type).toBe('kan')
    expect(store.players[0].hand.length).toBe(1)
  })

  it('allows chi when caller has appropriate sequence companions', () => {
    const store = useGameStore()
    store.players = store.players.map((p) => ({
      ...p,
      hand: [],
      openMelds: [],
      discards: []
    }))
    const tile = { suit: 'man', rank: 4 }
    const companionA = { suit: 'man', rank: 3 }
    const companionB = { suit: 'man', rank: 5 }
    store.players[1].hand.push(companionA, companionB, { suit: 'honor', rank: 1 })
    const ok = store.callChi('p2', 'p1', tile, companionA, companionB)
    expect(ok).toBeTruthy()
    expect(store.players[1].openMelds[0]?.type).toBe('chi')
    expect(store.players[1].hand).not.toEqual(expect.arrayContaining([companionA, companionB]))
  })
})
