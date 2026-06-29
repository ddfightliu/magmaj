import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)
  
  function enterFullscreen() {
    const doc = document as any
    if (doc.documentElement.requestFullscreen) {
      doc.documentElement.requestFullscreen()
    } else if (doc.documentElement.webkitRequestFullscreen) {
      doc.documentElement.webkitRequestFullscreen()
    } else if (doc.documentElement.msRequestFullscreen) {
      doc.documentElement.msRequestFullscreen()
    }
  }
  
  function exitFullscreen() {
    const doc = document as any
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    }
  }
  
  function toggleFullscreen() {
    if (isFullscreen.value) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }
  
  function handleFullscreenChange() {
    const doc = document as any
    isFullscreen.value = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    )
  }
  
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
  })
  
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  })
  
  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}