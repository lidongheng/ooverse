import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '../views/Index.vue'
import commonComputerPower from '../views/commonComputerPower.vue'
import generalComputeView from '../views/generalComputeView.vue'
import PLAnalysis from '../views/P&LAnalysis.vue'
import { ROUTE_CONFIG, checkRouteRedirect, getRouteConfig } from '../config/routes'
import profitLossTrendPage from '../views/profitLossTrendPage.vue'
import aiComputeView from '../views/aiComputeView.vue'
import lifecycleTrend from '../views/lifecycleTrend.vue'
import saleHome from '../views/saleView/saleHome/index.vue'
import RoleSelect from '../views/RoleSelect.vue'
import GlobalLayout from '@/components/home/GlobalLayout.vue'
import SaleDetail from '../views/saleView/saleDetail/index.vue'
import NoPermission from '../views/noPermission/index.vue'
import NoPermissionTest from '../views/noPermissionTest/index.vue'
import Unauthorized from '../views/noPermission/noDataAuth.vue'

const routes = [
  {
    path: '/roleSelect',
    name: 'roleSelect',
    component: RoleSelect
  },
  {
    path: '/',
    name: '主页',
    component: GlobalLayout,
    redirect: '/roleSelect',
    children: [
      {
        path: '/costOperation',
        name: 'home',
        component: Index
      },
      {
        path: '/generalCompute',
        name: 'generalCompute',
        component: generalComputeView
      },
      {
        path: '/aiCompute',
        name: 'aiCompute',
        component: aiComputeView
      },
      {
        path: '/saleHome',
        name: 'saleHome',
        component: saleHome,
      },
      {
        path: '/saleDetail',
        name: 'saleDetail',
        component: SaleDetail,
      },
      {
        path: '/noPermissionTest',
        name: 'noPermissionTest',
        component: NoPermissionTest,
      }
    ]
  },
  {
    path: '/noPermission',
    name: 'noPermission',
    component: NoPermission
  },
  {
    path: '/Unauthorized',
    name: 'unauthorized',
    component: Unauthorized
  },

  {
    path: '/commonComputerPower',
    name: 'commonComputerPower',
    component: commonComputerPower
  },

  {
    path: '/PLAnalysis',
    name: 'PLAnalysis',
    component: PLAnalysis
  },
  {
    path: '/example',
    name: 'example',
    component: () => import('../components/ExampleUsage.vue')
  },
  {
    path: '/theme-demo',
    name: 'themeDemo',
    component: () => import('../components/ThemeDemo.vue')
  },
  {
    path: '/route-guard-demo',
    name: 'routeGuardDemo',
    component: () => import('../components/RouteGuardDemo.vue')
  },
  {
    path: '/postcss-demo',
    name: 'postcssDemo',
    component: () => import('../components/PostcssDemo.vue')
  },
  {
    path: '/profitLossTrend',
    name: 'profitLossTrend',
    component: profitLossTrendPage
  },

  {
    path: '/lifecycleTrend',
    name: 'lifecycleTrend',
    component: lifecycleTrend
  },
  // 路由守卫测试路由
  {
    path: '/a3QualityMap',
    name: 'a3QualityMap',
    component: () => import('../components/ExampleUsage.vue'),
    meta: { requiresTab: true, title: 'A3质量地图' }
  },
  {
    path: '/hr',
    name: 'hr',
    component: () => import('../components/ExampleUsage.vue'),
    meta: { requiresTab: true, title: '人力资源' }
  },
  {
    path: '/globalNew',
    name: 'globalNew',
    component: () => import('../components/ExampleUsage.vue'),
    meta: { requiresTab: true, title: '全球模块' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../components/ExampleUsage.vue'),
    meta: { requiresTab: true, title: '仪表板' }
  },
  {
    path: '/project/:id?',
    name: 'project',
    component: () => import('../components/ExampleUsage.vue'),
    meta: { requiresTab: true, title: '项目管理' }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ================================
// 路由守卫系统
// ================================

/**
 * 路由守卫状态
 */
const guardState = {
  enabled: ROUTE_CONFIG.guard.enabled,
  redirectCount: 0,           // 重定向计数
  maxRedirects: 5,           // 最大重定向次数，防止无限重定向
  lastRedirectTime: 0,       // 上次重定向时间
  redirectCooldown: 1000     // 重定向冷却时间(ms)
}

/**
 * 记录路由守卫日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {object} data - 额外数据
 */
function logGuard(level, message, data = {}) {
  if (!ROUTE_CONFIG.guard.logMismatch) return

  const timestamp = new Date().toISOString()
  const logData = { timestamp, ...data }

  console[level](`[路由守卫] ${message}`, logData)
}

/**
 * 检查是否可以进行重定向
 * @returns {boolean}
 */
function canRedirect() {
  const now = Date.now()

  // 检查重定向次数限制
  if (guardState.redirectCount >= guardState.maxRedirects) {
    logGuard('error', '重定向次数超过限制，停止重定向', {
      count: guardState.redirectCount,
      max: guardState.maxRedirects
    })
    return false
  }

  // 检查冷却时间
  if (now - guardState.lastRedirectTime < guardState.redirectCooldown) {
    logGuard('warn', '重定向冷却中，跳过本次重定向')
    return false
  }

  return true
}

/**
 * 重置重定向计数
 */
function resetRedirectCount() {
  guardState.redirectCount = 0
}

/**
 * 前置路由守卫
 * @param {object} to - 目标路由
 * @param {object} from - 源路由
 * @param {function} next - next函数
 */
function beforeEachGuard(to, from, next) {
  if (!guardState.enabled) {
    next()
    return
  }

  const path = to.path
  const tab = to.query.tab
  const otherQuery = { ...to.query }
  delete otherQuery.tab

  logGuard('debug', '路由守卫检查开始', {
    path,
    tab,
    fullPath: to.fullPath
  })

  // 检查是否需要重定向
  const redirectInfo = checkRouteRedirect(path, tab)

  if (redirectInfo) {
    // 检查是否可以重定向
    if (!canRedirect()) {
      next()
      return
    }

    // 更新重定向状态
    guardState.redirectCount++
    guardState.lastRedirectTime = Date.now()

    logGuard('info', '检测到路由不一致，准备重定向', {
      reason: redirectInfo.reason,
      current: { path, tab },
      target: redirectInfo,
      count: guardState.redirectCount
    })

    // 构建完整的重定向路由
    const redirectRoute = {
      path: redirectInfo.path,
      query: { ...redirectInfo.query, ...otherQuery }
    }

    next(redirectRoute)
    return
  }

  // 路由检查通过，重置重定向计数
  resetRedirectCount()

  logGuard('debug', '路由守卫检查通过', { path, tab })
  next()
}

/**
 * 后置路由守卫
 * @param {object} to - 目标路由
 * @param {object} from - 源路由
 */
function afterEachGuard(to, from) {
  if (!guardState.enabled) return

  const path = to.path
  const tab = to.query.tab

  // 记录路由变化
  logGuard('debug', '路由变化完成', {
    from: from.fullPath,
    to: to.fullPath,
    path,
    tab
  })

  // 验证最终路由的有效性
  const routeConfig = getRouteConfig(path)
  if (routeConfig && tab) {
    const { config } = routeConfig
    if (config.allowedTabs && !config.allowedTabs.includes(tab)) {
      logGuard('warn', '路由到达了不匹配的tab', {
        path,
        tab,
        allowedTabs: config.allowedTabs
      })
    }
  }
}

/**
 * 路由守卫工具函数
 */
export const routeGuardUtils = {
  /**
   * 启用/禁用路由守卫
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    guardState.enabled = enabled
    logGuard('info', `路由守卫${enabled ? '启用' : '禁用'}`)
  },

  /**
   * 获取路由守卫状态
   * @returns {object}
   */
  getState() {
    return { ...guardState }
  },

  /**
   * 重置守卫状态
   */
  reset() {
    guardState.redirectCount = 0
    guardState.lastRedirectTime = 0
    logGuard('info', '路由守卫状态已重置')
  },

  /**
   * 手动检查路由
   * @param {string} path
   * @param {string} tab
   * @returns {object|null}
   */
  checkRoute(path, tab) {
    return checkRouteRedirect(path, tab)
  },

  /**
   * 获取路由配置信息
   * @param {string} path
   * @returns {object|null}
   */
  getRouteInfo(path) {
    return getRouteConfig(path)
  },

  /**
   * 构建正确的路由URL
   * @param {string} path
   * @param {string} tab
   * @param {object} query
   * @returns {string}
   */
  buildCorrectUrl(path, tab, query = {}) {
    const redirectInfo = checkRouteRedirect(path, tab)
    if (redirectInfo) {
      const params = new URLSearchParams({ ...redirectInfo.query, ...query })
      return `${redirectInfo.path}?${params.toString()}`
    }

    const params = new URLSearchParams({ tab, ...query })
    return `${path}?${params.toString()}`
  }
}

/**
 * 初始化路由守卫
 */
function initializeRouteGuard() {
  logGuard('info', '路由守卫初始化', {
    enabled: guardState.enabled,
    config: ROUTE_CONFIG.guard
  })

  // 注册前置守卫
  router.beforeEach(beforeEachGuard)

  // 注册后置守卫
  router.afterEach(afterEachGuard)

  // 错误处理
  router.onError((error) => {
    logGuard('error', '路由错误', { error: error.message, stack: error.stack })
  })

  // 将工具函数挂载到全局
  if (typeof window !== 'undefined') {
    window.routeGuard = routeGuardUtils
  }

  console.log('✅ 路由守卫已安装')
}

// 初始化路由守卫
initializeRouteGuard()

export default router
