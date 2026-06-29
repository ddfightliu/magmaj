<template>
  <section class="home-shell">
    <header class="home-header">
      <div>
        <p class="hero-label">星韵麻友</p>
        <h1>轻雅国风麻将对局</h1>
        <p>大厅、登录、充值、匹配房间、PixiJS 牌桌</p>
      </div>
      <nav class="nav-links">
        <RouterLink to="/login">登录</RouterLink>
        <RouterLink to="/match">匹配房间</RouterLink>
        <RouterLink to="/recharge">充值</RouterLink>
      </nav>
    </header>

    <div class="home-layout">
      <section class="panel-card">
        <h2>当前用户</h2>
        <p>用户名：{{ auth.username || '游客' }}</p>
        <p>余额：{{ auth.balance }}</p>
      </section>

      <section class="panel-card">
        <h2>桌面预览</h2>
        <PixiMahjongTable />
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/auth'
import PixiMahjongTable from '../components/PixiMahjongTable.vue'

export default defineComponent({
  components: { RouterLink, PixiMahjongTable },
  setup() {
    const auth = useAuthStore()
    return { auth }
  }
})
</script>

<style scoped>
.home-shell {
  min-height: 100vh;
  padding: 24px;
}
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 24px;
}
.hero-label {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff4e8;
  color: #b0662f;
  font-weight: 700;
}
.home-header h1 {
  margin: 0 0 12px;
}
.nav-links {
  display: flex;
  gap: 12px;
}
.panel-card {
  background: rgba(255,255,255,0.95);
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 26px 80px rgba(100, 63, 16, 0.12);
}
.home-layout {
  display: grid;
  gap: 20px;
}
</style>
