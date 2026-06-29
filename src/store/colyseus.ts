import { defineStore } from 'pinia'
import { Client, Room } from 'colyseus.js'
import type { Tile } from '../types/mahjong'

interface PlayerInfo {
  id: string
  name: string
  ready: boolean
  score: number
  wind: string
}

interface GameMessage {
  type: string
  payload: unknown
}

interface ColyseusState {
  client: Client | null
  room: Room | null
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  roomId: string | null
  players: PlayerInfo[]
  messages: GameMessage[]
  currentTurn: string | null
  gameState: 'waiting' | 'playing' | 'scoring' | null
  lastAction: string
  error: string | null
}

export const useColyseusStore = defineStore('colyseus', {
  state: (): ColyseusState => ({
    client: null,
    room: null,
    status: 'disconnected',
    roomId: null,
    players: [],
    messages: [],
    currentTurn: null,
    gameState: null,
    lastAction: '',
    error: null
  }),

  getters: {
    isConnected: (state) => state.status === 'connected',
    isMyTurn: (state) => {
      const myId = state.room?.sessionId
      return state.currentTurn === myId
    },
    playerCount: (state) => state.players.length,
    allReady: (state) => state.players.every(p => p.ready)
  },

  actions: {
    init(url = 'ws://localhost:2567') {
      if (!this.client) {
        this.client = new Client(url)
      }
    },

    async joinRoom(roomName: string, options?: Record<string, unknown>) {
      if (!this.client) this.init()
      this.status = 'connecting'
      this.error = null
      try {
        this.room = await this.client.joinOrCreate(roomName, options)
        this.status = 'connected'
        this.roomId = this.room.id
        this.setupRoomListeners()
      } catch (error: any) {
        this.status = 'error'
        this.error = error.message || '连接失败'
        this.room = null
        throw error
      }
    },

    setupRoomListeners() {
      if (!this.room) return

      this.room.onStateChange((state) => {
        this.gameState = state.phase
        this.currentTurn = state.currentTurn
        this.players = Array.from(state.players?.values() || [])
      })

      this.room.onMessage('player.joined', (message) => {
        this.messages.push({ type: 'player.joined', payload: message })
        this.lastAction = `${message.name} 加入房间`
      })

      this.room.onMessage('player.left', (message) => {
        this.messages.push({ type: 'player.left', payload: message })
        this.lastAction = `${message.name} 离开房间`
      })

      this.room.onMessage('player.ready', (message) => {
        const player = this.players.find(p => p.id === message.id)
        if (player) player.ready = true
        this.lastAction = `${message.name} 已准备`
      })

      this.room.onMessage('game.start', (message) => {
        this.gameState = 'playing'
        this.lastAction = '游戏开始！'
      })

      this.room.onMessage('game.turn', (message) => {
        this.currentTurn = message.playerId
        this.lastAction = `轮到 ${message.playerName}`
      })

      this.room.onMessage('tile.drawn', (message) => {
        this.lastAction = `${message.playerName} 摸牌`
      })

      this.room.onMessage('tile.discarded', (message) => {
        this.lastAction = `${message.playerName} 弃牌 ${message.tile}`
      })

      this.room.onMessage('meld.called', (message) => {
        const meldTypes: Record<string, string> = { chi: '吃', pon: '碰', kan: '杠' }
        this.lastAction = `${message.playerName} ${meldTypes[message.meldType]} ${message.tile}`
      })

      this.room.onMessage('riichi.declared', (message) => {
        this.lastAction = `${message.playerName} 立直！`
      })

      this.room.onMessage('win.declared', (message) => {
        this.lastAction = `${message.playerName} ${message.winType}！获得 ${message.score} 分`
        this.gameState = 'scoring'
      })

      this.room.onMessage('game.end', (message) => {
        this.gameState = 'waiting'
        this.lastAction = '游戏结束'
      })

      this.room.onMessage('chat.message', (message) => {
        this.messages.push({ type: 'chat', payload: message })
      })

      this.room.onError((code, message) => {
        this.error = `错误 ${code}: ${message}`
        this.status = 'error'
      })

      this.room.onLeave((code) => {
        this.status = 'disconnected'
        this.room = null
        this.roomId = null
        this.players = []
      })
    },

    async ready() {
      if (!this.room) return
      await this.room.send('ready')
    },

    async drawTile() {
      if (!this.room || !this.isMyTurn) return
      await this.room.send('draw')
    },

    async discardTile(tile: Tile) {
      if (!this.room || !this.isMyTurn) return
      await this.room.send('discard', tile)
    },

    async callMeld(meldType: 'chi' | 'pon' | 'kan', tile: Tile, companions?: Tile[]) {
      if (!this.room) return
      await this.room.send('meld', { meldType, tile, companions })
    },

    async declareRiichi() {
      if (!this.room || !this.isMyTurn) return
      await this.room.send('riichi')
    },

    async declareWin(winType: 'tsumo' | 'ron') {
      if (!this.room) return
      await this.room.send('win', { winType })
    },

    async sendChat(message: string) {
      if (!this.room) return
      await this.room.send('chat', { message })
    },

    leaveRoom() {
      this.room?.leave()
      this.room = null
      this.status = 'disconnected'
      this.roomId = null
      this.players = []
      this.messages = []
      this.currentTurn = null
      this.gameState = null
    }
  }
})