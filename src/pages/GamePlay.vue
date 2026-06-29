<template>
  <view class="game-play-page">
    <view class="game-container" ref="gameContainer">
      <canvas 
        ref="gameCanvas"
        class="game-canvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="handleClick"
      ></canvas>
      
      <!-- UI 覆盖层 -->
      <view class="ui-overlay">
        <!-- 顶部信息栏 -->
        <view class="top-bar">
          <view class="round-info">
            <text class="round-text">{{ roundWindLabel }}{{ store.round.honba + 1 }}局</text>
            <text class="honba-text">{{ store.round.honba }}本</text>
          </view>
          <view class="center-info">
            <text class="phase-text">{{ phaseLabel }}</text>
            <text class="wall-count">牌墙 {{ store.round.wall.length }}</text>
          </view>
          <view class="action-info">
            <text class="last-action">{{ store.round.recentAction || '等待开始' }}</text>
          </view>
        </view>

        <!-- 对手信息 -->
        <view class="opponents-bar">
          <view 
            class="opponent-item" 
            v-for="player in opponents" 
            :key="player.id"
            :class="{ active: player.id === store.round.currentTurn }"
          >
            <view class="opponent-avatar">
              <text>{{ player.name[0] }}</text>
            </view>
            <view class="opponent-info">
              <text class="opponent-name">{{ player.name }}</text>
              <text class="opponent-score">{{ player.score }}</text>
              <text class="opponent-wind">{{ player.wind }}家</text>
            </view>
            <view v-if="player.isRiichi" class="riichi-badge">立</view>
          </view>
        </view>

        <!-- 中央操作区 -->
        <view class="center-area">
          <view class="discard-area" v-if="store.round.lastDiscard">
            <text class="discard-label">最新弃牌</text>
            <view class="discard-tile">{{ formatTile(store.round.lastDiscard) }}</view>
          </view>
        </view>

        <!-- 底部手牌区 -->
        <view class="hand-area" v-if="currentPlayer">
          <view class="hand-header">
            <text class="player-name">{{ currentPlayer.name }}</text>
            <text class="player-score">{{ currentPlayer.score }}</text>
            <text class="player-wind">{{ currentPlayer.wind }}家</text>
            <view v-if="currentPlayer.isRiichi" class="riichi-badge">立直</view>
          </view>
          
          <view class="hand-tiles">
            <view 
              class="tile-item" 
              v-for="(tile, index) in sortedHand" 
              :key="tileKey(tile, index)"
              :class="{ selected: selectedTile === tile, new: isNewTile(tile) }"
              @click="selectTile(tile)"
            >
              <text class="tile-text">{{ formatTile(tile) }}</text>
            </view>
          </view>

          <view class="discard-river">
            <view class="river-row" v-for="(row, rIdx) in groupedDiscards" :key="rIdx">
              <view 
                class="river-tile" 
                v-for="(tile, idx) in row" 
                :key="`${tile.suit}-${tile.rank}-discard-${rIdx}-${idx}`"
              >
                <text>{{ formatTile(tile) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作按钮区 -->
        <view class="action-buttons">
          <button class="action-btn draw" @click="draw" :disabled="!canDraw">
            <text>摸牌</text>
          </button>
          <button class="action-btn discard" @click="discardSelected" :disabled="!selectedTile">
            <text>弃牌</text>
          </button>
          <button class="action-btn tsumo" @click="declareTsumo" :disabled="!canTsumo">
            <text>自摸</text>
          </button>
          <button class="action-btn ron" @click="declareRon" :disabled="!canRon">
            <text>荣牌</text>
          </button>
          <button class="action-btn riichi" @click="declareRiichi" :disabled="!canRiichi">
            <text>立直</text>
          </button>
        </view>

        <!-- 鸣牌按钮区 -->
        <view class="meld-buttons" v-if="store.round.lastDiscard">
          <button class="meld-btn" @click="claimPon" :disabled="!canClaimPon">
            <text>碰</text>
          </button>
          <button class="meld-btn" @click="claimKan" :disabled="!canClaimKan">
            <text>杠</text>
          </button>
          <view class="chi-options" v-if="chiOptions.length">
            <button 
              class="chi-btn" 
              v-for="(pair, index) in chiOptions" 
              :key="index"
              @click="claimChi(pair[0], pair[1])"
            >
              <text>吃 {{ formatTile(pair[0]) }} {{ formatTile(pair[1]) }}</text>
            </button>
          </view>
        </view>

        <!-- 结算面板 -->
        <view class="result-panel" v-if="store.round.phase === 'scoring' && store.result">
          <view class="result-content">
            <text class="result-title">结算结果</text>
            <text class="result-winner">赢家：{{ winnerName }}</text>
            <text class="result-type">方式：{{ winTypeLabel }}</text>
            <text class="result-score">得分：{{ store.result.score }}</text>
            <text class="result-yaku">役种：{{ store.result.yaku.join('、') || '无' }}</text>
            <button class="next-round-btn" @click="startRound">
              <text>下一局</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../store/game'
import { useFullscreen } from '../composables/useFullscreen'
import { useAdaptiveGame } from '../composables/useAdaptiveGame'
import { analyzeHand } from '../core/mahjong/evaluator'
import { sortHandSmart } from '../utils/sortHand'
import type { Tile } from '../types/mahjong'

const store = useGameStore()
const { enterFullscreen } = useFullscreen()
const { viewport, adaptive } = useAdaptiveGame()

const gameCanvas = ref<HTMLCanvasElement | null>(null)
const gameContainer = ref<HTMLElement | null>(null)
const selectedTile = ref<Tile | null>(null)

const currentPlayer = computed(() => store.currentPlayer)
const opponents = computed(() => store.players.filter(p => p.id !== currentPlayer.value?.id))

function tileKey(tile: Tile, index = 0) {
  return `${tile.suit}-${tile.rank}-${index}`
}

function formatTile(tile: Tile) {
  if (tile.suit === 'honor') {
    return ['東', '南', '西', '北', '白', '發', '中'][tile.rank - 1] ?? '字'
  }
  const suits: Record<string, string> = { man: '萬', pin: '筒', sou: '索' }
  return `${tile.rank}${suits[tile.suit]}`
}

function isNewTile(tile: Tile): boolean {
  if (!store.round.lastDraw) return false
  return tile.suit === store.round.lastDraw.suit && tile.rank === store.round.lastDraw.rank
}

const sortedHand = computed(() => sortHandSmart(currentPlayer.value?.hand ?? []))

const groupedDiscards = computed(() => {
  const disc = currentPlayer.value?.discards ?? []
  const perRow = 6
  const rows: Tile[][] = []
  for (let i = 0; i < disc.length; i += perRow) rows.push(disc.slice(i, i + perRow))
  return rows
})

const phaseLabel = computed(() => {
  if (store.round.phase === 'waiting') return '等待中'
  if (store.round.phase === 'playing') return '进行中'
  if (store.round.phase === 'scoring') return '结算中'
  return '未知'
})

const roundWindLabel = computed(() => {
  const windMap: Record<string, string> = { east: '东', south: '南', west: '西', north: '北' }
  return windMap[store.round.roundWind] ?? '东'
})

const canDraw = computed(() => store.round.phase === 'playing')
const canTsumo = computed(() => {
  return store.round.phase === 'playing' && store.currentPlayer?.hand.length === 14 && store.round.analysis?.isWinning
})
const canRon = computed(() => {
  return store.round.phase === 'playing' && store.round.lastDiscard != null && store.currentPlayer?.hand.length === 13
})
const canRiichi = computed(() => {
  return store.round.phase === 'playing' && !currentPlayer.value?.isRiichi && store.round.analysis?.isTenpai
})

const canClaimPon = computed(() => store.canClaimPon)
const canClaimKan = computed(() => store.canClaimKan)
const chiOptions = computed(() => store.chiOptions)

const winnerName = computed(() => {
  return store.players.find(p => p.id === store.result?.winnerId)?.name ?? '未知'
})

const winTypeLabel = computed(() => {
  if (store.result?.type === 'tsumo') return '自摸'
  if (store.result?.type === 'ron') return '荣牌'
  if (store.result?.type === 'draw') return '流局'
  return '未知'
})

function selectTile(tile: Tile) {
  if (selectedTile.value === tile) {
    selectedTile.value = null
  } else {
    selectedTile.value = tile
  }
}

function discardSelected() {
  if (!selectedTile.value) return
  store.discardTile(selectedTile.value)
  store.analyzeCurrentHand()
  selectedTile.value = null
}

function draw() {
  store.drawTile()
}

function claimPon() {
  store.claimPon()
}

function claimKan() {
  store.claimKan()
}

function claimChi(companionA: Tile, companionB: Tile) {
  store.claimChi(companionA, companionB)
}

function declareTsumo() {
  store.declareTsumo()
}

function declareRon() {
  store.declareRon()
}

function declareRiichi() {
  store.declareRiichi()
}

function startRound() {
  store.startRound()
}

function handleTouchStart(e: TouchEvent) {
  // 处理触摸开始
}

function handleTouchMove(e: TouchEvent) {
  // 处理触摸移动
}

function handleTouchEnd(e: TouchEvent) {
  // 处理触摸结束
}

function handleClick(e: MouseEvent) {
  // 处理点击
}

onMounted(() => {
  enterFullscreen()
  if (!store.round.phase || store.round.phase === 'waiting') {
    store.startRound()
  }
})
</script>

<style lang="scss" scoped>
.game-play-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #1a3d16 0%, #0d240b 100%);
}

.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.ui-overlay > * {
  pointer-events: auto;
}

/* 顶部信息栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.3);
}

.round-info {
  display: flex;
  flex-direction: column;
}

.round-text {
  font-size: 28rpx;
  color: #ffd700;
  font-weight: 700;
}

.honba-text {
  font-size: 22rpx;
  color: rgba(255, 215, 0, 0.7);
}

.center-info {
  text-align: center;
}

.phase-text {
  font-size: 24rpx;
  color: #fff;
}

.wall-count {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}

.action-info {
  text-align: right;
}

.last-action {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 对手信息 */
.opponents-bar {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 16rpx 30rpx;
}

.opponent-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
  border: 2rpx solid transparent;
}

.opponent-item.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
}

.opponent-avatar {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(180deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opponent-avatar text {
  font-size: 24rpx;
  color: #5a4a00;
  font-weight: 700;
}

.opponent-info {
  display: flex;
  flex-direction: column;
}

.opponent-name {
  font-size: 22rpx;
  color: #fff;
}

.opponent-score {
  font-size: 20rpx;
  color: #ffd700;
}

.opponent-wind {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.6);
}

.riichi-badge {
  width: 36rpx;
  height: 36rpx;
  background: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.riichi-badge text {
  font-size: 18rpx;
  color: #fff;
  font-weight: 700;
}

/* 中央区域 */
.center-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.discard-area {
  text-align: center;
}

.discard-label {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12rpx;
}

.discard-tile {
  width: 100rpx;
  height: 140rpx;
  background: linear-gradient(180deg, #fffdf7 0%, #f7e8d8 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #3c2c18;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
}

/* 手牌区域 */
.hand-area {
  background: rgba(0, 0, 0, 0.4);
  padding: 20rpx 30rpx;
}

.hand-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.player-name {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

.player-score {
  font-size: 24rpx;
  color: #ffd700;
}

.player-wind {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}

.hand-tiles {
  display: flex;
  gap: 8rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
}

.tile-item {
  width: 72rpx;
  height: 100rpx;
  background: linear-gradient(180deg, #fffdf7 0%, #f7e8d8 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.tile-item.selected {
  border-color: #ffd700;
  transform: translateY(-8rpx);
  box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.4);
}

.tile-item.new {
  border-color: #52c41a;
}

.tile-text {
  font-size: 32rpx;
  color: #3c2c18;
  font-weight: 600;
}

/* 弃牌河 */
.discard-river {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.river-row {
  display: flex;
  gap: 6rpx;
}

.river-tile {
  width: 48rpx;
  height: 68rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.river-tile text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 16rpx 30rpx;
  background: rgba(0, 0, 0, 0.3);
}

.action-btn {
  min-width: 120rpx;
  height: 72rpx;
  border-radius: 16rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn text {
  font-size: 26rpx;
  font-weight: 600;
}

.action-btn.draw {
  background: linear-gradient(135deg, #4a8f3c 0%, #2d5a27 100%);
}

.action-btn.discard {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
}

.action-btn.discard text {
  color: #5a4a00;
}

.action-btn.tsumo {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.action-btn.ron {
  background: linear-gradient(135deg, #ff4757 0%, #c44569 100%);
}

.action-btn.riichi {
  background: linear-gradient(135deg, #a55eea 0%, #8854d0 100%);
}

.action-btn:disabled {
  opacity: 0.4;
}

/* 鸣牌按钮 */
.meld-buttons {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  padding: 12rpx 30rpx;
  background: rgba(0, 0, 0, 0.2);
}

.meld-btn {
  min-width: 100rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #4a8f3c 0%, #2d5a27 100%);
  border-radius: 14rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meld-btn text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.meld-btn:disabled {
  opacity: 0.4;
}

.chi-options {
  display: flex;
  gap: 8rpx;
}

.chi-btn {
  padding: 0 20rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #4a8f3c 0%, #2d5a27 100%);
  border-radius: 14rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chi-btn text {
  font-size: 20rpx;
  color: #fff;
}

/* 结算面板 */
.result-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-content {
  background: linear-gradient(180deg, #fff9e8 0%, #f5dc9e 100%);
  border-radius: 32rpx;
  padding: 60rpx;
  text-align: center;
  min-width: 500rpx;
}

.result-title {
  display: block;
  font-size: 40rpx;
  color: #3c2c18;
  font-weight: 700;
  margin-bottom: 30rpx;
}

.result-winner,
.result-type,
.result-score,
.result-yaku {
  display: block;
  font-size: 28rpx;
  color: #5a4a00;
  margin-bottom: 16rpx;
}

.result-score {
  font-size: 36rpx;
  color: #ff6b6b;
  font-weight: 700;
}

.next-round-btn {
  margin-top: 30rpx;
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 24rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-round-btn text {
  font-size: 32rpx;
  font-weight: 700;
  color: #5a4a00;
}
</style>