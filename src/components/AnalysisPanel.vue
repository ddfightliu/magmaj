<template>
  <section class="analysis-panel">
    <div class="analysis-header">
      <p class="panel-label">听牌分析</p>
      <h2>当前巡次信息</h2>
    </div>
    <div v-if="analysis" class="analysis-content">
      <div class="analysis-row"><span>番数</span><strong>{{ analysis.han }}</strong></div>
      <div class="analysis-row"><span>符数</span><strong>{{ analysis.fu }}</strong></div>
      <div class="analysis-row"><span>估算分</span><strong>{{ analysis.score }}</strong></div>
      <div class="analysis-row"><span>役种</span><strong>{{ analysis.yaku.length ? analysis.yaku.join('、') : '无' }}</strong></div>
      <div class="analysis-row"><span>状态</span><strong>{{ analysis.isWinning ? '可胡' : '未听' }}</strong></div>
      <div v-if="analysis.possibleWinningTiles?.length" class="analysis-tiles">
        <p>听牌候选：</p>
        <div class="tile-list">{{ formatTiles(analysis.possibleWinningTiles) }}</div>
      </div>
    </div>
    <div v-else class="analysis-empty">
      当前无可用分析，请先摸牌或出牌。
    </div>
  </section>
</template>


<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useGameStore } from '../store/index'
import type { Tile } from '../types/mahjong'

export default defineComponent({
  setup() {
    const store = useGameStore()
    const analysis = computed(() => store.round.analysis)

    function formatTile(tile: Tile) {
      if (tile.suit === 'honor') {
        return ['東', '南', '西', '北', '白', '發', '中'][tile.rank - 1] ?? '字'
      }
      const suits = { man: '萬', pin: '筒', sou: '索' }
      return `${tile.rank}${suits[tile.suit]}`
    }

    function formatTiles(tiles: Tile[]) {
      return tiles.map(formatTile).join('、')
    }

    return { analysis, formatTiles }
  }
})
</script>

<style scoped>
.analysis-panel {
  border-radius: 28px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(214, 178, 134, 0.2);
  box-shadow: var(--shadow);
}
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.panel-label {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff2e1;
  color: #ba7d47;
  font-weight: 700;
}
.analysis-content {
  display: grid;
  gap: 12px;
}
.analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 248, 242, 0.95);
  border: 1px solid rgba(205, 169, 126, 0.18);
}
.analysis-row span {
  color: var(--text-muted);
}
.analysis-row strong {
  color: var(--text);
}
.analysis-tiles {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 247, 238, 0.95);
  border: 1px solid rgba(210, 176, 134, 0.18);
}
.tile-list {
  margin-top: 8px;
  color: #7d6348;
  line-height: 1.6;
}
.analysis-empty {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 246, 239, 0.9);
  color: var(--text-muted);
}
</style>
