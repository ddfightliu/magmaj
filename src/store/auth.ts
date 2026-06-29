import { defineStore } from 'pinia'

interface AuthState {
  username: string | null
  balance: number
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    username: null,
    balance: 0
  }),
  actions: {
    login(payload: { username: string }) {
      this.username = payload.username
      this.balance = 1000
    },
    recharge(amount: number) {
      this.balance += amount
    }
  }
})
