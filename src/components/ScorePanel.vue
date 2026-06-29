<template>
  <section class="score-panel">
    <div class="panel-header">
      <p class="panel-label">实时分数</p>
      <h2>当前对局</h2>
    </div>
    <div class="score-grid">
      <div class="score-cell" v-for="player in players" :key="player.id">
        <p class="score-player">{{ player.name }}</p>
        <strong>{{ player.score }}</strong>
        <p class="score-sub">{{ player.wind }} 家 · {{ player.discards.length }} 弃牌</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useGameStore } from '../store/index'

export default defineComponent({
  setup() {
    const store = useGameStore()
    const players = computed(() => store.players)
    return { players }
  }
})
</script>

<style scoped>
.score-panel {
  border-radius: 28px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(214, 178, 134, 0.2);
  box-shadow: var(--shadow);
}
.panel-header {
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
  color: #b5753f;
  font-weight: 700;
}
.score-grid {
  display: grid;
  gap: 12px;
}
.score-cell {
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 247, 238, 0.95);
  border: 1px solid rgba(209, 171, 125, 0.18);
}
.score-player {
  margin: 0 0 8px;
  color: var(--text-muted);
}
.score-cell strong {
  display: block;
  font-size: 1.4rem;
  color: var(--text);
}
.score-sub {
  margin: 8px 0 0;
  color: var(--text-muted);
}
</style>
