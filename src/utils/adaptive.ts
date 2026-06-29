import { getScreenInfo, isH5 } from './platform'

export interface AdaptiveConfig {
  baseWidth: number
  baseHeight: number
  safeAreaTop: number
  safeAreaBottom: number
  scale: number
}

export function getAdaptiveConfig(): AdaptiveConfig {
  const screen = getScreenInfo()
  const baseWidth = 750
  const baseHeight = 1334
  
  const scale = Math.min(
    screen.windowWidth / baseWidth,
    screen.windowHeight / baseHeight
  )
  
  let safeAreaTop = 0
  let safeAreaBottom = 0
  
  if (typeof uni !== 'undefined') {
    const info = uni.getSystemInfoSync()
    safeAreaTop = info.statusBarHeight || 0
    safeAreaBottom = info.safeAreaInsets?.bottom || 0
  }
  
  return {
    baseWidth,
    baseHeight,
    safeAreaTop,
    safeAreaBottom,
    scale
  }
}

export function adaptiveSize(size: number): number {
  const config = getAdaptiveConfig()
  return Math.round(size * config.scale)
}

export function getSafeAreaStyle(): Record<string, string> {
  const config = getAdaptiveConfig()
  return {
    paddingTop: `${config.safeAreaTop}px`,
    paddingBottom: `${config.safeAreaBottom}px`
  }
}

export function getFullScreenStyle(): Record<string, string> {
  const screen = getScreenInfo()
  return {
    width: `${screen.windowWidth}px`,
    height: `${screen.windowHeight}px`
  }
}

export function useAdaptiveCanvas(canvas: HTMLCanvasElement) {
  const screen = getScreenInfo()
  const dpr = screen.pixelRatio || 1
  
  canvas.width = screen.windowWidth * dpr
  canvas.height = screen.windowHeight * dpr
  canvas.style.width = `${screen.windowWidth}px`
  canvas.style.height = `${screen.windowHeight}px`
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
  
  return { ctx, width: screen.windowWidth, height: screen.windowHeight }
}