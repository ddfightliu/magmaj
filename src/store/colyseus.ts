import { defineStore } from 'pinia'
import { Client, Room } from 'colyseus.js'

interface ColyseusState {
  client: Client | null
  room: Room | null
  status: 'disconnected' | 'connecting' | 'connected'
}

export const useColyseusStore = defineStore('colyseus', {
  state: (): ColyseusState => ({
    client: null,
    room: null,
    status: 'disconnected'
  }),
  actions: {
    init(url = 'ws://localhost:2567') {
      if (!this.client) {
        this.client = new Client(url)
      }
    },
    async joinRoom(roomName: string, options?: Record<string, unknown>) {
      if (!this.client) this.init()
      this.status = 'connecting'
      try {
        this.room = await this.client.joinOrCreate(roomName, options)
        this.status = 'connected'
      } catch (error) {
        this.status = 'disconnected'
        this.room = null
        throw error
      }
    },
    leaveRoom() {
      this.room?.leave()
      this.room = null
      this.status = 'disconnected'
    }
  }
})
