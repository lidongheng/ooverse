/**
 * 路由守卫配置文件
 * 定义路径和tab参数的映射关系，确保路由一致性
 */

export const ROUTE_CONFIG = {
  // 路由守卫配置
  guard: {
    enabled: true,              // 是否启用路由守卫
    redirectMode: 'replace',    // 重定向模式: 'replace' | 'push'
    fallbackRoute: '/',         // 默认回退路由
    logMismatch: true           // 是否记录不匹配的日志
  },

  // 路径和tab参数的映射关系
  routeTabMapping: {
    // 简单映射：路径和tab参数相同
    '/a3QualityMap': {
      defaultTab: 'a3QualityMap',      // 默认tab
      allowedTabs: ['a3QualityMap'],   // 允许的tab值
      strict: true                     // 严格模式：必须完全匹配
    },

    // 别名映射：路径和tab参数不同但有对应关系
    '/hr': {
      defaultTab: 'humanResource',
      allowedTabs: ['humanResource', 'hr'], // 允许多个tab值
      tabAliases: {
        'hr': 'humanResource'          // tab别名映射
      },
      strict: false
    },

    // 多模块映射：一个路径下有多个子模块
    '/globalNew': {
      defaultTab: 'a',                 // 默认tab
      allowedTabs: ['a', 'b', 'c'],    // 允许的tab值列表
      strict: true,
      subModules: {
        'a': { name: '全球模块A', description: '全球模块A的描述' },
        'b': { name: '全球模块B', description: '全球模块B的描述' },
        'c': { name: '全球模块C', description: '全球模块C的描述' }
      }
    },

    // 复杂映射示例
    '/dashboard': {
      defaultTab: 'overview',
      allowedTabs: ['overview', 'analytics', 'reports'],
      tabAliases: {
        'main': 'overview',
        'stats': 'analytics'
      },
      strict: false
    },

    // 动态路由示例
    '/project': {
      defaultTab: 'list',
      allowedTabs: ['list', 'create', 'edit', 'detail'],
      strict: false,
      dynamic: true,  // 支持动态子路径
      pathPattern: '/project/:id?' // 路径模式
    }
  },

  // 特殊路由配置（不需要tab参数的路由）
  specialRoutes: [
    '/',
    '/roleSelect',
    '/costOperation',
    '/saleHome',
    '/saleDetail',
    '/noPermission',
    '/noPermissionTest',
    '/login',
    '/register',
    '/404',
    '/403',
    '/500'
  ],

  // 路由别名配置
  routeAliases: {
    '/home': '/costOperation',
    '/main': '/dashboard?tab=overview'
  }
}

/**
 * 获取路由配置
 * @param {string} path - 路径
 * @returns {object|null} 路由配置
 */
export function getRouteConfig(path) {
  // 处理动态路由
  for (const [routePath, config] of Object.entries(ROUTE_CONFIG.routeTabMapping)) {
    if (config.dynamic && config.pathPattern) {
      const pattern = config.pathPattern.replace(/:[\w]+\??/g, '[^/]*')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(path)) {
        return { path: routePath, config }
      }
    }
  }

  // 精确匹配
  const config = ROUTE_CONFIG.routeTabMapping[path]
  return config ? { path, config } : null
}

/**
 * 检查路径是否为特殊路由
 * @param {string} path - 路径
 * @returns {boolean}
 */
export function isSpecialRoute(path) {
  return ROUTE_CONFIG.specialRoutes.includes(path)
}

/**
 * 解析tab别名
 * @param {string} tab - tab参数值
 * @param {object} config - 路由配置
 * @returns {string} 解析后的tab值
 */
export function resolveTabAlias(tab, config) {
  if (!config.tabAliases || !tab) return tab
  return config.tabAliases[tab] || tab
}

/**
 * 验证tab参数是否有效
 * @param {string} tab - tab参数值
 * @param {object} config - 路由配置
 * @returns {boolean}
 */
export function isValidTab(tab, config) {
  if (!config.allowedTabs) return true
  
  const resolvedTab = resolveTabAlias(tab, config)
  return config.allowedTabs.includes(resolvedTab)
}

/**
 * 构建标准化的路由
 * @param {string} path - 路径
 * @param {string} tab - tab参数
 * @param {object} query - 其他查询参数
 * @returns {object} 标准化的路由对象
 */
export function buildNormalizedRoute(path, tab, query = {}) {
  const routeConfig = getRouteConfig(path)
  
  if (!routeConfig) {
    return { path, query: { ...query, ...(tab && { tab }) } }
  }

  const { config } = routeConfig
  const normalizedTab = tab ? resolveTabAlias(tab, config) : config.defaultTab
  
  return {
    path,
    query: {
      ...query,
      tab: normalizedTab
    }
  }
}

/**
 * 检查路由是否需要重定向
 * @param {string} path - 当前路径
 * @param {string} tab - 当前tab参数
 * @returns {object|null} 重定向信息或null
 */
export function checkRouteRedirect(path, tab) {
  // 检查路由别名
  const aliasTarget = ROUTE_CONFIG.routeAliases[path]
  if (aliasTarget) {
    const url = new URL(aliasTarget, 'http://localhost')
    return {
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      reason: 'alias'
    }
  }

  // 检查特殊路由
  if (isSpecialRoute(path)) {
    return null // 特殊路由不需要检查
  }

  const routeConfig = getRouteConfig(path)
  
  // 路径没有配置，不进行重定向
  if (!routeConfig) {
    if (ROUTE_CONFIG.guard.logMismatch) {
      console.warn(`[路由守卫] 未找到路径 "${path}" 的配置`)
    }
    return null
  }

  const { config } = routeConfig
  
  // 没有tab参数，使用默认值
  if (!tab) {
    return {
      path,
      query: { tab: config.defaultTab },
      reason: 'missing_tab'
    }
  }

  // 解析tab别名
  const resolvedTab = resolveTabAlias(tab, config)
  
  // 检查tab是否有效
  if (!isValidTab(tab, config)) {
    return {
      path,
      query: { tab: config.defaultTab },
      reason: 'invalid_tab'
    }
  }

  // 如果tab被解析为别名，需要重定向到标准tab
  if (resolvedTab !== tab) {
    return {
      path,
      query: { tab: resolvedTab },
      reason: 'alias_resolution'
    }
  }

  // 严格模式下检查精确匹配
  if (config.strict && !config.allowedTabs.includes(tab)) {
    return {
      path,
      query: { tab: config.defaultTab },
      reason: 'strict_mismatch'
    }
  }

  return null // 无需重定向
}

export default ROUTE_CONFIG 
