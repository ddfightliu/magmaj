<template>
  <div class="pixi-stage" ref="canvasContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import * as PIXI from 'pixi.js'

export default defineComponent({
  setup() {
    const canvasContainer = ref<HTMLDivElement | null>(null)
    let app: PIXI.Application | null = null
    let tileGroup: PIXI.Container | null = null
    let glowLayer: PIXI.Graphics | null = null

    const handTiles = [
      { suit: 'man', rank: 2 },
      { suit: 'man', rank: 3 },
      { suit: 'man', rank: 4 },
      { suit: 'pin', rank: 5 },
      { suit: 'pin', rank: 6 },
      { suit: 'pin', rank: 7 }
    ]

    function formatLabel(tile: { suit: string; rank: number }) {
      if (tile.suit === 'man') return `${tile.rank}万`
      if (tile.suit === 'pin') return `${tile.rank}筒`
      if (tile.suit === 'sou') return `${tile.rank}索`
      return `${tile.rank}`
    }

    function drawTable() {
      if (!app) return
      const surface = new PIXI.Graphics()
      surface.beginFill(0x2c5b2a)
      surface.drawRoundedRect(0, 0, app.view.width, app.view.height, 38)
      surface.endFill()
      app.stage.addChild(surface)

      const felt = new PIXI.Graphics()
      felt.beginFill(0x2c6c3a)
      felt.drawRoundedRect(20, 20, app.view.width - 40, app.view.height - 40, 32)
      felt.endFill()
      app.stage.addChild(felt)

      const edge = new PIXI.Graphics()
      edge.lineStyle(2, 0x9fbf92, 0.6)
      edge.drawRoundedRect(20, 20, app.view.width - 40, app.view.height - 40, 32)
      app.stage.addChild(edge)

      const deckLabel = new PIXI.Text('牌墙', {
        fontSize: 18,
        fill: 0xe5d4b1,
        fontWeight: '600'
      })
      deckLabel.x = 30
      deckLabel.y = 28
      app.stage.addChild(deckLabel)

      glowLayer = new PIXI.Graphics()
      app.stage.addChild(glowLayer)

      tileGroup = new PIXI.Container()
      app.stage.addChild(tileGroup)

      handTiles.forEach((tile, index) => {
        const tileContainer = new PIXI.Container()
        tileContainer.x = 70 + index * 90
        tileContainer.y = app.view.height * 0.55
        tileContainer.pivot.set(36, 48)

        const rect = new PIXI.Graphics()
        rect.beginFill(0xffffff)
        rect.lineStyle(2, 0xcc7f1c)
        rect.drawRoundedRect(0, 0, 72, 96, 16)
        rect.endFill()

        const label = new PIXI.Text(formatLabel(tile), {
          fontSize: 24,
          fill: 0x3c2c18,
          fontWeight: '700'
        })
        label.anchor.set(0.5)
        label.x = 36
        label.y = 52

        const shimmer = new PIXI.Graphics()
        shimmer.beginFill(0xffffff, 0.18)
        shimmer.drawRoundedRect(10, 14, 18, 60, 10)
        shimmer.endFill()
        shimmer.rotation = -0.35
        shimmer.alpha = 0.3

        tileContainer.addChild(rect, label, shimmer)
        tileGroup?.addChild(tileContainer)
      })
    }

    function resize() {
      if (!app || !canvasContainer.value) return
      const width = canvasContainer.value.clientWidth
      const height = canvasContainer.value.clientHeight
      app.renderer.resize(width, height)
      app.stage.removeChildren()
      drawTable()
    }

    onMounted(() => {
      if (!canvasContainer.value) return
      app = new PIXI.Application({
        width: canvasContainer.value.clientWidth,
        height: canvasContainer.value.clientHeight,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      })
      canvasContainer.value.appendChild(app.view)
      drawTable()

      window.addEventListener('resize', resize)
      app.ticker.add(() => {
        if (!tileGroup || !glowLayer) return

        const time = performance.now() / 500
        tileGroup.children.forEach((child, index) => {
          child.rotation = Math.sin(time + index * 0.3) * 0.01
          child.y = app.view.height * 0.55 + Math.sin(time + index * 0.4) * 3
          child.scale.set(1 + Math.sin(time + index * 0.55) * 0.01)

          const shimmer = child.children[2] as PIXI.Graphics
          shimmer.y = 14 + Math.sin(time * 1.5 + index) * 2
          shimmer.alpha = 0.18 + Math.sin(time + index * 1.2) * 0.03
        })

        glowLayer.clear()
        glowLayer.lineStyle(2, 0xf6d79e, 0.6)
        glowLayer.beginFill(0xfaf0d5, 0.08)
        const glowX = app.view.width / 2 - 44
        const glowY = app.view.height * 0.5 - 58
        glowLayer.drawRoundedRect(glowX, glowY, 88, 116, 18)
        glowLayer.endFill()
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resize)
      app?.destroy(true, { children: true })
      app = null
    })

    return { canvasContainer }
  }
})
</script>

<style scoped>
.pixi-stage {
  width: 100%;
  min-height: 420px;
  border-radius: 28px;
  overflow: hidden;
  background: radial-gradient(circle at top, #3e6f34 0%, #193718 55%, #0b1e0f 100%);
}
</style>
