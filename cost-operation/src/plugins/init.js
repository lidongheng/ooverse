import axios from 'axios'
import { getCookie } from './utils'
import { APP_CONFIG } from '../config/app'

// 创建axios实例
const api = axios.create({
  baseURL: APP_CONFIG.api.baseURL,
  timeout: APP_CONFIG.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 确保每个请求都有 Content-Type
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    // 添加通用请求头
    const token = getCookie('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 带token的请求函数
 */
async function requestWithToken(endpoint, options = {}) {
  const {
    method = 'GET',
    token = null,
    data = null,
    params = null
  } = options

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // 如果提供了token，添加到请求头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 如果有查询参数，添加到config
  if (params) {
    config.params = params
  }

  // 根据HTTP方法调用对应的axios方法
  const httpMethod = method.toLowerCase()

  switch (httpMethod) {
    case 'get':
      return api.get(endpoint, config)
    case 'post':
      return api.post(endpoint, data, config)
    case 'put':
      return api.put(endpoint, data, config)
    case 'patch':
      return api.patch(endpoint, data, config)
    case 'delete':
      return api.delete(endpoint, config)
    default:
      throw new Error(`不支持的HTTP方法: ${method}`)
  }
}

export { api, requestWithToken }

/**
 * 模拟请求延迟
 */
async function simulateRequestDelay(min = 300, max = 800) {
  const delay = Math.random() * (max - min) + min
  await new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 请求XToken接口
 */
async function fetchXToken() {
  try {
    let response
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      // 开发模式：使用模拟数据
      await simulateRequestDelay()
      response = APP_CONFIG.mockData.xtoken
      console.log('🚀 [开发模式] 使用模拟 XToken 数据')
    } else {
      // 生产模式：请求真实接口
      response = await api.get(APP_CONFIG.api.endpoints.xtoken)
    }
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'XToken接口请求失败'
    }
  }
}

/**
 * 请求Role接口
 */
async function fetchRole(token = null) {
  try {
    let response
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      // 开发模式：使用模拟数据
      await simulateRequestDelay()
      response = APP_CONFIG.mockData.role
      console.log('🚀 [开发模式] 使用模拟 Role 数据')
    } else {
      // 生产模式：请求真实接口
      response = await requestWithToken(APP_CONFIG.api.endpoints.role, {
        method: 'GET',
        token: token
      })
    }
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Role接口请求失败'
    }
  }
}

/**
 * 请求Version接口
 */
async function fetchVersion(token = null) {
  try {
    let response
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      // 开发模式：使用模拟数据
      await simulateRequestDelay()
      response = APP_CONFIG.mockData.version
      console.log('🚀 [开发模式] 使用模拟 Version 数据')
    } else {
      // 生产模式：请求真实接口
      response = await requestWithToken(APP_CONFIG.api.endpoints.version, {
        method: 'GET',
        token: token
      })
    }
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Version接口请求失败'
    }
  }
}

/**
 * 请求moduleList接口
 */
async function fetchModuleList(token = null) {
  try {
    let response
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      // 开发模式：使用模拟数据
      await simulateRequestDelay()
      response = APP_CONFIG.mockData.moduleList
      console.log('🚀 [开发模式] 使用模拟 ModuleList 数据')
    } else {
      // 生产模式：请求真实接口
      response = await requestWithToken(APP_CONFIG.api.endpoints.moduleList, {
        method: 'GET',
        token: token
      })
    }
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'ModuleList接口请求失败'
    }
  }
}

/**
 * 请求modulesList2接口
 */
async function fetchModulesList2(token = null) {
  try {
    let response
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      // 开发模式：使用模拟数据
      await simulateRequestDelay()
      response = APP_CONFIG.mockData.modulesList2
      console.log('🚀 [开发模式] 使用模拟 ModulesList2 数据')
    } else {
      // 生产模式：请求真实接口
      response = await requestWithToken(APP_CONFIG.api.endpoints.modulesList2, {
        method: 'GET',
        token: token
      })
    }
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'ModulesList2接口请求失败'
    }
  }
}

/**
 * 获取URL查询参数和路径
 */
function getUrlInfo() {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    tab: urlParams.get('tab'),
    pathname: window.location.pathname,
    hash: window.location.hash
  }
}

/**
 * 检查是否为特殊模块
 */
function isSpecialModule(tab) {
  return tab && APP_CONFIG.specialModules.includes(tab)
}

/**
 * 检查是否为a3QualityMap模块
 */
function isA3QualityMapModule(pathname, hash) {
  // 优先检查hash路由（Vue hash模式）
  if (hash && hash.includes('a3QualityMap')) {
    return true
  }
  // 备用检查pathname（普通模式）
  return pathname && pathname.includes('a3QualityMap')
}

/**
 * 处理XToken数据
 */
function processXTokenData(data) {
  if (!data || !data.token) {
    throw new Error('XToken数据格式错误')
  }
  
  console.log('✅ XToken获取成功，将用于后续接口认证')
  
  return {
    token: data.token,
    expires: data.expires
  }
}

/**
 * 处理Role数据
 */
function processRoleData(data) {
  if (!data || !Array.isArray(data.roles)) {
    throw new Error('Role数据格式错误')
  }
  
  // 保存用户角色信息
  const userRoles = data.roles
  const permissions = data.permissions || []
  
  return {
    roles: userRoles,
    permissions,
    isAdmin: userRoles.includes('admin')
  }
}

/**
 * 处理Version数据
 */
function processVersionData(data) {
  if (!data || !data.version) {
    throw new Error('Version数据格式错误')
  }
  
  return {
    version: data.version,
    buildTime: data.buildTime,
    environment: data.environment || 'production'
  }
}

/**
 * 处理ModuleList数据
 */
function processModuleListData(data) {
  if (!data || !Array.isArray(data.modules)) {
    throw new Error('ModuleList数据格式错误')
  }
  
  const enabledModules = data.modules.filter(module => module.enabled)
  
  return {
    modules: data.modules,
    enabledModules,
    moduleCount: enabledModules.length
  }
}

/**
 * 处理ModulesList2数据
 */
function processModulesList2Data(data) {
  if (!data || !Array.isArray(data.modules)) {
    throw new Error('ModulesList2数据格式错误')
  }
  
  const enabledModules = data.modules.filter(module => module.enabled)
  
  return {
    modules: data.modules,
    enabledModules,
    moduleCount: enabledModules.length
  }
}

/**
 * 验证初始化数据
 */
function validateInitData(initData) {
  const { xtoken, role, version, moduleList, modulesList2, isSpecialModule, isA3QualityMapModule } = initData
  
  // XToken必须存在
  if (!xtoken || !xtoken.token) {
    throw new Error('XToken验证失败')
  }
  
  // 如果是a3QualityMap模块，需要验证modulesList2数据
  if (isA3QualityMapModule) {
    if (!modulesList2 || !modulesList2.enabledModules || modulesList2.enabledModules.length === 0) {
      throw new Error('ModulesList2验证失败')
    }
  }
  // 如果不是特殊模块且不是a3QualityMap模块，需要验证其他数据
  else if (!isSpecialModule) {
    if (!role || !role.roles || role.roles.length === 0) {
      throw new Error('用户角色验证失败')
    }
    
    if (!version || !version.version) {
      throw new Error('系统版本验证失败')
    }
    
    if (!moduleList || !moduleList.enabledModules || moduleList.enabledModules.length === 0) {
      throw new Error('模块列表验证失败')
    }
  }
  
  return true
}

/**
 * 显示开发模式警告
 */
function showDevModeWarning() {
  if (APP_CONFIG.dev.skipBackendRequests && APP_CONFIG.dev.showMockDataWarning) {
    console.warn(
      '%c🚧 开发模式警告',
      'color: #ff6b35; font-size: 16px; font-weight: bold;',
      '\n当前使用模拟数据，后端接口请求已跳过。\n要启用真实接口，请修改 src/config/app.js 中的 dev.skipBackendRequests 为 false'
    )
  }
}

/**
 * 应用初始化函数
 */
export async function initializeApp() {
  const startTime = Date.now()
  
  try {
    console.log('开始应用初始化...')
    
    // 显示开发模式警告
    showDevModeWarning()
    
    // 获取URL信息
    const urlInfo = getUrlInfo()
    const isSpecial = isSpecialModule(urlInfo.tab)
    const isA3Quality = isA3QualityMapModule(urlInfo.pathname, urlInfo.hash)
    
    console.log(`检测到URL路径: ${urlInfo.pathname}, Hash: ${urlInfo.hash}, tab参数: ${urlInfo.tab}`)
    console.log(`特殊模块: ${isSpecial}, A3质量地图模块: ${isA3Quality}`)
    
    if (APP_CONFIG.dev.skipBackendRequests) {
      console.log('🚀 [开发模式] 跳过后端接口请求，使用模拟数据')
    }
    
    let initData = {
      isSpecialModule: isSpecial,
      isA3QualityMapModule: isA3Quality,
      isDevelopmentMode: APP_CONFIG.dev.skipBackendRequests
    }
    
    // 第一步：始终先请求XToken接口
    console.log('步骤1: 请求XToken接口...')
    const xtokenResult = await fetchXToken()
    
    if (!xtokenResult.success) {
      throw new Error(xtokenResult.error)
    }
    
    // 处理XToken数据，获取token变量
    initData.xtoken = processXTokenData(xtokenResult.data)
    const token = initData.xtoken.token // 保存token到变量中
    
    console.log('✅ XToken获取成功，token已准备用于后续接口')
    
    // 第二步：根据模块类型请求其他接口，使用token进行认证
    if (isA3Quality) {
      // a3QualityMap模块需要请求modulesList2
      console.log('步骤2: 请求ModulesList2接口（使用XToken认证）...')
      
      const modulesList2Result = await fetchModulesList2(token)
      
      if (!modulesList2Result.success) {
        throw new Error(modulesList2Result.error)
      }
      
      initData.modulesList2 = processModulesList2Data(modulesList2Result.data)
      
    } else if (isSpecial) {
      // 特殊模块只需要XToken，无需请求其他接口
      console.log('步骤2: 特殊模块，跳过其他接口请求')
      
    } else {
      // 普通模式需要并行请求Role、Version、ModuleList接口
      console.log('步骤2: 并行请求Role、Version、ModuleList接口（使用XToken认证）...')
      
      const [roleResult, versionResult, moduleListResult] = await Promise.all([
        fetchRole(token),
        fetchVersion(token),
        fetchModuleList(token)
      ])
      
      // 检查所有请求是否成功
      const results = [
        { name: 'Role', result: roleResult },
        { name: 'Version', result: versionResult },
        { name: 'ModuleList', result: moduleListResult }
      ]
      
      const failedRequests = results.filter(r => !r.result.success)
      if (failedRequests.length > 0) {
        const errors = failedRequests.map(r => `${r.name}: ${r.result.error}`).join(', ')
        throw new Error(`接口请求失败: ${errors}`)
      }
      
      // 处理数据
      initData.role = processRoleData(roleResult.data)
      initData.version = processVersionData(versionResult.data)
      initData.moduleList = processModuleListData(moduleListResult.data)
    }
    
    // 验证数据
    validateInitData(initData)
    
    // 确保最小加载时间，避免闪烁
    const elapsedTime = Date.now() - startTime
    if (elapsedTime < APP_CONFIG.init.loadingMinTime) {
      await new Promise(resolve => 
        setTimeout(resolve, APP_CONFIG.init.loadingMinTime - elapsedTime)
      )
    }
    
    // 保存初始化数据到全局状态
    window.__APP_INIT_DATA__ = initData
    
    console.log('应用初始化成功:', initData)
    
    return {
      success: true,
      data: initData
    }
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    
    return {
      success: false,
      error: error.message || '应用初始化失败'
    }
  }
}

/**
 * 显示初始化错误
 */
export function showInitError(error) {
  // 创建错误提示界面
  const errorDiv = document.createElement('div')
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <h3 style="color: #f56565; margin-bottom: 15px;">应用初始化失败</h3>
        <p style="color: #333; margin-bottom: 20px;">${error}</p>
        ${APP_CONFIG.dev.skipBackendRequests ? `
          <p style="color: #666; font-size: 12px; margin-bottom: 15px;">
            当前为开发模式，如需启用真实接口请修改配置文件
          </p>
        ` : ''}
        <button onclick="window.location.reload()" style="
          background: #4299e1;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">重新加载</button>
      </div>
    </div>
  `
  document.body.appendChild(errorDiv)
}

export default {
  initializeApp,
  showInitError
} 