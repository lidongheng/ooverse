/**
 * REM 适配骨架：以 1920px 设计稿和 16px 根字号为基准。
 */
const documentElement = document.documentElement
const resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize'

const recalculateRootFontSize = () => {
  const clientWidth = documentElement.clientWidth

  if (!clientWidth) {
    return
  }

  const designWidth = 1920
  const baseFontSize = 16
  const fontSize = (clientWidth / designWidth) * baseFontSize

  documentElement.style.fontSize = `${fontSize}px`
}

window.addEventListener(resizeEvent, recalculateRootFontSize, false)
document.addEventListener('DOMContentLoaded', recalculateRootFontSize, false)
recalculateRootFontSize()
