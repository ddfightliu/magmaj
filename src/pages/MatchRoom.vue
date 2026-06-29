<template>
  <view class="match-room">
    <view class="page-bg"></view>
    
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">匹配房间</text>
      <view class="header-right"></view>
    </view>

    <view class="room-status">
      <view class="status-card">
        <view class="status-icon" :class="statusClass">
          <text>{{ statusIcon }}</text>
        </view>
        <text class="status-text">{{ statusText }}</text>
        <text class="status-desc">{{ statusDesc }}</text>
      </view>
    </view>

    <view class="players-section" v-if="colyseus.players.length > 0">
      <text class="section-title">房间玩家 ({{ colyseus.playerCount }}/4)</text>
      <view class="players-grid">
        <view 
          class="player-card" 
          :class="{ 'is-me': player.id === myId, ready: player.ready }"
          v-for="player in colyseus.players" 
          :key="player.id"
        >
          <view class="player-avatar">
            <text class="avatar-icon">🎲</text>
          </view>
          <text class="player-name">{{ player.name }}</text>
          <text class="player-wind">{{ player.wind }}家</text>
          <view class="player-status">
            <text v-if="player.ready" class="ready-badge">已准备</text>
            <text v-else class="waiting-badge">等待中</text>
          </view>
        </view>
        
        <view class="player-card empty" v-for="n in emptySlots" :key="`empty-${n}`">
          <view class="player-avatar empty-avatar">
            <text class="avatar-icon">?</text>
          </view>
          <text class="player-name">等待加入</text>
        </view>
      </view>
    </view>

    <view class="action-section">
      <button 
        class="action-btn primary" 
        @click="joinRoom"
        v-if="!colyseus.isConnected"
      >
        <text>加入房间</text>
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="ready"
        v-if="colyseus.isConnected && !isReady"
      >
        <text>准备</text>
      </button>
      
      <button 
        class="action-btn primary" 
        @click="startGame"
        v-if="colyseus.isConnected && colyseus.allReady"
      >
        <text>开始游戏</text>
      </button>
      
      <button 
        class="action-btn danger" 
        @click="leaveRoom"
        v-if="colyseus.isConnected"
      >
        <text>离开房间</text>
      </button>
    </view>

    <view class="chat-section" v-if="colyseus.isConnected">
      <view class="chat-header">
        <text class="chat-title">房间聊天</text>
      </view>
      <scroll-view class="chat-messages" scroll-y>
        <view 
          class="chat-message" 
          v-for="(msg, index) in colyseus.messages" 
          :key="index"
        >
          <text class="msg-type">[{{ msg.type }}]</text>
          <text class="msg-content">{{ formatMessage(msg) }}</text>
        </view>
      </scroll-view>
      <view class="chat-input">
        <input 
          class="chat-field" 
          v-model="chatMessage" 
          placeholder="输入消息..."
          @confirm="sendChat"
        />
        <button class="send-btn" @click="sendChat">发送</button>
      </view>
    </view>

    <view class="last-action" v-if="colyseus.lastAction">
      <text class="action-label">最近操作</text>
      <text class="action-content">{{ colyseus.lastAction }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useColyseusStore } from '../store/colyseus'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const colyseus = useColyseusStore()
const auth = useAuthStore()
const router = useRouter()

const chatMessage = ref('')
const roomName = ref('mahjong_room')

const myId = computed(() => colyseus.room?.sessionId)
const isReady = computed(() => {
  const me = colyseus.players.find(p => p.id === myId.value)
  return me?.ready || false
})

const emptySlots = computed(() => {
  return Math.max(0, 4 - colyseus.playerCount)
})

const statusClass = computed(() => {
  switch (colyseus.status) {
    case 'connected': return 'connected'
    case 'connecting': return 'connecting'
    case 'error': return 'error'
    default: return 'disconnected'
  }
})

const statusIcon = computed(() => {
  switch (colyseus.status) {
    case 'connected': return '✓'
    case 'connecting': return '⟳'
    case 'error': return '✗'
    default: return '○'
  }
})

const statusText = computed(() => {
  switch (colyseus.status) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'error': return '连接失败'
    default: return '未连接'
  }
})

const statusDesc = computed(() => {
  if (colyseus.error) return colyseus.error
  if (colyseus.isConnected) return `房间ID: ${colyseus.roomId}`
  return '点击加入房间开始匹配'
})

async function joinRoom() {
  try {
    await colyseus.joinRoom(roomName.value, {
      name: auth.username || '玩家' + Math.floor(Math.random() * 1000)
    })
  } catch (error: any) {
    uni.showToast({ title: error.message || '加入房间失败', icon: 'none' })
  }
}

async function ready() {
  await colyseus.ready()
}

function startGame() {
  uni.showToast({ title: '游戏开始！', icon: 'success' })
  router.push('/game')
}

function leaveRoom() {
  colyseus.leaveRoom()
}

function sendChat() {
  if (!chatMessage.value.trim()) return
  colyseus.sendChat(chatMessage.value)
  chatMessage.value = ''
}

function formatMessage(msg: { type: string; payload: any }) {
  if (msg.type === 'chat') {
    return `${msg.payload.name}: ${msg.payload.message}`
  }
  return JSON.stringify(msg.payload)
}

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.match-room {
  min-height: 100vh;
  position: relative;
  padding: 0 30rpx 60rpx;
  box-sizing: border-box;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #1a3d16 0%, #0d240b 100%);
}

.header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx 0 30rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #fff;
}

.header-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: 700;
}

.header-right {
  width: 72rpx;
}

.room-status {
  position: relative;
  z-index: 1;
  margin-bottom: 40rpx;
}

.status-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 28rpx;
  padding: 40rpx;
  text-align: center;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.status-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
  font-size: 48rpx;
}

.status-icon.connected {
  background: rgba(82, 196, 26, 0.2);
}

.status-icon.connecting {
  background: rgba(255, 215, 0, 0.2);
  animation: pulse 1.5s infinite;
}

.status-icon.error {
  background: rgba(255, 77, 79, 0.2);
}

.status-icon.disconnected {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.status-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12rpx;
}

.players-section {
  position: relative;
  z-index: 1;
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.player-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 28rpx;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.player-card.is-me {
  border-color: #ffd700;
  background: #fffef5;
}

.player-card.ready {
  border-color: #52c41a;
  background: #f6ffed;
}

.player-card.empty {
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx dashed rgba(255, 255, 255, 0.3);
}

.player-avatar {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(180deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16rpx;
}

.player-avatar.empty-avatar {
  background: rgba(255, 255, 255, 0.1);
}

.avatar-icon {
  font-size: 48rpx;
}

.player-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.player-wind {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.player-status {
  margin-top: 12rpx;
}

.ready-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #52c41a;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #fff;
}

.waiting-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #faad14;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #fff;
}

.action-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.action-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 24rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4a8f3c 0%, #2d5a27 100%);
  box-shadow: 0 16rpx 32rpx rgba(74, 143, 60, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  box-shadow: 0 16rpx 32rpx rgba(255, 215, 0, 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 16rpx 32rpx rgba(255, 107, 107, 0.4);
}

.action-btn text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.action-btn.secondary text {
  color: #5a4a00;
}

.chat-section {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
}

.chat-header {
  padding: 20rpx 28rpx;
  border-bottom: 1rpx solid #eee;
}

.chat-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.chat-messages {
  height: 300rpx;
  padding: 20rpx 28rpx;
}

.chat-message {
  margin-bottom: 12rpx;
  font-size: 24rpx;
}

.msg-type {
  color: #999;
  margin-right: 12rpx;
}

.msg-content {
  color: #333;
}

.chat-input {
  display: flex;
  padding: 20rpx 28rpx;
  border-top: 1rpx solid #eee;
  gap: 16rpx;
}

.chat-field {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #4a8f3c 0%, #2d5a27 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #fff;
  border: none;
}

.last-action {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
}

.action-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8rpx;
}

.action-content {
  font-size: 28rpx;
  color: #fff;
}
</style>