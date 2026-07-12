// 应用配置
export const APP_CONFIG = {
  // 开发模式配置
  dev: {
    skipBackendRequests: true,  // 跳过后端接口请求（开发模式）
    showMockDataWarning: true   // 显示模拟数据警告
  },

  // API配置
  api: {
    baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
    timeout: 10000,
    endpoints: {
      xtoken: '/auth/xtoken',
      role: '/auth/role', 
      version: '/system/version',
      moduleList: '/system/modules',
      modulesList2: '/system/modules2'
    }
  },
  
  // 特殊模块配置（只需要XToken接口的模块）
  specialModules: [
    'login',
    'register', 
    'reset-password',
    'guest-view',
    'public-page'
  ],
  
  // a3QualityMap模块配置（需要XToken和modulesList2接口）
  a3QualityMapModules: [
    'a3QualityMap'
  ],
  
  // 初始化配置
  init: {
    loadingMinTime: 500   // 最小加载时间(ms)，避免闪烁
  },

  // 模拟数据配置（开发模式使用）
  mockData: {
    xtoken: {
      token: 'mock_token_12345',
      expires: '2024-12-31T23:59:59Z'
    },
    role: {
      roles: ['admin', 'user'],
      permissions: ['read', 'write', 'delete', 'admin']
    },
    version: {
      version: '1.0.0-dev',
      buildTime: new Date().toISOString(),
      environment: 'development'
    },
    moduleList: {
      modules: [
        { id: 'dashboard', name: '仪表盘', enabled: true },
        { id: 'users', name: '用户管理', enabled: true },
        { id: 'settings', name: '系统设置', enabled: true },
        { id: 'reports', name: '报表分析', enabled: true },
        { id: 'logs', name: '日志管理', enabled: false }
      ]
    },
    modulesList2: {
      modules: [
        { id: 'qualityMap', name: '质量地图', enabled: true, type: 'a3' },
        { id: 'dataAnalysis', name: '数据分析', enabled: true, type: 'a3' },
        { id: 'monitoring', name: '监控面板', enabled: true, type: 'a3' },
        { id: 'alerts', name: '告警管理', enabled: false, type: 'a3' }
      ]
    }
  }
}

export default APP_CONFIG 