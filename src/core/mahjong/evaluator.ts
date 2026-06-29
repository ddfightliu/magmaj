import { Tile, HandAnalysis, Meld } from '../../types/mahjong'
import { calculateScore as calc } from './scoring'

type AnalyzeOptions = {
  isMenzen?: boolean
  isTsumo?: boolean
  seatWind?: string
  roundWind?: string
}

function tileKey(t: Tile) {
  return `${t.suit}:${t.rank}`
}

function countTiles(tiles: Tile[]) {
  const map = new Map<string, number>()
  for (const t of tiles) {
    map.set(tileKey(t), (map.get(tileKey(t)) || 0) + 1)
  }
  return map
}

function isTerminalOrHonor(t: Tile) {
  if (t.suit === 'honor') return true
  return t.rank === 1 || t.rank === 9
}

function getAllTileTypes(): Tile[] {
  const tiles: Tile[] = []
  const suits = ['man', 'pin', 'sou'] as const
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank += 1) {
      tiles.push({ suit, rank })
    }
  }
  for (let rank = 1; rank <= 7; rank += 1) {
    tiles.push({ suit: 'honor', rank })
  }
  return tiles
}

function canCompleteStandardHand(counts: Map<string, number>): boolean {
  const entries = Array.from(counts.entries()).filter(([, count]) => count > 0)
  if (entries.length === 0) return true

  const [tileKey, count] = entries[0]
  const [suit, rankStr] = tileKey.split(':')
  const rank = Number(rankStr)

  if (count >= 3) {
    counts.set(tileKey, count - 3)
    if (canCompleteStandardHand(counts)) {
      counts.set(tileKey, count)
      return true
    }
    counts.set(tileKey, count)
  }

  if (suit !== 'honor' && rank <= 7) {
    const nextKey = `${suit}:${rank + 1}`
    const nextNextKey = `${suit}:${rank + 2}`
    const nextCount = counts.get(nextKey) ?? 0
    const nextNextCount = counts.get(nextNextKey) ?? 0
    if (nextCount > 0 && nextNextCount > 0) {
      counts.set(tileKey, count - 1)
      counts.set(nextKey, nextCount - 1)
      counts.set(nextNextKey, nextNextCount - 1)
      if (canCompleteStandardHand(counts)) {
        counts.set(tileKey, count)
        counts.set(nextKey, nextCount)
        counts.set(nextNextKey, nextNextCount)
        return true
      }
      counts.set(tileKey, count)
      counts.set(nextKey, nextCount)
      counts.set(nextNextKey, nextNextCount)
    }
  }

  return false
}

function isStandardWinningHand(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false
  const counts = countTiles(tiles)

  for (const [key, count] of counts.entries()) {
    if (count >= 2) {
      counts.set(key, count - 2)
      if (canCompleteStandardHand(counts)) {
        counts.set(key, count)
        return true
      }
      counts.set(key, count)
    }
  }

  return false
}

function isSevenPairs(tiles: Tile[]) {
  if (tiles.length !== 14) return false
  const counts = countTiles(tiles)
  return Array.from(counts.values()).every((count) => count === 2)
}

function isThirteenOrphans(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false
  const required = [
    { suit: 'man', rank: 1 }, { suit: 'man', rank: 9 },
    { suit: 'pin', rank: 1 }, { suit: 'pin', rank: 9 },
    { suit: 'sou', rank: 1 }, { suit: 'sou', rank: 9 },
    { suit: 'honor', rank: 1 }, { suit: 'honor', rank: 2 },
    { suit: 'honor', rank: 3 }, { suit: 'honor', rank: 4 },
    { suit: 'honor', rank: 5 }, { suit: 'honor', rank: 6 },
    { suit: 'honor', rank: 7 }
  ]
  const found = new Set<string>()
  for (const t of tiles) {
    found.add(tileKey(t))
  }
  return required.every((t) => found.has(tileKey(t)))
}

function detectYaku(tiles: Tile[], openMelds: Meld[], opts: AnalyzeOptions) {
  const yaku: string[] = []
  const counts = countTiles(tiles.concat(...openMelds.map(m => m.tiles)))
  const isMenzen = opts.isMenzen ?? (openMelds.length === 0)

  if (isThirteenOrphans(tiles)) {
    yaku.push('国士无双')
    return yaku
  }

  if (isSevenPairs(tiles)) {
    yaku.push('七対子')
  }

  const hasTerminalOrHonor = tiles.some(isTerminalOrHonor) || openMelds.some(m => m.tiles.some(isTerminalOrHonor))
  if (!hasTerminalOrHonor) {
    yaku.push('断幺九')
  }

  const suits = new Set<string>()
  for (const t of tiles) suits.add(t.suit)
  for (const m of openMelds) for (const t of m.tiles) suits.add(t.suit)
  if (suits.size === 1 && !suits.has('honor')) {
    yaku.push('清一色')
  } else if (suits.size === 2 && suits.has('honor')) {
    yaku.push('混一色')
  }

  let ponCount = 0
  let kanCount = 0
  let chiCount = 0
  for (const m of openMelds) {
    if (m.type === 'pon') ponCount++
    if (m.type === 'kan') kanCount++
    if (m.type === 'chi') chiCount++
  }

  const allTiles = [...tiles, ...openMelds.flatMap(m => m.tiles)]
  const allCounts = countTiles(allTiles)
  let closedPonCount = 0
  let closedKanCount = 0
  for (const [key, cnt] of allCounts) {
    if (cnt === 3) closedPonCount++
    if (cnt === 4) closedKanCount++
  }

  const totalPonKan = ponCount + kanCount + closedPonCount + closedKanCount
  const totalMelds = totalPonKan + chiCount

  if (totalMelds === 4 && chiCount === 0) {
    yaku.push('対々和')
  }

  for (const [key, v] of counts) {
    if (v >= 3) {
      const [s, r] = key.split(':')
      if (s === 'honor') {
        const rank = Number(r)
        if (rank >= 5 && rank <= 7) {
          yaku.push('役牌(三元牌)')
          break
        }
      }
    }
  }

  const seatWind = opts.seatWind || 'east'
  const roundWind = opts.roundWind || 'east'
  const windTiles: Record<string, number> = { east: 1, south: 2, west: 3, north: 4 }
  
  if (seatWind && windTiles[seatWind]) {
    const seatWindKey = `honor:${windTiles[seatWind]}`
    if (counts.get(seatWindKey) >= 3) {
      yaku.push('役牌(自风)')
    }
  }
  
  if (roundWind && windTiles[roundWind]) {
    const roundWindKey = `honor:${windTiles[roundWind]}`
    if (counts.get(roundWindKey) >= 3) {
      yaku.push('役牌(场风)')
    }
  }

  if (isMenzen && opts.isTsumo && isStandardWinningHand(tiles)) {
    yaku.push('门清自摸')
  }

  if (openMelds.length > 0) {
    const allOpenTerminal = openMelds.every(m => m.tiles.every(isTerminalOrHonor))
    if (allOpenTerminal) {
      yaku.push('混老头')
    }
  }

  const hasThreeKans = kanCount + closedKanCount >= 3
  if (hasThreeKans) {
    yaku.push('三杠子')
  }

  return Array.from(new Set(yaku))
}

function calculateFu(tiles: Tile[], openMelds: Meld[], opts: AnalyzeOptions): number {
  let fu = 20

  if (isSevenPairs(tiles)) {
    return 25
  }

  const isMenzen = opts.isMenzen ?? (openMelds.length === 0)
  const isTsumo = opts.isTsumo ?? false

  if (!isMenzen && isTsumo) {
    fu += 2
  }

  for (const m of openMelds) {
    if (m.type === 'chi') {
      const hasTerminal = m.tiles.some(t => t.rank === 1 || t.rank === 9)
      if (hasTerminal) fu += 2
    }
    if (m.type === 'pon') {
      const isTerminalHonor = m.tiles[0] && isTerminalOrHonor(m.tiles[0])
      fu += isTerminalHonor ? 8 : 4
    }
    if (m.type === 'kan') {
      const isTerminalHonor = m.tiles[0] && isTerminalOrHonor(m.tiles[0])
      fu += isTerminalHonor ? 16 : 8
    }
  }

  const counts = countTiles(tiles)
  let closedPonCount = 0
  let closedKanCount = 0
  for (const [key, cnt] of counts) {
    if (cnt === 3) closedPonCount++
    if (cnt === 4) closedKanCount++
  }

  for (let i = 0; i < closedPonCount; i++) {
    fu += 4
  }
  for (let i = 0; i < closedKanCount; i++) {
    fu += 8
  }

  const pairTile = [...counts.entries()].find(([, cnt]) => cnt >= 2)
  if (pairTile) {
    const [key] = pairTile
    const [suit, rankStr] = key.split(':')
    if (suit === 'honor' || (suit !== 'honor' && (Number(rankStr) === 1 || Number(rankStr) === 9))) {
      fu += 2
    }
  }

  if (!isMenzen) {
    fu += 10
  }

  return Math.ceil(fu / 10) * 10
}

export function analyzeHand(tiles: Tile[], openMelds: Meld[] = [], opts: AnalyzeOptions = {}): HandAnalysis {
  const yaku = detectYaku(tiles, openMelds, opts)
  const isWinning = isSevenPairs(tiles) || isStandardWinningHand(tiles) || isThirteenOrphans(tiles)

  const yakuHanMap: Record<string, number> = {
    '国士无双': 13,
    '七対子': 2,
    '断幺九': 1,
    '対々和': 2,
    '清一色': 6,
    '混一色': 3,
    '役牌(三元牌)': 1,
    '役牌(自风)': 1,
    '役牌(场风)': 1,
    '门清自摸': 1,
    '混老头': 2,
    '三杠子': 2,
    '小四喜': 13,
    '大四喜': 13,
    '字一色': 13,
    '绿一色': 13,
    '清老头': 13,
    '四杠子': 13,
    '四暗刻': 13,
    '四暗刻单骑': 13,
    '天和': 13,
    '地和': 13,
    '人和': 13
  }

  let han = 0
  for (const y of yaku) {
    han += yakuHanMap[y] || 0
  }

  const fu = calculateFu(tiles, openMelds, opts)
  const score = calc(han, fu).totalPoints || calc(han, fu).basePoints

  const readyHand = tiles.length === 13
  const possibleWinningTilesMap = new Map<string, Tile>()
  if (readyHand) {
    for (const candidate of getAllTileTypes()) {
      const result = [...tiles, candidate]
      if (isStandardWinningHand(result) || isSevenPairs(result) || isThirteenOrphans(result)) {
        possibleWinningTilesMap.set(tileKey(candidate), candidate)
      }
    }
  }
  const possibleWinningTiles = Array.from(possibleWinningTilesMap.values())

  const validWin = isWinning && han >= 1
  return { isWinning: validWin, possibleWinningTiles, han, fu, score, yaku }
}

export { calc as calculateScore }