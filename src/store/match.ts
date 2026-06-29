import { defineStore } from 'pinia'

interface MatchState {
  status: 'idle' | 'matching' | 'in-room'
  roomId: string | null
  players: string[]
  socket: WebSocket | null
}

export const useMatchStore = defineStore('match', {
  state: (): MatchState => ({
    status: 'idle',
    roomId: null,
    players: [],
    socket: null
  }),
  actions: {
    connect() {
      if (this.socket) return
      const ws = new WebSocket('ws://localhost:3000')
      ws.addEventListener('open', () => {
        this.status = 'idle'
      })
      ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'room.update') {
          this.roomId = message.roomId
          this.players = message.players
          this.status = 'in-room'
        }
      })
      ws.addEventListener('close', () => {
        this.status = 'idle'
        this.socket = null
      })
      this.socket = ws
    },
    startMatching() {
      if (!this.socket) this.connect()
      this.status = 'matching'
      this.socket?.send(JSON.stringify({ type: 'match.start' }))
    },
    stopMatching() {
      this.socket?.send(JSON.stringify({ type: 'match.stop' }))
      this.status = 'idle'
    }
  }
})
