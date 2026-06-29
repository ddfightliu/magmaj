<template>
  <!-- 登录页主容器：背景渐变 + 装饰星光 -->
  <section class="login-page">
    <div class="login-aurora"></div>
    <div class="login-sparkle"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 顶部 LOGO + 标语 -->
      <div class="login-brand">
        <div class="brand-logo">
          <span class="logo-inner">🀄</span>
        </div>
        <h1 class="brand-title">星韵麻友</h1>
        <p class="brand-slogan">轻雅国风 · 社交竞技 · 与朋友一起开黑</p>
      </div>

      <!-- 账号登录表单 -->
      <div class="login-form">
        <div class="form-field">
          <span class="field-icon">👤</span>
          <input
            v-model="username"
            type="text"
            placeholder="请输入昵称 / 邮箱"
            maxlength="20"
            @keyup.enter="login"
          />
        </div>
        <div class="form-field">
          <span class="field-icon">🔒</span>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码（可留空体验）"
            maxlength="20"
            @keyup.enter="login"
          />
        </div>
      </div>

      <!-- 主登录按钮 -->
      <button class="primary-button" @click="login">
        <span>登录 / 进入大厅</span>
      </button>

      <!-- 第三方登录分割线 -->
      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-text">第三方登录</span>
        <span class="divider-line"></span>
      </div>

      <!-- 第三方登录快捷按钮 -->
      <div class="oauth-row">
        <!-- 微信登录 -->
        <button class="oauth-button oauth-wechat" @click="loginWithOAuth('wechat')" title="微信登录">
          <span class="oauth-icon">💬</span>
          <span class="oauth-label">微信</span>
        </button>

        <!-- QQ 登录 -->
        <button class="oauth-button oauth-qq" @click="loginWithOAuth('qq')" title="QQ登录">
          <span class="oauth-icon">🐧</span>
          <span class="oauth-label">QQ</span>
        </button>

        <!-- 邮箱登录 -->
        <button class="oauth-button oauth-email" @click="loginWithOAuth('email')" title="邮箱登录">
          <span class="oauth-icon">📧</span>
          <span class="oauth-label">邮箱</span>
        </button>
      </div>

      <!-- 底部协议 -->
      <p class="login-tips">
        点击登录即代表同意《用户协议》与《隐私政策》· 新手登录即送<span class="tips-em">1000 星核</span>
      </p>
    </div>

    <!-- 返回首页 -->
    <RouterLink to="/" class="login-back">← 返回首页</RouterLink>
  </section>
</template>

<script lang="ts">
/**
 * 登录页组件
 * - 提供账号密码登录 + 微信 / QQ / 邮箱三种第三方登录
 * - 使用 Pinia 保存登录态、星核余额
 * - 登录完成后跳转到游戏主页 Home.vue
 */
import { defineComponent, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

export default defineComponent({
  components: { RouterLink },
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    // 用户名 / 密码（本地演示，真实项目可接入 OAuth）
    const username = ref('')
    const password = ref('')

    /** 账号密码登录：把用户名写入 auth store，并赠送星核 */
    function login() {
      const displayName = username.value.trim() || '游客玩家'
      auth.login({ username: displayName })
      router.push('/')
    }

    /**
     * 第三方登录（模拟）
     * @param provider - 'wechat' | 'qq' | 'email'
     * 真实项目里此处应调用对应 SDK / 后端接口
     */
    function loginWithOAuth(provider: 'wechat' | 'qq' | 'email') {
      const nicknameMap = {
        wechat: '微信玩家',
        qq: 'QQ玩家',
        email: '邮箱玩家'
      }
      const displayName = `${nicknameMap[provider]}-${Math.floor(Math.random() * 1000)}`
      auth.login({ username: displayName })
      router.push('/')
    }

    return { username, password, login, loginWithOAuth }
  }
})
</script>

<style scoped>
/* =============================
 * 登录页：星光渐变国风样式
 * ============================= */
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 20px 32px;
  position: relative;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 226, 170, 0.35) 0%, transparent 45%),
    radial-gradient(circle at 80% 90%, rgba(200, 160, 255, 0.25) 0%, transparent 50%),
    linear-gradient(180deg, #f6ecd8 0%, #e9d8b8 60%, #d8c09a 100%);
  color: #3c2c18;
}

/* 背景极光与星光装饰 */
.login-aurora {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 250, 230, 0.5) 0%, transparent 35%),
    radial-gradient(circle at 70% 80%, rgba(170, 130, 255, 0.25) 0%, transparent 40%);
  pointer-events: none;
}
.login-sparkle {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(1px 1px at 60% 70%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(2px 2px at 40% 20%, rgba(255, 215, 150, 0.9), transparent 60%),
    radial-gradient(1px 1px at 80% 40%, rgba(255, 255, 255, 0.8), transparent 60%),
    radial-gradient(1px 1px at 15% 80%, rgba(255, 255, 255, 0.6), transparent 60%);
  pointer-events: none;
  animation: sparkleShift 14s linear infinite;
  opacity: 0.7;
}
@keyframes sparkleShift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, -6px); }
}

/* 登录卡片：毛玻璃 + 圆角阴影（参考金铲铲顶部大卡片） */
.login-card {
  width: min(440px, 100%);
  padding: 32px 28px 28px;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 252, 244, 0.96) 0%, rgba(252, 244, 225, 0.94) 100%);
  box-shadow:
    0 30px 90px rgba(120, 72, 28, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* 顶部品牌区 */
.login-brand {
  text-align: center;
  margin-bottom: 22px;
}
.brand-logo {
  width: 84px;
  height: 84px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffd68a 0%, #ff8f5a 100%);
  display: grid;
  place-items: center;
  box-shadow:
    0 10px 28px rgba(255, 152, 80, 0.45),
    inset 0 0 0 4px rgba(255, 255, 255, 0.7);
}
.logo-inner {
  font-size: 40px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.12));
}
.brand-title {
  margin: 4px 0 4px;
  font-size: 1.6rem;
  letter-spacing: 0.1em;
  color: #5d3a18;
  font-weight: 900;
}
.brand-slogan {
  margin: 0;
  font-size: 0.82rem;
  color: #8d6642;
  letter-spacing: 0.04em;
}

/* 表单区 */
.login-form {
  display: grid;
  gap: 12px;
  margin: 8px 0 14px;
}
.form-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(206, 164, 103, 0.28);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.form-field:focus-within {
  border-color: rgba(255, 152, 80, 0.6);
  box-shadow: 0 0 0 4px rgba(255, 200, 120, 0.2);
}
.field-icon {
  font-size: 0.95rem;
  opacity: 0.85;
}
.form-field input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: #3c2c18;
  letter-spacing: 0.02em;
}
.form-field input::placeholder {
  color: #a98a5f;
}

/* 主按钮 */
.primary-button {
  width: 100%;
  margin-top: 6px;
  padding: 14px 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #ffb55a 0%, #ff7a3c 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow:
    0 10px 26px rgba(255, 122, 60, 0.38),
    inset 0 -3px 0 rgba(0, 0, 0, 0.08);
  transition: transform 0.12s ease, box-shadow 0.18s ease;
}
.primary-button:hover { transform: translateY(-1px); }
.primary-button:active { transform: translateY(0); box-shadow: 0 4px 12px rgba(255, 122, 60, 0.3); }

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 14px;
  color: #a98a5f;
  font-size: 0.8rem;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(206, 164, 103, 0.35);
}

/* 第三方登录按钮行 */
.oauth-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.oauth-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 20px;
  border: 1px solid rgba(206, 164, 103, 0.25);
  background: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.oauth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(120, 72, 28, 0.16);
}
.oauth-icon {
  font-size: 1.4rem;
}
.oauth-label {
  font-size: 0.85rem;
  color: #5d3a18;
  font-weight: 700;
}
/* 各平台主题色 */
.oauth-wechat:hover { border-color: #3dbf40; }
.oauth-qq:hover { border-color: #12b7f5; }
.oauth-email:hover { border-color: #ff7a3c; }

/* 底部提示 */
.login-tips {
  margin: 18px 0 0;
  text-align: center;
  font-size: 0.72rem;
  color: #8d6642;
  letter-spacing: 0.04em;
}
.tips-em {
  color: #d4581e;
  font-weight: 800;
  margin: 0 2px;
}

/* 返回按钮 */
.login-back {
  position: absolute;
  top: 18px;
  left: 20px;
  font-size: 0.85rem;
  color: #7a4f22;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  z-index: 1;
  transition: background 0.18s ease;
}
.login-back:hover { background: rgba(255, 255, 255, 0.85); }

/* 小屏自适应 */
@media (max-width: 480px) {
  .login-card { padding: 26px 20px 22px; border-radius: 26px; }
  .brand-title { font-size: 1.4rem; }
}
</style>