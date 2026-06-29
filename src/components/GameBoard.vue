<template>
  <section class="game-board">
    <div class="header">
      <div>
        <h2>对局面板</h2>
        <p class="subtitle">当前仅支持2人简化对局，已实现基础摸打与鸣牌交互。</p>
      </div>
      <button class="primary-button" @click="startRound">开始新局</button>
    </div>

    <div class="round-info">
      <div class="round-chip">
        <span>局数</span>
        <strong>{{ roundWindLabel }}{{ store.round.honba + 1 }} 局</strong>
      </div>
      <div class="round-chip">
        <span>连庄</span>
        <strong>{{ store.round.honba }} 本</strong>
      </div>
      <div class="round-chip">
        <span>当前回合</span>
        <strong>{{ currentPlayer?.name || '等待玩家' }}</strong>
      </div>
    </div>

    <div class="table-shell">
      <div class="table-layout">
        <div class="seat seat-top">
          <div v-if="seatPositions.top" class="seat-card">
            <p>{{ seatPositions.top.name }}</p>
            <strong>{{ seatPositions.top.score }}</strong>
            <span>{{ seatPositions.top.wind }} 家</span>
            <p class="seat-detail">暗牌 {{ seatPositions.top.hand.length }} 张</p>
            <p class="seat-detail">弃牌 {{ seatPositions.top.discards.length }} 张</p>
            <span v-if="seatPositions.top.isRiichi" class="riichi-tag">立直</span>
            <span v-if="seatAnalyses.top?.possibleWinningTiles?.length" class="tenpai-tag">听 ×{{ seatAnalyses.top.possibleWinningTiles.length }}</span>
          </div>
          <div v-else class="seat-empty">等待玩家</div>
        </div>

        <div class="seat seat-left">
          <div v-if="seatPositions.left" class="seat-card">
            <p>{{ seatPositions.left.name }}</p>
            <strong>{{ seatPositions.left.score }}</strong>
            <span>{{ seatPositions.left.wind }} 家</span>
            <p class="seat-detail">暗牌 {{ seatPositions.left.hand.length }} 张</p>
            <p class="seat-detail">弃牌 {{ seatPositions.left.discards.length }} 张</p>
            <span v-if="seatPositions.left.isRiichi" class="riichi-tag">立直</span>
            <span v-if="seatAnalyses.left?.possibleWinningTiles?.length" class="tenpai-tag">听 ×{{ seatAnalyses.left.possibleWinningTiles.length }}</span>
          </div>
          <div v-else class="seat-empty">等待玩家</div>
        </div>

        <div class="table-center">
          <div class="table-surface">
            <div class="table-label">麻将桌</div>
            <div class="table-state">
              <span>阶段：{{ phaseLabel }}</span>
              <span>庄家：{{ dealerName }}</span>
            </div>
            <div class="table-cover">
              <div class="table-stat">
                <p>牌墙</p>
                <strong>{{ store.round.wall.length }}</strong>
              </div>
              <div class="table-stat">
                <p>死牌</p>
                <strong>{{ store.round.deadWall.length }}</strong>
              </div>
            </div>
            <div class="table-discard">
              <p>最新弃牌</p>
              <div class="discard-tile" v-if="store.round.lastDiscard">{{ formatTile(store.round.lastDiscard) }}</div>
              <p v-else class="discard-empty">暂无弃牌</p>
            </div>
            <div class="table-action">
              <p>最近操作</p>
              <span>{{ store.round.recentAction || '尚未开始' }}</span>
            </div>
        </div>

        <div class="seat seat-right">
          <div v-if="seatPositions.right" class="seat-card">
            <p>{{ seatPositions.right.name }}</p>
            <strong>{{ seatPositions.right.score }}</strong>
            <span>{{ seatPositions.right.wind }} 家</span>
            <p class="seat-detail">暗牌 {{ seatPositions.right.hand.length }} 张</p>
            <p class="seat-detail">弃牌 {{ seatPositions.right.discards.length }} 张</p>
            <span v-if="seatPositions.right.isRiichi" class="riichi-tag">立直</span>
            <span v-if="seatAnalyses.right?.possibleWinningTiles?.length" class="tenpai-tag">听 ×{{ seatAnalyses.right.possibleWinningTiles.length }}</span>
          </div>
          <div v-else class="seat-empty">等待玩家</div>
        </div>

        <div class="seat seat-bottom">
          <div v-if="currentPlayer" class="seat-card seat-bottom-self">
            <p>{{ currentPlayer.name }}</p>
            <strong>{{ currentPlayer.score }}</strong>
            <span>{{ currentPlayer.wind }} 家</span>
            <p class="seat-detail">手牌 {{ currentPlayer.hand.length }} 张</p>
            <p class="seat-detail">弃牌 {{ currentPlayer.discards.length }} 张</p>
            <span v-if="currentPlayer.isRiichi" class="riichi-tag">立直</span>
            <span v-if="seatAnalyses.self?.possibleWinningTiles?.length" class="tenpai-tag">听 ×{{ seatAnalyses.self.possibleWinningTiles.length }}</span>
          </div>
          <div v-else class="seat-empty">等待玩家</div>
        </div>
      </div>
    </div>

    <div class="board-grid">
      <div class="hand-block" v-if="currentPlayer">
        <div class="hand-header">
          <div>
            <p class="hand-title">手牌</p>
            <strong>{{ currentPlayer.name }}</strong>
          </div>
          <p class="hand-meta">{{ currentPlayer.hand.length }} 张 · {{ currentPlayer.discards.length }} 弃牌</p>
        </div>

        <div class="tiles">
          <button
            v-for="(tile, index) in sortedHand"
            :key="tileKey(tile, index)"
            class="tile"
            @click="discard(tile)">
            {{ formatTile(tile) }}
          </button>
          </div>

          <div class="discard-river">
            <p class="river-title">弃牌河</p>
            <div class="river-tiles">
              <div v-for="(row, rIdx) in groupedDiscards" :key="rIdx" class="river-row">
                <span v-for="(tile, idx) in row" :key="`${tile.suit}-${tile.rank}-discard-${rIdx}-${idx}`" class="river-tile">
                  {{ formatTile(tile) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="control-panel">
        <div class="control-group">
          <p class="group-title">核心操作</p>
          <button class="primary-button" @click="draw" :disabled="store.round.phase !== 'playing'">摸牌</button>
          <button class="secondary-button" @click="declareTsumo" :disabled="!canTsumo">自摸胡</button>
          <button class="secondary-button" @click="declareRon" :disabled="!canRon">荣牌</button>
          <button class="secondary-button" @click="startRound" v-if="store.round.phase === 'scoring'">下一局</button>
        </div>

        <div class="control-group" v-if="store.round.lastDiscard">
          <p class="group-title">鸣牌机会</p>
          <p class="discard-note">弃牌：{{ formatTile(store.round.lastDiscard) }}</p>
          <div class="claim-actions">
            <button class="secondary-button" @click="claimPon" :disabled="!canClaimPon">碰</button>
            <button class="secondary-button" @click="claimKan" :disabled="!canClaimKan">杠</button>
          </div>
          <div class="chi-list" v-if="chiOptions.length">
            <span v-for="(pair, index) in chiOptions" :key="index" class="chi-item">
              <button class="tertiary-button" @click="claimChi(pair[0], pair[1])">
                吃 {{ formatTile(pair[0]) }} + {{ formatTile(pair[1]) }}
              </button>
            </span>
          </div>
        </div>

        <div class="control-group result-panel" v-if="store.round.phase === 'scoring' && store.result">
          <p class="group-title">结算结果</p>
          <p>赢家：{{ store.players.find((p) => p.id === store.result?.winnerId)?.name ?? '未知' }}</p>
          <p>方式：{{ winTypeLabel }}</p>
          <p>得分：{{ store.result?.score }}</p>
          <p>役种：{{ store.result?.yaku.length ? store.result?.yaku.join('、') : '无' }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useGameStore } from '../store/index'
import { analyzeHand } from '../core/mahjong'
import { sortHandSmart } from '../utils/sortHand'
import type { Tile } from '../types/mahjong'

export default defineComponent({
  setup() {
    const store = useGameStore()
    const currentPlayer = computed(() => store.currentPlayer)
    const opponents = computed(() => store.players.filter((player) => player.id !== currentPlayer.value?.id))

    function tileKey(tile: Tile, index = 0) {
      return `${tile.suit}-${tile.rank}-${index}`
    }

    function formatTile(tile: Tile) {
      if (tile.suit === 'honor') {
        return ['東', '南', '西', '北', '白', '發', '中'][tile.rank - 1] ?? '字'
      }
      const suits = { man: '萬', pin: '筒', sou: '索' }
      return `${tile.rank}${suits[tile.suit]}`
    }

    function discard(tile: Tile) {
      store.discardTile(tile)
      store.analyzeCurrentHand()
    }

    function draw() {
      store.drawTile()
    }

    function startRound() {
      store.startRound()
    }

    const phaseLabel = computed(() => {
      if (store.round.phase === 'waiting') return '等待中'
      if (store.round.phase === 'playing') return '进行中'
      if (store.round.phase === 'scoring') return '结算中'
      return '未知'
    })

    const canTsumo = computed(() => {
      return store.round.phase === 'playing' && store.currentPlayer?.hand.length === 14 && store.round.analysis?.isWinning
    })

    const canRon = computed(() => {
      return store.round.phase === 'playing' && store.round.lastDiscard != null && store.currentPlayer?.hand.length === 13
    })

    const canClaimPon = computed(() => store.canClaimPon)
    const canClaimKan = computed(() => store.canClaimKan)
    const chiOptions = computed(() => store.chiOptions)

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

    const winTypeLabel = computed(() => {
      if (store.result?.type === 'tsumo') return '自摸'
      if (store.result?.type === 'ron') return '荣牌'
      if (store.result?.type === 'draw') return '流局'
      return '未知'
    })

    const roundWindLabel = computed(() => {
      const windMap = { east: '东', south: '南', west: '西', north: '北' }
      return windMap[store.round.roundWind] ?? '东'
    })

    const dealerName = computed(() => {
      return store.players.find((player) => player.id === store.round.dealer)?.name || '未知'
    })

    const seatPositions = computed(() => {
      const positions = { top: null, left: null, right: null }
      const others = store.players.filter((player) => player.id !== currentPlayer.value?.id)
      if (others.length === 1) {
        positions.top = others[0]
      } else {
        positions.top = others.find((player) => player.wind === 'west') ?? others[0] ?? null
        positions.right = others.find((player) => player.wind === 'south') ?? null
        positions.left = others.find((player) => player.wind === 'north') ?? null
      }
      return positions
    })

    const seatAnalyses = computed(() => {
      const analyze = (player: any) => {
        if (!player || !player.hand) return null
        try {
          return analyzeHand(player.hand)
        } catch (e) {
          return null
        }
      }
      return {
        top: analyze(seatPositions.value.top),
        left: analyze(seatPositions.value.left),
        right: analyze(seatPositions.value.right),
        self: analyze(currentPlayer.value)
      }
    })

    const groupedDiscards = computed(() => {
      const disc = currentPlayer.value?.discards ?? []
      const perRow = 6
      const rows: Tile[][] = []
      for (let i = 0; i < disc.length; i += perRow) rows.push(disc.slice(i, i + perRow))
      return rows
    })

    const sortedHand = computed(() => sortHandSmart(currentPlayer.value?.hand ?? []))

    return {
      store,
      currentPlayer,
      opponents,
      seatPositions,
      seatAnalyses,
      groupedDiscards,
      sortedHand,
      tileKey,
      formatTile,
      discard,
      draw,
      startRound,
      claimPon,
      claimKan,
      claimChi,
      declareTsumo,
      declareRon,
      canTsumo,
      canRon,
      canClaimPon,
      canClaimKan,
      chiOptions,
      phaseLabel,
      winTypeLabel,
      dealerName,
      roundWindLabel
    }
  }
})
</script>

<style scoped>
.game-board {
  border-radius: 32px;
  padding: 24px;
  background: linear-gradient(180deg, #efe7dc 0%, #dbc1a0 100%);
  border: 1px solid rgba(180, 133, 74, 0.18);
  box-shadow: var(--shadow);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}
.header h2 {
  margin: 0;
}
.subtitle {
  margin: 8px 0 0;
  color: var(--text-muted);
}
.table-shell {
  border-radius: 32px;
  padding: 24px;
  background: linear-gradient(180deg, #f4e1cc 0%, #d4b18a 100%);
  border: 1px solid rgba(170, 112, 45, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  margin-bottom: 24px;
}
.opponent-row {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 20px;
}
.opponent-card,
.player-card {
  min-width: 180px;
  padding: 18px 20px;
  border-radius: 28px;
  background: rgba(255, 250, 242, 0.94);
  border: 1px solid rgba(206, 164, 103, 0.24);
  text-align: center;
}
.opponent-name,
.player-name {
  margin: 0 0 6px;
  color: #8a5d32;
  font-weight: 700;
}
.opponent-card strong,
.player-card strong {
  display: block;
  font-size: 1.6rem;
  color: #553b21;
  margin-bottom: 6px;
}
.opponent-card span,
.player-card span {
  display: block;
  color: var(--text-muted);
}
.table-center {
  display: flex;
  justify-content: center;
}
.table-surface {
  width: min(100%, 860px);
  min-height: 240px;
  padding: 28px;
  border-radius: 36px;
  background: radial-gradient(circle at top, #65824f 0%, #3f5f33 90%);
  box-shadow: inset 0 0 0 2px rgba(75, 52, 24, 0.12), 0 16px 42px rgba(53, 37, 18, 0.12);
  color: #f4e7cc;
}
.table-label {
  display: inline-flex;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #f6ecd8;
  letter-spacing: 0.08em;
  font-weight: 700;
}
.table-state {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  color: rgba(246, 238, 218, 0.95);
  font-size: 0.95rem;
}
.table-cover {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 26px 0;
}
.table-stat {
  min-width: 120px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
}
.table-stat p {
  margin: 0;
  color: rgba(246, 238, 218, 0.85);
}
.table-stat strong {
  display: block;
  margin-top: 8px;
  font-size: 1.35rem;
  color: #fff;
}
.table-discard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.table-discard p {
  margin: 0;
  color: rgba(246, 238, 218, 0.9);
  font-size: 1rem;
}
.discard-tile {
  width: 128px;
  height: 88px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff9ee 0%, #f4e0c7 100%);
  border: 1px solid rgba(214, 171, 122, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5d4229;
  font-size: 1.2rem;
  font-weight: 900;
}
.discard-empty {
  color: rgba(255, 255, 255, 0.78);
}
.player-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.board-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.85fr;
  gap: 20px;
}
.hand-block,
.control-panel {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 28px;
  border: 1px solid rgba(214, 177, 136, 0.22);
  padding: 22px;
}
.hand-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}
.hand-title {
  margin: 0 0 4px;
  color: #8d6642;
}
.hand-meta {
  margin: 0;
  color: var(--text-muted);
}
.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tile {
  width: 64px;
  height: 88px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdf7 0%, #f7e8d8 100%);
  border: 1px solid rgba(215, 172, 124, 0.28);
  box-shadow: inset 0 -4px 0 rgba(242, 204, 153, 0.18);
  color: #5e4027;
  font-weight: 800;
  font-size: 1.08rem;
  cursor: pointer;
  transition: transform 0.18s ease;
}
.tile:hover {
  transform: translateY(-2px);
}
.control-panel {
  display: grid;
  gap: 18px;
}
.control-group {
  border-radius: 24px;
  padding: 18px;
  background: rgba(255, 250, 243, 0.96);
  border: 1px solid rgba(216, 176, 140, 0.22);
}
.group-title {
  margin: 0 0 14px;
  color: #8d6642;
  font-weight: 700;
}
.discard-note {
  margin: 0 0 12px;
  color: var(--text-muted);
}
.claim-actions,
.chi-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chi-item {
  display: inline-block;
}
.result-panel p {
  margin: 6px 0;
  color: #5d4329;
}
.round-info {
  display: flex;
  justify-content: flex-start;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.round-chip {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(216, 176, 140, 0.22);
  border-radius: 20px;
  padding: 12px 16px;
  min-width: 140px;
}
.round-chip span {
  display: block;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.round-chip strong {
  display: block;
  color: #5d4329;
  font-size: 1.05rem;
}
.table-layout {
  display: grid;
  grid-template-areas:
    "top top top"
    "left center right"
    "bottom bottom bottom";
  gap: 18px;
  align-items: center;
}
.seat {
  display: flex;
  justify-content: center;
}
.seat-top {
  grid-area: top;
}
.seat-left {
  grid-area: left;
}
.seat-right {
  grid-area: right;
}
.seat-bottom {
  grid-area: bottom;
}
.seat-card,
.seat-empty {
  width: 100%;
  max-width: 220px;
  padding: 14px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(206, 164, 103, 0.24);
  text-align: center;
}
.seat-card p,
.seat-empty {
  margin: 0 0 8px;
  color: #8a5d32;
  font-weight: 700;
}
.seat-card strong {
  display: block;
  font-size: 1.4rem;
  color: #553b21;
  margin-bottom: 6px;
}
.seat-detail {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.riichi-tag {
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f6e4d0;
  color: #a4582e;
  font-size: 0.85rem;
  font-weight: 700;
}
.tenpai-tag {
  display: inline-flex;
  margin-top: 8px;
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f0f7e9;
  color: #2f6f37;
  font-size: 0.85rem;
  font-weight: 700;
}
.discard-river {
  margin-top: 20px;
  border-top: 1px solid rgba(216, 176, 140, 0.24);
  padding-top: 16px;
}
.river-title {
  margin: 0 0 10px;
  color: #8d6642;
  font-weight: 700;
}
.river-tiles {
  display: flex;
  display: grid;
  gap: 10px;
}
.river-tile {
  min-width: 52px;
  min-height: 58px;
  border-radius: 14px;
  padding: 8px 10px;
  background: #fff7ef;
  border: 1px solid rgba(212, 170, 122, 0.28);
  color: #6a4d30;
  font-weight: 700;
  text-align: center;
}
.river-row {
  display: flex;
  gap: 10px;
}
.river-tile {
  min-width: 52px;
  min-height: 58px;
  border-radius: 14px;
  padding: 8px 10px;
  background: #fff7ef;
  border: 1px solid rgba(212, 170, 122, 0.28);
  color: #6a4d30;
  font-weight: 700;
  text-align: center;
}
.table-action {
  margin-top: 18px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
}
.table-action p {
  margin: 0 0 8px;
  color: rgba(246, 238, 218, 0.9);
}
.table-action span {
  color: rgba(255, 255, 255, 0.9);
}
@media (max-width: 1000px) {
  .table-layout {
    grid-template-areas:
      "top"
      "center"
      "left"
      "right"
      "bottom";
  }
  .seat-card,
  .seat-empty {
    max-width: 100%;
  }
}
</style>