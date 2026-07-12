/**
 * 开发工具集
 * 提供便捷的开发调试功能
 */

import { APP_CONFIG } from '../config/app'
import { switchTheme, getCurrentTheme, getAvailableThemes, resetTheme } from '../plugins/theme'
import { ROUTE_CONFIG } from '../config/routes'

/**
 * 获取路由守卫工具
 */
function getRouteGuard() {
  return window.routeGuard || {
    getState: () => ({ enabled: false, redirectCount: 0, maxRedirects: 5, lastRedirectTime: 0 }),
    setEnabled: () => console.warn('路由守卫尚未初始化'),
    reset: () => console.warn('路由守卫尚未初始化'),
    checkRoute: () => null,
    getRouteInfo: () => null,
    buildCorrectUrl: () => ''
  }
}

/**
 * 切换后端请求模式
 */
export function toggleBackendRequests() {
  const currentMode = APP_CONFIG.dev.skipBackendRequests
  APP_CONFIG.dev.skipBackendRequests = !currentMode
  
  const mode = APP_CONFIG.dev.skipBackendRequests ? '开发模式（模拟数据）' : '生产模式（真实接口）'
  console.log(`🔄 已切换到 ${mode}`)
  console.log('⚠️  请刷新页面使配置生效')
  
  return APP_CONFIG.dev.skipBackendRequests
}

/**
 * 切换主题
 */
export function toggleTheme(themeName) {
  if (themeName) {
    return switchTheme(themeName)
  } else {
    // 在light和dark之间切换
    const current = getCurrentTheme()
    const newTheme = current.isDark ? 'light' : 'dark'
    return switchTheme(newTheme)
  }
}

/**
 * 查看当前主题
 */
export function showCurrentTheme() {
  const theme = getCurrentTheme()
  console.group('🎨 当前主题信息')
  console.log('🏷️  主题名称:', theme.name)
  console.log('🔑 主题键值:', theme.name)
  console.log('🌙 是否暗黑:', theme.isDark)
  console.log('☀️  是否亮色:', theme.isLight)
  console.log('🎛️  主题配置:', theme.config)
  console.groupEnd()
}

/**
 * 查看所有可用主题
 */
export function showAvailableThemes() {
  const themes = getAvailableThemes()
  console.group('🎨 可用主题列表')
  themes.forEach(theme => {
    console.log(`${theme.current ? '✅' : '⭕'} ${theme.name} (${theme.key})`)
  })
  console.groupEnd()
}

/**
 * 查看当前配置
 */
export function showCurrentConfig() {
  console.group('📋 当前应用配置')
  console.log('🔧 开发模式:', APP_CONFIG.dev.skipBackendRequests ? '启用（使用模拟数据）' : '禁用（使用真实接口）')
  console.log('⚠️  显示警告:', APP_CONFIG.dev.showMockDataWarning)
  console.log('🔗 API地址:', APP_CONFIG.api.baseURL)
  console.log('⏱️  请求超时:', APP_CONFIG.api.timeout + 'ms')
  console.log('⏰ 最小加载时间:', APP_CONFIG.init.loadingMinTime + 'ms')
  console.log('📱 特殊模块:', APP_CONFIG.specialModules)
  
  // 显示主题信息
  const theme = getCurrentTheme()
  console.log('🎨 当前主题:', theme.name)
  
  // 显示路由守卫信息
  const routeGuard = getRouteGuard()
  const guardState = routeGuard.getState()
  console.log('🛡️  路由守卫:', guardState.enabled ? '启用' : '禁用')
  console.groupEnd()
}

/**
 * 查看模拟数据
 */
export function showMockData() {
  console.group('🎭 模拟数据预览')
  console.log('🔑 XToken:', APP_CONFIG.mockData.xtoken)
  console.log('👤 Role:', APP_CONFIG.mockData.role)
  console.log('📦 Version:', APP_CONFIG.mockData.version)
  console.log('📋 ModuleList:', APP_CONFIG.mockData.moduleList)
  console.groupEnd()
}

/**
 * 查看初始化数据
 */
export function showInitData() {
  const initData = window.__APP_INIT_DATA__
  if (initData) {
    console.group('🚀 应用初始化数据')
    console.log('📱 特殊模块模式:', initData.isSpecialModule)
    console.log('🔧 开发模式:', initData.isDevelopmentMode)
    if (initData.xtoken) console.log('🔑 XToken:', initData.xtoken)
    if (initData.role) console.log('👤 用户角色:', initData.role)
    if (initData.version) console.log('📦 系统版本:', initData.version)
    if (initData.moduleList) console.log('📋 模块列表:', initData.moduleList)
    console.groupEnd()
  } else {
    console.warn('❌ 应用尚未初始化或初始化失败')
  }
}

/**
 * 重新初始化应用
 */
export function reinitializeApp() {
  console.log('🔄 重新初始化应用...')
  window.location.reload()
}

/**
 * 测试主题切换动画
 */
export function testThemeAnimation() {
  console.log('🎬 开始主题切换动画测试...')
  
  const themes = ['light', 'dark']
  let index = 0
  
  const interval = setInterval(() => {
    switchTheme(themes[index])
    console.log(`🎨 切换到: ${themes[index]}`)
    index = (index + 1) % themes.length
    
    if (index === 0) {
      clearInterval(interval)
      console.log('✅ 主题切换动画测试完成')
    }
  }, 1500)
}

// ================================
// 路由守卫相关工具函数
// ================================

/**
 * 切换路由守卫启用状态
 */
export function toggleRouteGuard() {
  const routeGuard = getRouteGuard()
  const currentState = routeGuard.getState()
  const newState = !currentState.enabled
  routeGuard.setEnabled(newState)
  console.log(`🛡️  路由守卫已${newState ? '启用' : '禁用'}`)
  return newState
}

/**
 * 查看路由守卫状态
 */
export function showRouteGuardState() {
  const routeGuard = getRouteGuard()
  const state = routeGuard.getState()
  console.group('🛡️  路由守卫状态')
  console.log('✅ 启用状态:', state.enabled)
  console.log('🔄 重定向次数:', state.redirectCount)
  console.log('⏰ 上次重定向:', state.lastRedirectTime ? new Date(state.lastRedirectTime).toLocaleString() : '无')
  console.log('🚫 最大重定向次数:', state.maxRedirects)
  console.log('⏱️  冷却时间:', state.redirectCooldown + 'ms')
  console.groupEnd()
}

/**
 * 查看路由配置
 */
export function showRouteConfig() {
  console.group('🗺️  路由配置')
  console.log('🔧 守卫配置:', ROUTE_CONFIG.guard)
  console.log('📋 路由映射:', ROUTE_CONFIG.routeTabMapping)
  console.log('🔀 路由别名:', ROUTE_CONFIG.routeAliases)
  console.log('🎯 特殊路由:', ROUTE_CONFIG.specialRoutes)
  console.groupEnd()
}

/**
 * 测试路由检查
 */
export function testRouteCheck(path, tab) {
  const routeGuard = getRouteGuard()
  
  if (!path) {
    console.log('💡 用法: devTools.testRouteCheck("/path", "tab")')
    console.log('📝 示例:')
    console.log('  devTools.testRouteCheck("/a3QualityMap", "a3QualityMap") // 应该通过')
    console.log('  devTools.testRouteCheck("/a3QualityMap", "wrongTab") // 应该重定向')
    console.log('  devTools.testRouteCheck("/hr", "hr") // 应该重定向到humanResource')
    return
  }
  
  console.group(`🧪 测试路由检查: ${path}?tab=${tab}`)
  
  const redirectInfo = routeGuard.checkRoute(path, tab)
  const routeInfo = routeGuard.getRouteInfo(path)
  
  console.log('📍 当前路由:', { path, tab })
  console.log('⚙️  路由配置:', routeInfo)
  
  if (redirectInfo) {
    console.log('🔄 需要重定向:', redirectInfo)
    console.log('🎯 重定向原因:', redirectInfo.reason)
    const correctUrl = routeGuard.buildCorrectUrl(path, tab)
    console.log('✅ 正确URL:', correctUrl)
  } else {
    console.log('✅ 路由检查通过，无需重定向')
  }
  
  console.groupEnd()
}

/**
 * 重置路由守卫状态
 */
export function resetRouteGuard() {
  const routeGuard = getRouteGuard()
  routeGuard.reset()
  console.log('🔄 路由守卫状态已重置')
}

/**
 * 获取当前路由信息
 */
export function showCurrentRoute() {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  
  console.group('📍 当前路由信息')
  console.log('🛤️  路径:', path)
  console.log('🏷️  Tab参数:', tab)
  console.log('🔗 完整URL:', window.location.href)
  
  const routeGuard = getRouteGuard()
  const routeInfo = routeGuard.getRouteInfo(path)
  if (routeInfo) {
    console.log('⚙️  路由配置:', routeInfo)
    const redirectInfo = routeGuard.checkRoute(path, tab)
    if (redirectInfo) {
      console.log('⚠️  检测到问题:', redirectInfo)
    } else {
      console.log('✅ 路由状态正常')
    }
  } else {
    console.log('❓ 未找到路由配置')
  }
  
  console.groupEnd()
}

/**
 * 生成路由测试报告
 */
export function generateRouteReport() {
  console.group('📊 路由测试报告')
  
  const routes = Object.keys(ROUTE_CONFIG.routeTabMapping)
  console.log(`📝 共配置 ${routes.length} 个路由`)
  
  const routeGuard = getRouteGuard()
  
  routes.forEach(path => {
    const routeInfo = routeGuard.getRouteInfo(path)
    if (routeInfo) {
      const { config } = routeInfo
      console.group(`📍 ${path}`)
      console.log('🏷️  默认Tab:', config.defaultTab)
      console.log('✅ 允许的Tab:', config.allowedTabs)
      console.log('🔒 严格模式:', config.strict)
      if (config.tabAliases) {
        console.log('🔗 Tab别名:', config.tabAliases)
      }
      if (config.subModules) {
        console.log('📦 子模块:', Object.keys(config.subModules))
      }
      console.groupEnd()
    }
  })
  
  console.groupEnd()
}

/**
 * 在控制台注册开发工具
 */
export function registerDevTools() {
  if (process.env.NODE_ENV === 'development') {
    // 将工具函数挂载到 window 对象上，方便在控制台使用
    window.devTools = {
      // 后端请求相关
      toggleBackendRequests,
      showCurrentConfig,
      showMockData,
      showInitData,
      reinitializeApp,
      
      // 主题相关
      toggleTheme,
      showCurrentTheme,
      showAvailableThemes,
      resetTheme,
      testThemeAnimation,
      
      // 路由守卫相关
      toggleRouteGuard,
      showRouteGuardState,
      showRouteConfig,
      testRouteCheck,
      resetRouteGuard,
      showCurrentRoute,
      generateRouteReport,
      
      // 快捷方式
      light: () => switchTheme('light'),
      dark: () => switchTheme('dark'),
      
      help: () => {
        console.group('🛠️  开发工具帮助')
        console.log('%c📡 后端请求相关', 'font-weight: bold; color: #409eff;')
        console.log('devTools.toggleBackendRequests() - 切换后端请求模式')
        console.log('devTools.showCurrentConfig() - 查看当前配置')
        console.log('devTools.showMockData() - 查看模拟数据')
        console.log('devTools.showInitData() - 查看初始化数据')
        console.log('devTools.reinitializeApp() - 重新初始化应用')
        
        console.log('%c🎨 主题相关', 'font-weight: bold; color: #67c23a;')
        console.log('devTools.toggleTheme() - 切换主题')
        console.log('devTools.light() - 切换到亮色主题')
        console.log('devTools.dark() - 切换到暗黑主题')
        console.log('devTools.showCurrentTheme() - 查看当前主题')
        console.log('devTools.showAvailableThemes() - 查看所有可用主题')
        console.log('devTools.resetTheme() - 重置主题到默认')
        console.log('devTools.testThemeAnimation() - 测试主题切换动画')
        
        console.log('%c🛡️  路由守卫相关', 'font-weight: bold; color: #e6a23c;')
        console.log('devTools.toggleRouteGuard() - 切换路由守卫启用状态')
        console.log('devTools.showRouteGuardState() - 查看路由守卫状态')
        console.log('devTools.showRouteConfig() - 查看路由配置')
        console.log('devTools.testRouteCheck(path, tab) - 测试路由检查')
        console.log('devTools.resetRouteGuard() - 重置路由守卫状态')
        console.log('devTools.showCurrentRoute() - 查看当前路由信息')
        console.log('devTools.generateRouteReport() - 生成路由测试报告')
        
        console.log('%c🔧 直接访问', 'font-weight: bold; color: #f56c6c;')
        console.log('window.routeGuard.getState() - 直接访问路由守卫状态')
        console.log('window.routeGuard.checkRoute(path, tab) - 直接检查路由')
        console.log('window.routeGuard.setEnabled(true/false) - 直接控制守卫')
        
        console.log('%c❓ 其他', 'font-weight: bold; color: #909399;')
        console.log('devTools.help() - 显示此帮助信息')
        console.groupEnd()
      }
    }
    
    console.log(
      '%c🛠️  开发工具已加载',
      'color: #10b981; font-weight: bold; font-size: 14px;'
    )
    console.log(
      '%c在控制台输入 devTools.help() 查看可用命令',
      'color: #6b7280; font-size: 12px;'
    )
    console.log(
      '%c🛡️  路由守卫工具: devTools.showCurrentRoute() 或 window.routeGuard.getState()',
      'color: #f59e0b; font-size: 12px;'
    )
  }
}

export default {
  toggleBackendRequests,
  showCurrentConfig,
  showMockData,
  showInitData,
  reinitializeApp,
  registerDevTools,
  
  // 主题相关
  toggleTheme,
  showCurrentTheme,
  showAvailableThemes,
  testThemeAnimation,
  
  // 路由守卫相关
  toggleRouteGuard,
  showRouteGuardState,
  showRouteConfig,
  testRouteCheck,
  resetRouteGuard,
  showCurrentRoute,
  generateRouteReport
} 