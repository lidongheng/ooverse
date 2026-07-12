/**
 * 主题管理插件
 * 提供主题切换、检测、应用等功能
 */

import { THEME_CONFIG } from '../config/themes'
import { getCookie, setCookie } from './utils'

// 当前主题状态
let currentTheme = THEME_CONFIG.defaultTheme

/**
 * 获取URL中的主题参数
 */
function getThemeFromURL() {
  const urlParams = new URLSearchParams(window.location.search)
  const themeParam = urlParams.get('theme')
  
  // 验证主题参数是否有效
  if (themeParam && THEME_CONFIG.themes[themeParam]) {
    return themeParam
  }
  
  return null
}

/**
 * 获取Cookie中保存的主题
 */
function getThemeFromCookie() {
  const themeCookie = getCookie('app_theme')
  
  // 验证cookie中的主题是否有效
  if (themeCookie && THEME_CONFIG.themes[themeCookie]) {
    return themeCookie
  }
  
  return null
}

/**
 * 检测系统偏好的主题
 */
function getSystemPreferredTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * 确定要使用的主题
 * 优先级：URL参数 > Cookie > 系统偏好 > 默认主题
 */
function determineTheme() {
  // 1. 优先检查URL参数
  const urlTheme = getThemeFromURL()
  if (urlTheme) {
    console.log(`🎨 从URL参数获取主题: ${urlTheme}`)
    return urlTheme
  }
  
  // 2. 检查Cookie
  const cookieTheme = getThemeFromCookie()
  if (cookieTheme) {
    console.log(`🍪 从Cookie获取主题: ${cookieTheme}`)
    return cookieTheme
  }
  
  // 3. 检查系统偏好
  const systemTheme = getSystemPreferredTheme()
  console.log(`🖥️  使用系统偏好主题: ${systemTheme}`)
  return systemTheme
}

/**
 * 应用主题到DOM
 */
function applyTheme(themeName) {
  const theme = THEME_CONFIG.themes[themeName]
  if (!theme) {
    console.error(`❌ 主题 "${themeName}" 不存在`)
    return false
  }
  
  const root = document.documentElement
  
  // 应用CSS变量
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  // 设置data-theme属性，方便CSS选择器使用
  root.setAttribute('data-theme', themeName)
  
  // 设置class，兼容一些组件库
  root.classList.remove('theme-light', 'theme-dark')
  root.classList.add(`theme-${themeName}`)
  
  // 更新当前主题状态
  currentTheme = themeName
  
  // 保存到Cookie（如果不是来自URL参数）
  const urlTheme = getThemeFromURL()
  if (!urlTheme) {
    setCookie('app_theme', themeName, { expires: 365 }) // 保存一年
  }
  
  console.log(`✅ 主题已应用: ${theme.name} (${themeName})`)
  return true
}

/**
 * 切换主题
 */
export function switchTheme(themeName) {
  if (!themeName) {
    // 如果没有指定主题，在light和dark之间切换
    themeName = currentTheme === 'light' ? 'dark' : 'light'
  }
  
  const success = applyTheme(themeName)
  if (success) {
    // 触发主题切换事件
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: themeName,
        themeConfig: THEME_CONFIG.themes[themeName]
      }
    })
    window.dispatchEvent(event)
  }
  
  return success
}

/**
 * 获取当前主题
 */
export function getCurrentTheme() {
  return {
    name: currentTheme,
    config: THEME_CONFIG.themes[currentTheme],
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  }
}

/**
 * 获取主题颜色值
 */
export function getThemeColor(colorKey, themeName = currentTheme) {
  const theme = THEME_CONFIG.themes[themeName]
  if (!theme) return null
  
  return theme.colors[colorKey] || null
}

/**
 * 监听系统主题变化
 */
function watchSystemTheme() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    mediaQuery.addEventListener('change', (e) => {
      // 只有在没有URL参数和Cookie的情况下才跟随系统
      const urlTheme = getThemeFromURL()
      const cookieTheme = getThemeFromCookie()
      
      if (!urlTheme && !cookieTheme) {
        const systemTheme = e.matches ? 'dark' : 'light'
        console.log(`🔄 系统主题变化，切换到: ${systemTheme}`)
        switchTheme(systemTheme)
      }
    })
  }
}

/**
 * 初始化主题系统
 */
export function initializeTheme() {
  console.log('🎨 初始化主题系统...')
  
  // 确定要使用的主题
  const selectedTheme = determineTheme()
  
  // 应用主题
  applyTheme(selectedTheme)
  
  // 监听系统主题变化
  watchSystemTheme()
  
  console.log(`🎨 主题系统初始化完成，当前主题: ${selectedTheme}`)
  
  return selectedTheme
}

/**
 * 获取所有可用主题
 */
export function getAvailableThemes() {
  return Object.keys(THEME_CONFIG.themes).map(key => ({
    key,
    name: THEME_CONFIG.themes[key].name,
    current: key === currentTheme
  }))
}

/**
 * 重置主题到默认
 */
export function resetTheme() {
  const defaultTheme = THEME_CONFIG.defaultTheme
  console.log(`🔄 重置到默认主题: ${defaultTheme}`)
  
  // 清除Cookie
  setCookie('app_theme', '', { expires: -1 })
  
  // 应用默认主题
  return switchTheme(defaultTheme)
}

/**
 * 为组件提供的主题工具函数
 */
export const themeUtils = {
  // 判断是否为暗黑主题
  isDark: () => currentTheme === 'dark',
  
  // 判断是否为亮色主题
  isLight: () => currentTheme === 'light',
  
  // 获取当前主题名称
  getCurrentThemeName: () => currentTheme,
  
  // 获取主题颜色
  getColor: (colorKey) => getThemeColor(colorKey),
  
  // 根据主题返回不同的值
  getValueByTheme: (lightValue, darkValue) => {
    return currentTheme === 'dark' ? darkValue : lightValue
  }
}

/**
 * Vue插件安装函数
 */
export function setupTheme(app) {
  // 初始化主题
  initializeTheme()
  
  // 在Vue应用中提供主题相关的全局属性
  app.config.globalProperties.$theme = {
    switch: switchTheme,
    current: getCurrentTheme,
    getColor: getThemeColor,
    utils: themeUtils,
    available: getAvailableThemes,
    reset: resetTheme
  }
  
  // 提供全局状态
  app.provide('theme', {
    switchTheme,
    getCurrentTheme,
    getThemeColor,
    themeUtils,
    getAvailableThemes,
    resetTheme
  })
}

export default {
  initializeTheme,
  setupTheme,
  switchTheme,
  getCurrentTheme,
  getThemeColor,
  themeUtils,
  getAvailableThemes,
  resetTheme
} 