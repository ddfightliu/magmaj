<template>
  <section class="page-shell recharge-page">
    <h1>充值中心</h1>
    <div class="recharge-card">
      <p>当前余额：{{ auth.balance }} 余额</p>
      <button class="primary-button" @click="recharge(100)">充值 100</button>
      <button class="secondary-button" @click="recharge(500)">充值 500</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '../store/auth'

export default defineComponent({
  setup() {
    const auth = useAuthStore()
    function recharge(amount: number) {
      auth.recharge(amount)
    }
    return { auth, recharge }
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
.recharge-card {
  width: min(420px, 100%);
  display: grid;
  gap: 14px;
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 26px 70px rgba(95, 61, 22, 0.12);
}
button {
  width: 100%;
}
</style>
