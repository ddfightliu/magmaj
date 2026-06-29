<template>
  <section class="skill-panel">
    <div class="panel-header">
      <div>
        <p class="panel-label">技能</p>
        <h2>星韵八大核心</h2>
      </div>
      <span class="skill-count">{{ skills.length }} 个</span>
    </div>
    <div class="skill-list">
      <div v-for="skill in skills" :key="skill.id" class="skill-card">
        <div class="skill-top">
          <h3>{{ skill.name }}</h3>
          <span class="skill-tag">{{ skill.category }}</span>
        </div>
        <p>{{ skill.description }}</p>
        <div class="skill-meta">
          <span>星韵 {{ skill.cost }}</span>
          <span>每局 {{ skill.perRoundLimit }} 次</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { skillConfigs } from '../core/mahjong/skills'
import type { SkillConfig } from '../types/skill'

export default defineComponent({
  setup() {
    const skills = Object.values(skillConfigs) as SkillConfig[]
    return { skills }
  }
})
</script>

<style scoped>
.skill-panel {
  border-radius: 28px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(206, 169, 123, 0.24);
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
  background: #fff2df;
  color: #bd7e49;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.skill-list {
  display: grid;
  gap: 14px;
}
.skill-card {
  border-radius: 22px;
  padding: 18px;
  background: linear-gradient(180deg, #fff8f1 0%, #ffefde 100%);
  border: 1px solid rgba(206, 169, 123, 0.24);
}
.skill-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}
.skill-top h3 {
  margin: 0;
}
.skill-tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 235, 217, 0.9);
  color: #a56c3d;
  font-size: 0.85rem;
}
.skill-card p {
  margin: 12px 0 0;
  color: var(--text-muted);
  line-height: 1.75;
}
.skill-meta {
  margin-top: 14px;
  color: #7b6040;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}
.skill-count {
  color: var(--text-muted);
  font-size: 0.95rem;
}
</style>
