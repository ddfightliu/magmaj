import type { Tile } from '../types/mahjong'

function tileKey(t: Tile) {
  return `${t.suit}-${t.rank}`
}

export function sortHandSmart(hand: Tile[]): Tile[] {
  const counts = new Map<string, number>()
  for (const t of hand) counts.set(tileKey(t), (counts.get(tileKey(t)) || 0) + 1)

  const result: Tile[] = []
  const suits: Array<Tile['suit']> = ['man', 'pin', 'sou']

  // extract triplets first
  for (const s of suits) {
    for (let r = 1; r <= 9; r++) {
      const k = `${s}-${r}`
      while ((counts.get(k) || 0) >= 3) {
        result.push({ suit: s, rank: r }, { suit: s, rank: r }, { suit: s, rank: r })
        counts.set(k, (counts.get(k) || 0) - 3)
      }
    }
  }
  // honors triplets
  for (let r = 1; r <= 7; r++) {
    const k = `honor-${r}`
    while ((counts.get(k) || 0) >= 3) {
      result.push({ suit: 'honor', rank: r }, { suit: 'honor', rank: r }, { suit: 'honor', rank: r })
      counts.set(k, (counts.get(k) || 0) - 3)
    }
  }

  // extract sequences
  for (const s of suits) {
    for (let r = 1; r <= 7; r++) {
      const k1 = `${s}-${r}`
      const k2 = `${s}-${r + 1}`
      const k3 = `${s}-${r + 2}`
      while ((counts.get(k1) || 0) > 0 && (counts.get(k2) || 0) > 0 && (counts.get(k3) || 0) > 0) {
        result.push({ suit: s, rank: r }, { suit: s, rank: r + 1 }, { suit: s, rank: r + 2 })
        counts.set(k1, (counts.get(k1) || 0) - 1)
        counts.set(k2, (counts.get(k2) || 0) - 1)
        counts.set(k3, (counts.get(k3) || 0) - 1)
      }
    }
  }

  // remaining tiles
  const remaining: Tile[] = []
  for (const [k, v] of counts.entries()) {
    const [s, rstr] = k.split('-')
    const r = Number(rstr)
    for (let i = 0; i < v; i++) remaining.push({ suit: s as Tile['suit'], rank: r })
  }

  remaining.sort((a, b) => {
    const order = (s: Tile['suit']) => (s === 'man' ? 0 : s === 'pin' ? 1 : s === 'sou' ? 2 : 3)
    const oa = order(a.suit)
    const ob = order(b.suit)
    if (oa !== ob) return oa - ob
    return a.rank - b.rank
  })

  result.push(...remaining)
  return result
}
