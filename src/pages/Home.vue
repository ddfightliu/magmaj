<template>
  <!-- 游戏主大厅：参考金铲铲风格，分头部导航 / 玩家形象区 / 操作按钮区 / 底部功能栏 -->
  <section class="home-shell">
    <div class="home-aurora"></div>
    <div class="home-sparkle"></div>

    <!-- ========== 顶部导航栏：头像按钮 / 标题 / 设置按钮 ========== -->
    <header class="home-topbar">
      <!-- 玩家头像按钮（点击可进入个人中心） -->
      <RouterLink to="/" class="avatar-button" @click.prevent="openProfile">
        <div class="avatar-ring">
          <span class="avatar-emoji">🧙</span>
        </div>
        <div class="avatar-meta">
          <strong class="avatar-name">{{ auth.username || '游客玩家' }}</strong>
          <span class="avatar-balance">💎 {{ auth.balance }} 星核</span>
        </div>
      </RouterLink>

      <!-- 标题 LOGO -->
      <div class="home-title">
        <span class="title-main">星韵麻友</span>
        <span class="title-sub">轻雅国风 · 社交对战</span>
      </div>

      <!-- 右侧工具按钮：充值 + 设置 -->
      <div class="topbar-actions">
        <RouterLink to="/recharge" class="icon-button" title="充值中心">
          <span class="icon">💳</span>
          <span class="icon-label">充值</span>
        </RouterLink>
        <button class="icon-button" @click="toggleSettings" title="游戏设置">
          <span class="icon">⚙️</span>
          <span class="icon-label">设置</span>
        </button>
      </div>
    </header>

    <!-- ========== 中部：玩家形象展示 + 场景牌桌 ========== -->
    <div class="hero-stage">
      <!-- 左侧角色形象（静态插画装饰，后续可接入角色换装系统） -->
      <div class="hero-character">
        <div class="character-aura"></div>
        <div class="character-figure">
          <span class="character-emoji">🧙‍♂️</span>
        </div>
        <div class="character-base"></div>
        <div class="character-info">
          <span class="character-tag">⭐ 新手玩家</span>
          <span class="character-rank">段位：<strong>流萤逐星</strong></span>
        </div>
      </div>

      <!-- 右侧 PixiJS 牌桌预览 -->
      <div class="hero-table">
        <div class="table-caption">
          <span class="table-label">对局预览</span>
          <span class="table-desc">摸牌 · 鸣牌 · 胡牌 · 一气呵成</span>
        </div>
        <PixiMahjongTable />
      </div>
    </div>

    <!-- ========== 中部核心操作区：开始游戏 / 匹配房间 ========== -->
    <div class="action-zone">
      <!-- 主 CTA：开始游戏 -->
      <button class="start-button" @click="startGame">
        <span class="start-label">开始游戏</span>
        <span class="start-hint">2 / 3 / 4 人对战 · 快速匹配</span>
      </button>

      <!-- 次级按钮：匹配房间 + 练习 -->
      <div class="secondary-row">
        <RouterLink to="/match" class="secondary-button secondary-blue">
          <span class="secondary-icon">🗺️</span>
          <span class="secondary-text">匹配房间</span>
        </RouterLink>
        <RouterLink to="/play" class="secondary-button secondary-purple">
          <span class="secondary-icon">🎯</span>
          <span class="secondary-text">练习对局</span>
        </RouterLink>
      </div>
    </div>

    <!-- ========== 底部功能卡片区（场次 + 社交） ========== -->
    <div class="feature-row">
      <div class="feature-card">
        <span class="feature-icon">⭐</span>
        <div class="feature-text">
          <strong>流萤闲庭</strong>
          <span>0 入场 · 新手友好</span>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🪙</span>
        <div class="feature-text">
          <strong>星尘逐弈</strong>
          <span>100 星核 · 入门竞技</span>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🏆</span>
        <div class="feature-text">
          <strong>沧砂论道</strong>
          <span>1000 星核 · 高手对决</span>
        </div>
      </div>
      <div class="feature-card feature-social">
        <span class="feature-icon">👯</span>
        <div class="feature-text">
          <strong>闺蜜开黑</strong>
          <span>2 人房 · 专属社交</span>
        </div>
      </div>
    </div>

    <!-- ========== 设置抽屉（点击 ⚙️ 弹出） ========== -->
    <transition name="fade">
      <section v-if="showSettings" class="settings-drawer" @click.self="toggleSettings">
        <div class="settings-card">
          <header class="settings-header">
            <h3>游戏设置</h3>
            <button class="close-btn" @click="toggleSettings" title="关闭">✕</button>
          </header>

          <div class="settings-group">
            <label class="setting-row">
              <span class="setting-name">🔊 背景音乐</span>
              <span class="setting-value">
                <button class="toggle-pill" :class="{ on: settings.bgm }" @click="settings.bgm = !settings.bgm">
                  {{ settings.bgm ? '开启' : '关闭' }}
                </button>
              </span>
            </label>
            <label class="setting-row">
              <span class="setting-name">🔔 音效</span>
              <span class="setting-value">
                <button class="toggle-pill" :class="{ on: settings.sfx }" @click="settings.sfx = !settings.sfx">
                  {{ settings.sfx ? '开启' : '关闭' }}
                </button>
              </span>
            </label>
            <label class="setting-row">
              <span class="setting-name">🎵 音量</span>
              <span class="setting-value">
                <input type="range" min="0" max="100" v-model.number="settings.volume" />
                <span class="range-num">{{ settings.volume }}</span>
              </span>
            </label>
            <label class="setting-row">
              <span class="setting-name">🖥️ 横屏显示</span>
              <span class="setting-value">
                <button class="toggle-pill" :class="{ on: settings.landscape }" @click="settings.landscape = !settings.landscape">
                  {{ settings.landscape ? '横屏' : '竖屏' }}
                </button>
              </span>
            </label>
            <label class="setting-row">
              <span class="setting-name">🌓 主题风格</span>
              <span class="setting-value">
                <button class="toggle-pill on">轻雅国风</button>
              </span>
            </label>
          </div>

          <footer class="settings-footer">
            <span>版本 v0.1.0 · 星韵麻友开发版</span>
          </footer>
        </div>
      </section>
    </transition>
  </section>
</template>

<script lang="ts">
/**
 * 游戏主页（大厅）
 * - 顶部：玩家头像按钮 / 标题 / 充值与设置
 * - 中部：玩家形象展示 + PixiJS 牌桌预览
 * - 操作区：开始游戏（主 CTA）+ 匹配房间 / 练习对局
 * - 底部：场次 / 社交功能卡片
 * - 右侧抽屉：游戏设置（音效 / 音量 / 横屏 / 主题）
 */
import { defineComponent, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import PixiMahjongTable from '../components/PixiMahjongTable.vue'

export default defineComponent({
  components: { RouterLink, PixiMahjongTable },
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    // 设置面板状态（仅前端演示）
    const showSettings = refExternal(false)
    const settings = reactive({
      bgm: true,
      sfx: true,
      volume: 70,
      landscape: false
    })

    function toggleSettings() {
      showSettings.value = !showSettings.value
    }

    function openProfile() {
      // 预留：点击头像可跳转到个人中心页面
      router.push('/recharge')
    }

    /** 点击"开始游戏"：进入对局页（或匹配页） */
    function startGame() {
      router.push('/match')
    }

    return { auth, showSettings, settings, toggleSettings, openProfile, startGame }
  }
})

/**
 * 小型 helper：在 <script setup> 外做响应式引用（兼容 template 访问）
 * 注：此处为兼容写法，避免使用 defineComponent 的 defineProps 外场景
 */
function refExternal<T>(value: T) {
  const holder: { value: T } = { value }
  return new Proxy(holder, {
    get(target, key) {
      if (key === 'value') return target.value
      return undefined as any
    },
    set(target, key, newValue) {
      if (key === 'value') {
        target.value = newValue as T
        return true
      }
      return false
    }
  }) as { value: T }
}
</script>

<style scoped>
/* =============================
 * 主页样式：金铲铲风格（华贵金 + 星光）
 * ============================= */
.home-shell {
  min-height: 100vh;
  padding: 18px 20px 32px;
  position: relative;
  color: #3c2c18;
  background:
    radial-gradient(ellipse at 15% 10%, rgba(255, 214, 138, 0.45) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 85%, rgba(200, 160, 255, 0.3) 0%, transparent 45%),
    linear-gradient(180deg, #f8ecd3 0%, #ecd9b0 50%, #d9be92 100%);
  overflow-x: hidden;
}

/* 背景装饰层 */
.home-aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 55%, rgba(255, 250, 220, 0.55) 0%, transparent 38%);
}
.home-sparkle {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(2px 2px at 35% 15%, rgba(255, 220, 140, 0.9), transparent 60%),
    radial-gradient(1px 1px at 75% 30%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(1px 1px at 55% 60%, rgba(255, 255, 255, 0.6), transparent 60%),
    radial-gradient(1px 1px at 85% 70%, rgba(255, 220, 140, 0.7), transparent 60%),
    radial-gradient(2px 2px at 20% 80%, rgba(255, 255, 255, 0.6), transparent 60%);
  animation: sparkleMove 16s linear infinite;
  opacity: 0.75;
}
@keyframes sparkleMove {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-14px, -8px); }
}

/* ============ 顶部导航栏 ============ */
.home-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 252, 240, 0.92), rgba(250, 236, 206, 0.88));
  box-shadow: 0 10px 28px rgba(120, 72, 28, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

/* 玩家头像按钮 */
.avatar-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff5dd 0%, #ffe5b5 100%);
  text-decoration: none;
  color: #3c2c18;
  border: 1px solid rgba(214, 170, 100, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}
.avatar-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(200, 120, 40, 0.25);
}
.avatar-ring {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffd68a 0%, #ff8f5a 100%);
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.7);
}
.avatar-emoji { font-size: 22px; }
.avatar-meta { display: flex; flex-direction: column; line-height: 1.2; }
.avatar-name { font-size: 0.95rem; font-weight: 800; color: #5d3a18; }
.avatar-balance { font-size: 0.78rem; color: #a98a5f; margin-top: 2px; }

/* 标题 */
.home-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  letter-spacing: 0.1em;
}
.title-main {
  font-size: 1.4rem;
  font-weight: 900;
  color: #5d3a18;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.6);
}
.title-sub {
  font-size: 0.72rem;
  color: #8d6642;
  margin-top: 2px;
}

/* 右侧工具按钮 */
.topbar-actions {
  display: flex;
  gap: 8px;
}
.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(214, 170, 100, 0.3);
  text-decoration: none;
  color: #5d3a18;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
.icon-button:hover {
  transform: translateY(-2px);
  background: #fff;
}
.icon-button .icon { font-size: 1.1rem; }
.icon-button .icon-label { font-size: 0.7rem; font-weight: 700; }

/* ============ 中部舞台：角色 + 牌桌 ============ */
.hero-stage {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 18px;
  margin-top: 18px;
}

/* 左侧角色形象 */
.hero-character {
  position: relative;
  min-height: 320px;
  border-radius: 26px;
  padding: 20px;
  background:
    radial-gradient(circle at 50% 80%, rgba(255, 190, 120, 0.6) 0%, transparent 55%),
    linear-gradient(180deg, rgba(255, 252, 240, 0.88) 0%, rgba(248, 228, 190, 0.85) 100%);
  box-shadow: 0 18px 54px rgba(120, 72, 28, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}
.character-aura {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 220, 140, 0.7) 0%, transparent 70%);
  filter: blur(14px);
  animation: auraPulse 3.2s ease-in-out infinite;
}
@keyframes auraPulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.9; }
  50% { transform: translateX(-50%) scale(1.08); opacity: 1; }
}
.character-figure {
  position: relative;
  z-index: 1;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffcf88 0%, #ff8c5a 100%);
  display: grid;
  place-items: center;
  box-shadow: 0 20px 44px rgba(255, 140, 90, 0.45), inset 0 -6px 0 rgba(0, 0, 0, 0.08);
  animation: floatY 4s ease-in-out infinite;
}
.character-emoji { font-size: 90px; }
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.character-base {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 18px;
  border-radius: 50%;
  background: rgba(80, 50, 20, 0.18);
  filter: blur(4px);
}
.character-info {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.character-tag {
  padding: 4px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff2d0 0%, #ffd68a 100%);
  color: #7a4a18;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.character-rank { font-size: 0.82rem; color: #8d6642; }
.character-rank strong { color: #d4581e; }

/* 右侧 PixiJS 牌桌预览 */
.hero-table {
  position: relative;
  border-radius: 26px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(255, 252, 240, 0.9) 0%, rgba(240, 222, 186, 0.88) 100%);
  box-shadow: 0 18px 54px rgba(120, 72, 28, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  min-height: 320px;
}
.table-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}
.table-label {
  font-size: 0.9rem;
  font-weight: 800;
  color: #5d3a18;
  letter-spacing: 0.08em;
}
.table-desc { font-size: 0.75rem; color: #a98a5f; }

/* ============ 核心操作区：开始游戏 CTA ============ */
.action-zone {
  position: relative;
  z-index: 2;
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

/* 主 CTA 按钮（金铲铲风格大按钮） */
.start-button {
  width: min(520px, 100%);
  padding: 20px 22px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #ffb55a 0%, #ff7a3c 50%, #ff5a3c 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow:
    0 16px 40px rgba(255, 122, 60, 0.45),
    inset 0 -4px 0 rgba(0, 0, 0, 0.12),
    inset 0 2px 0 rgba(255, 255, 255, 0.45);
  transition: transform 0.12s ease, box-shadow 0.15s ease;
}
.start-button:hover { transform: translateY(-2px); }
.start-button:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(255, 122, 60, 0.35); }
.start-label {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.18);
}
.start-hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.05em;
}

/* 次级按钮：匹配 / 练习 */
.secondary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: min(520px, 100%);
}
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 999px;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15), inset 0 -3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.12s ease;
  border: none;
  cursor: pointer;
}
.secondary-button:hover { transform: translateY(-2px); }
.secondary-blue { background: linear-gradient(135deg, #6bb9ff 0%, #3d84d4 100%); }
.secondary-purple { background: linear-gradient(135deg, #c39aff 0%, #7e5fd4 100%); }
.secondary-icon { font-size: 1.1rem; }
.secondary-text { font-size: 0.95rem; }

/* ============ 底部功能卡片 ============ */
.feature-row {
  position: relative;
  z-index: 2;
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.feature-card {
  padding: 14px 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 252, 240, 0.92) 0%, rgba(246, 228, 192, 0.9) 100%);
  box-shadow: 0 10px 24px rgba(120, 72, 28, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.15s ease;
}
.feature-card:hover { transform: translateY(-3px); }
.feature-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(160deg, #ffd68a 0%, #ff8f5a 100%);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.feature-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.feature-text strong {
  font-size: 0.88rem;
  color: #5d3a18;
  font-weight: 900;
}
.feature-text span {
  font-size: 0.72rem;
  color: #8d6642;
  margin-top: 3px;
}
.feature-social .feature-icon {
  background: linear-gradient(160deg, #ffb1d8 0%, #ff7aa2 100%);
}

/* ============ 设置抽屉 ============ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.settings-drawer {
  position: fixed;
  inset: 0;
  background: rgba(30, 18, 5, 0.45);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 20px;
}
.settings-card {
  width: min(460px, 100%);
  border-radius: 28px;
  background: linear-gradient(180deg, #fff8e8 0%, #f5e1b8 100%);
  box-shadow: 0 30px 70px rgba(60, 30, 5, 0.3);
  overflow: hidden;
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(214, 170, 100, 0.35);
}
.settings-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #5d3a18;
  letter-spacing: 0.1em;
}
.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.7);
  color: #5d3a18;
  font-weight: 800;
  cursor: pointer;
}
.close-btn:hover { background: #fff; }

.settings-group {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
}
.setting-name { font-size: 0.9rem; color: #5d3a18; font-weight: 700; }
.setting-value { display: flex; align-items: center; gap: 10px; }
.toggle-pill {
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  background: #e8d6b4;
  color: #8d6642;
  font-weight: 800;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.toggle-pill.on {
  background: linear-gradient(135deg, #ffb55a, #ff7a3c);
  color: #fff;
}
.setting-value input[type="range"] {
  width: 130px;
  accent-color: #ff7a3c;
}
.range-num {
  font-size: 0.8rem;
  color: #8d6642;
  font-weight: 700;
  width: 30px;
  text-align: right;
}

.settings-footer {
  padding: 14px 20px;
  border-top: 1px solid rgba(214, 170, 100, 0.35);
  text-align: center;
  font-size: 0.75rem;
  color: #8d6642;
}

/* ============ 响应式：小屏堆叠 ============ */
@media (max-width: 820px) {
  .hero-stage { grid-template-columns: 1fr; }
  .feature-row { grid-template-columns: repeat(2, 1fr); }
  .home-topbar { flex-wrap: wrap; }
  .home-title { order: -1; width: 100%; margin-bottom: 4px; }
}
@media (max-width: 520px) {
  .hero-character { min-height: 240px; }
  .character-figure { width: 140px; height: 140px; }
  .character-emoji { font-size: 70px; }
  .start-label { font-size: 1.1rem; }
}
</style>