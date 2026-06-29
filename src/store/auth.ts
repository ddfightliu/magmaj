/**
 * 玩家认证状态管理 Store
 * 负责管理玩家登录状态、用户名、星核余额等基本信息
 * 这是一个简化版的认证系统，可后续扩展为对接真实后端服务
 */
import { defineStore } from 'pinia'

/**
 * 认证状态接口
 * username: 玩家昵称（未登录时为 null）
 * balance: 玩家星核余额（游戏内货币）
 */
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
    /**
     * 玩家登录
     * 设置玩家昵称并赠送初始星核（1000点）
     * 可后续扩展为真实登录验证
     */
    login(payload: { username: string }) {
      this.username = payload.username
      this.balance = 1000
    },

    /**
     * 玩家充值
     * 增加玩家的星核余额
     * 可后续扩展为对接真实支付系统
     */
    recharge(amount: number) {
      this.balance += amount
    }
  }
})