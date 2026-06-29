<template>
  <section class="page-shell match-room-page">
    <div class="match-content">
      <div class="match-panel">
        <h1>匹配房间</h1>
        <p>当前状态：{{ statusLabel }}</p>
        <button class="primary-button" @click="connectRoom" :disabled="roomStatus !== 'disconnected'">
          连接服务
        </button>
        <button class="secondary-button" @click="startMatch" :disabled="roomStatus !== 'connected' || isMatching">
          开始匹配
        </button>
        <button class="secondary-button" @click="stopMatch" :disabled="roomStatus !== 'matching'">
          取消匹配
        </button>
      </div>

      <div class="match-status-card">
        <p>连接：{{ statusLabel }}</p>
        <p>房间 ID：{{ roomId || '未进入' }}</p>
        <p>玩家数：{{ players.length }}</p>
        <p>匹配状态：{{ matchLabel }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useMatchStore } from '../store/match'

export default defineComponent({
  setup() {
    const match = useMatchStore()

    const roomStatus = computed(() => match.status)
    const statusLabel = computed(() => {
      switch (match.status) {
        case 'idle':
          return match.socket ? '已连接' : '未连接'
        case 'matching':
          return '匹配中'
        case 'in-room':
          return '已入场'
        default:
          return '未知'
      }
    })

    const isMatching = computed(() => match.status === 'matching')
    const matchLabel = computed(() => (match.roomId ? `房间 ${match.roomId}` : '未匹配'))
    const roomId = computed(() => match.roomId)
    const players = computed(() => match.players)

    function connectRoom() {
      match.connect()
    }

    function startMatch() {
      match.startMatching()
    }

    function stopMatch() {
      match.stopMatching()
    }

    return { statusLabel, roomStatus, isMatching, matchLabel, roomId, players, connectRoom, startMatch, stopMatch }
  }
})
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 24px;
}
.match-content {
  display: grid;
  gap: 20px;
  max-width: 980px;
  margin: 0 auto;
}
.match-panel,
.match-status-card {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(92, 60, 22, 0.11);
}
.match-panel {
  display: grid;
  gap: 12px;
}
.primary-button,
.secondary-button {
  width: 100%;
}
</style>
