export type Suit = 'man' | 'pin' | 'sou' | 'honor'

export interface Tile {
  suit: Suit
  rank: number // 1-9 for man/pin/sou, 1-7 for honors mapping
  id?: string
}

export type MeldType = 'chi' | 'pon' | 'kan' | 'pair'

export interface Meld {
  type: MeldType
  tiles: Tile[]
}

export interface HandAnalysis {
  isWinning: boolean
  possibleWinningTiles: Tile[]
  han: number
  fu: number
  score: number
  yaku: string[]
}
