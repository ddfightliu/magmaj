import { defineStore } from 'pinia'
import type { GameState, PlayerState, RoomSettings, PlayerWind } from '../types/game'
import type { Tile } from '../types/mahjong'
import { createWall, dealHands, nextPlayerId, previousPlayerId, canPon, canKan, possibleChiSequences, makePonMeld, makeKanMeld, makeChiMeld } from '../core/mahjong/flow'
import { analyzeHand } from '../core/mahjong'
import { calculatePayments, roundFu, formatLimit, isYakuman } from '../core/mahjong/scoring'

function createInitialPlayers(): PlayerState[] {
  return [
    {
      id: 'p1',
      name: '玩家1',
      wind: 'east',
      hand: [],
      openMelds: [],
      discards: [],
      score: 25000,
      isRiichi: false,
      stars: 3,
      skills: [],
      skillState: {}
    },
    {
      id: 'p2',
      name: '玩家2',
      wind: 'south',
      hand: [],
      openMelds: [],
      discards: [],
      score: 25000,
      isRiichi: false,
      stars: 3,
      skills: [],
      skillState: {}
    }
  ]
}

const initialSettings: RoomSettings = {
  mode: '2p',
  skillEnabled: true,
  entryFee: 0,
  prizePool: 0
}

function roundToHundred(value: number) {
  return Math.ceil(value / 100) * 100
}

function createTileSet(): Tile[] {
  const tiles: Tile[] = []
  const suits = ['man', 'pin', 'sou'] as const
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank += 1) {
      for (let copy = 0; copy < 4; copy += 1) {
        tiles.push({ suit, rank })
      }
    }
  }
  for (let rank = 1; rank <= 7; rank += 1) {
    for (let copy = 0; copy < 4; copy += 1) {
      tiles.push({ suit: 'honor', rank })
    }
  }
  return tiles
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    players: createInitialPlayers(),
    round: {
      roundWind: 'east',
      honba: 0,
      dealer: 'p1',
      wall: [],
      deadWall: [],
      currentPlayerId: 'p1',
      phase: 'waiting'
    },
    settings: initialSettings
  }),

  getters: {
    currentPlayer(state) {
      return state.players.find((player) => player.id === state.round.currentPlayerId)
    },

    playerCount(state) {
      return state.settings.mode === '2p' ? 2 : state.settings.mode === '3p' ? 3 : 4
    },

    lastDiscarderId(state) {
      return previousPlayerId(state.round.currentPlayerId, this.playerCount)
    },

    canClaimPon(state) {
      return !!state.round.lastDiscard && !!this.currentPlayer && canPon(this.currentPlayer.hand, state.round.lastDiscard)
    },

    canClaimKan(state) {
      return !!state.round.lastDiscard && !!this.currentPlayer && canKan(this.currentPlayer.hand, state.round.lastDiscard)
    },

    chiOptions(state) {
      if (!state.round.lastDiscard || !this.currentPlayer) return []
      return possibleChiSequences(this.currentPlayer.hand, state.round.lastDiscard)
    }
  },

  actions: {
    startRound() {
      const wall = createWall()
      const playerCount = this.settings.mode === '2p' ? 2 : this.settings.mode === '3p' ? 3 : 4
      const players = this.players.map((player) => ({
        ...player,
        hand: [],
        discards: [],
        openMelds: [],
        isRiichi: false
      }))

      const dealerIndex = players.findIndex((player) => player.id === this.round.dealer)
      const { hands, wall: remaining, deadWall } = dealHands(wall, playerCount, dealerIndex >= 0 ? dealerIndex : 0)
      const newPlayers = players.map((player, index) => ({
        ...player,
        hand: hands[index] ?? []
      }))

      this.players = newPlayers
      this.round.wall = remaining
      this.round.deadWall = deadWall
      this.round.phase = 'playing'
      this.round.currentPlayerId = this.round.dealer
      this.round.lastDiscard = undefined
      this.round.recentAction = '开局完成，庄家起手14张'
      this.round.analysis = undefined
      this.result = undefined
    },

    drawTile() {
      if (this.round.phase !== 'playing') return
      const tile = this.round.wall.shift()
      if (!tile) {
        this.round.phase = 'scoring'
        this.round.recentAction = '牌墙已空，流局结束'
        this.result = { winnerId: '', score: 0, yaku: [], type: 'draw' }
        return
      }
      const player = this.currentPlayer
      if (!player) return
      player.hand.push(tile)
      this.round.recentAction = `${player.name} 摸牌 ${tile.suit}-${tile.rank}`
      this.analyzeCurrentHand()
    },

    discardTile(tile: Tile) {
      const player = this.currentPlayer
      if (!player) return
      const index = player.hand.findIndex((item) => item.suit === tile.suit && item.rank === tile.rank)
      if (index === -1) return
      player.hand.splice(index, 1)
      player.discards.push(tile)
      this.round.lastDiscard = tile
      this.round.recentAction = `${player.name} 弃牌 ${tile.suit}-${tile.rank}`
      this.nextPlayer()
    },

    nextPlayer() {
      const playerCount = this.settings.mode === '2p' ? 2 : this.settings.mode === '3p' ? 3 : 4
      this.round.currentPlayerId = nextPlayerId(this.round.currentPlayerId, playerCount)
    },

    // Meld actions (skeleton implementations)
    callPon(callerId: string, fromPlayerId: string, tile: Tile) {
      const caller = this.players.find((p) => p.id === callerId)
      if (!caller) return false
      if (!canPon(caller.hand, tile)) return false
      let removed = 0
      caller.hand = caller.hand.filter((t) => {
        if (removed < 2 && t.suit === tile.suit && t.rank === tile.rank) {
          removed++
          return false
        }
        return true
      })
      const meld = makePonMeld(tile)
      caller.openMelds = caller.openMelds || []
      caller.openMelds.push(meld)
      this.round.recentAction = `${caller.name} 碰 ${tile.suit}-${tile.rank}`
      this.round.lastDiscard = undefined
      this.round.currentPlayerId = callerId
      return true
    },

    callKan(callerId: string, fromPlayerId: string, tile: Tile) {
      const caller = this.players.find((p) => p.id === callerId)
      if (!caller) return false
      if (!canKan(caller.hand, tile)) return false
      let removed = 0
      caller.hand = caller.hand.filter((t) => {
        if (removed < 3 && t.suit === tile.suit && t.rank === tile.rank) {
          removed++
          return false
        }
        return true
      })
      const meld = makeKanMeld(tile)
      caller.openMelds = caller.openMelds || []
      caller.openMelds.push(meld)
      this.round.recentAction = `${caller.name} 杠 ${tile.suit}-${tile.rank}`
      this.round.lastDiscard = undefined
      this.round.currentPlayerId = callerId
      return true
    },

    callChi(callerId: string, fromPlayerId: string, tile: Tile, companionA: Tile, companionB: Tile) {
      const caller = this.players.find((p) => p.id === callerId)
      if (!caller) return false
      const possible = possibleChiSequences(caller.hand, tile)
      const equal = (a: Tile, b: Tile) => a.suit === b.suit && a.rank === b.rank
      const validChi = possible.some((sequence) => {
        const [a, b] = sequence
        return (equal(a, companionA) && equal(b, companionB)) || (equal(a, companionB) && equal(b, companionA))
      })
      if (!validChi) return false
      let removedA = false
      let removedB = false
      caller.hand = caller.hand.filter((t) => {
        if (!removedA && t.suit === companionA.suit && t.rank === companionA.rank) {
          removedA = true
          return false
        }
        if (!removedB && t.suit === companionB.suit && t.rank === companionB.rank) {
          removedB = true
          return false
        }
        return true
      })
      const meld = makeChiMeld(tile, companionA, companionB)
      caller.openMelds = caller.openMelds || []
      caller.openMelds.push(meld)
      this.round.recentAction = `${caller.name} 吃 ${tile.suit}-${tile.rank}`
      this.round.lastDiscard = undefined
      this.round.currentPlayerId = callerId
      return true
    },

    claimPon() {
      if (!this.round.lastDiscard) return false
      return this.callPon(this.round.currentPlayerId, this.lastDiscarderId, this.round.lastDiscard)
    },

    claimKan() {
      if (!this.round.lastDiscard) return false
      return this.callKan(this.round.currentPlayerId, this.lastDiscarderId, this.round.lastDiscard)
    },

    claimChi(companionA: Tile, companionB: Tile) {
      if (!this.round.lastDiscard) return false
      return this.callChi(this.round.currentPlayerId, this.lastDiscarderId, this.round.lastDiscard, companionA, companionB)
    },

    applyScoreDeltas(deltas: Record<string, number>) {
      for (const player of this.players) {
        if (deltas[player.id]) {
          player.score += deltas[player.id]
        }
      }
    },

    declareTsumo() {
      if (this.round.phase !== 'playing') return
      const player = this.currentPlayer
      if (!player) return
      if (player.hand.length !== 14) return
      if (!this.round.analysis?.isWinning) return

      const han = this.round.analysis.han
      const fu = roundFu(this.round.analysis.fu)
      const isDealer = player.id === this.round.dealer
      const basePoints = calculateBasePoints(han, fu)
      const deltas: Record<string, number> = {}
      let winnerGain = 0

      if (isDealer) {
        const share = roundToHundred(basePoints * 2)
        for (const opponent of this.players.filter((p) => p.id !== player.id)) {
          deltas[opponent.id] = -share
          winnerGain += share
        }
      } else {
        const dealerId = this.round.dealer
        const dealerShare = roundToHundred(basePoints * 2)
        deltas[dealerId] = -dealerShare
        winnerGain += dealerShare

        for (const opponent of this.players.filter((p) => p.id !== player.id && p.id !== dealerId)) {
          const amount = roundToHundred(basePoints * 1)
          deltas[opponent.id] = -amount
          winnerGain += amount
        }
      }

      deltas[player.id] = winnerGain
      this.applyScoreDeltas(deltas)
      this.round.phase = 'scoring'
      this.round.recentAction = `${player.name} 自摸胡，获得 ${winnerGain} 分`
      this.result = { winnerId: player.id, score: winnerGain, yaku: this.round.analysis.yaku, type: 'tsumo' }
    },

    declareRon() {
      if (this.round.phase !== 'playing') return
      const player = this.currentPlayer
      if (!player) return
      if (!this.round.lastDiscard) return
      if (player.hand.length !== 13) return

      const candidateHand = [...player.hand, this.round.lastDiscard]
      const winningAnalysis = analyzeHand(candidateHand)
      if (!winningAnalysis.isWinning) return

      const han = winningAnalysis.han
      const fu = roundToHundred(winningAnalysis.fu)
      const basePoints = calculateBasePoints(han, fu)
      const payment = roundToHundred(basePoints * (player.id === this.round.dealer ? 6 : 4))
      const loserId = previousPlayerId(this.round.currentPlayerId, this.playerCount)
      const deltas: Record<string, number> = {
        [player.id]: payment,
        [loserId]: -payment
      }

      this.applyScoreDeltas(deltas)
      this.round.phase = 'scoring'
      this.round.recentAction = `${player.name} 荣牌 ${this.round.lastDiscard.suit}-${this.round.lastDiscard.rank}，获得 ${payment} 分`
      this.result = { winnerId: player.id, score: payment, yaku: winningAnalysis.yaku, type: 'ron' }
    },

    analyzeCurrentHand() {
      const player = this.currentPlayer
      if (!player) return
      const result = analyzeHand(player.hand)
      this.round.recentAction = `番数 ${result.han}，符数 ${result.fu}，役种 ${result.yaku.join('、') || '无'}`
      this.round.analysis = {
        isWinning: result.isWinning,
        han: result.han,
        fu: result.fu,
        score: result.score,
        yaku: result.yaku
      }
    }
  }
})