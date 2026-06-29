export function getPlatform(): 'h5' | 'mp-weixin' | 'mp-qq' | 'app' | 'app-plus' {
  if (typeof uni !== 'undefined') {
    return uni.getSystemInfoSync().uniPlatform as any
  }
  return 'h5'
}

export function isH5(): boolean {
  return getPlatform() === 'h5'
}

export function isWechat(): boolean {
  return getPlatform() === 'mp-weixin'
}

export function isQQ(): boolean {
  return getPlatform() === 'mp-qq'
}

export function isApp(): boolean {
  return getPlatform() === 'app' || getPlatform() === 'app-plus'
}

export function getScreenInfo() {
  if (typeof uni !== 'undefined') {
    return uni.getSystemInfoSync()
  }
  return {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  }
}

export function rpxToPx(rpx: number): number {
  const screen = getScreenInfo()
  return (rpx * screen.windowWidth) / 750
}

export function pxToRpx(px: number): number {
  const screen = getScreenInfo()
  return (px * 750) / screen.windowWidth
}