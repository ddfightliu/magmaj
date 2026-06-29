import { ref, onMounted, onUnmounted } from 'vue'
import { getScreenInfo } from '../utils/platform'

export interface GameViewport {
  width: number
  height: number
  scale: number
  centerX: number
  centerY: number
}

export function useAdaptiveGame() {
  const viewport = ref<GameViewport>({
    width: 750,
    height: 1334,
    scale: 1,
    centerX: 375,
    centerY: 667
  })

  function updateViewport() {
    const screen = getScreenInfo()
    const baseWidth = 750
    const baseHeight = 1334

    const scale = Math.min(
      screen.windowWidth / baseWidth,
      screen.windowHeight / baseHeight
    )

    viewport.value = {
      width: screen.windowWidth,
      height: screen.windowHeight,
      scale,
      centerX: screen.windowWidth / 2,
      centerY: screen.windowHeight / 2
    }
  }

  function adaptive(value: number): number {
    return Math.round(value * viewport.value.scale)
  }

  onMounted(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateViewport)
  })

  return {
    viewport,
    adaptive,
    updateViewport
  }
}