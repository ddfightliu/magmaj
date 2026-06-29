<template>
  <div id="app" class="app-shell">
    <div class="app-shell__flare"></div>
    <RouterView />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

export default defineComponent({
  components: { RouterView }
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.app-shell__flare {
  position: fixed;
  left: 0;
  top: 0;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(255, 230, 204, 0.9), transparent 55%);
  pointer-events: none;
  filter: blur(40px);
}
</style>
