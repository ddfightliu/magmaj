import type { Tile, Meld } from './mahjong'
import type { SkillId } from './skill'

export type PlayerWind = 'east' | 'south' | 'west' | 'north'
export type GamePhase = 'waiting' | 'dealing' | 'playing' | 'scoring'

export interface PlayerState {
  id: string
  name: string
  wind: PlayerWind
  hand: Tile[]
  openMelds: Meld[]
  discards: Tile[]
  score: number
  isRiichi: boolean
  stars: number
  skills: SkillId[]
  skillState: Record<SkillId, number>
}

export interface HandAnalysisSummary {
  isWinning: boolean
  han: number
  fu: number
  score: number
  yaku: string[]
  possibleWinningTiles: import('./mahjong').Tile[]
}

export interface RoundState {
  roundWind: PlayerWind
  honba: number
  dealer: string
  wall: Tile[]
  deadWall: Tile[]
  currentPlayerId: string
  phase: GamePhase
  lastDiscard?: Tile
  recentAction?: string
  analysis?: HandAnalysisSummary
}

export interface RoomSettings {
  mode: '2p' | '3p' | '4p'
  skillEnabled: boolean
  entryFee: number
  prizePool: number
}

export interface GameState {
  players: PlayerState[]
  round: RoundState
  result?: {
    winnerId: string
    score: number
    yaku: string[]
    type: 'tsumo' | 'ron' | 'draw'
  }
  settings: RoomSettings
}
