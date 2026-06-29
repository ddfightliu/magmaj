<template>
  <section class="page-shell login-page">
    <h1>登录</h1>
    <div class="login-card">
      <input v-model="username" placeholder="请输入用户名" />
      <input type="password" v-model="password" placeholder="请输入密码" />
      <button class="primary-button" @click="login">登录</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    const username = ref('')
    const password = ref('')

    function login() {
      auth.login({ username: username.value })
      router.push('/')
    }

    return { username, password, login }
  }
})
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
.login-card {
  width: min(420px, 100%);
  display: grid;
  gap: 14px;
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 26px 70px rgba(95, 61, 22, 0.12);
}
input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(196, 168, 141, 0.4);
  border-radius: 16px;
  outline: none;
}
.primary-button {
  width: 100%;
}
</style>
