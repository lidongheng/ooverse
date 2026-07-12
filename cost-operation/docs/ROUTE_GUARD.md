# 路由守卫系统使用指南

本项目实现了一套完整的路由守卫系统，使用Vue Router原生路由守卫确保路径和tab参数的一致性，支持路由重定向、别名映射、严格模式等功能。

## 🛡️ 功能特性

### ✨ 核心功能
- **路径和tab参数一致性检查**: 确保模块由路径+tab参数唯一确定
- **自动重定向**: 不匹配的路由自动重定向到正确的路由
- **别名映射**: 支持tab参数别名，如`hr`别名映射到`humanResource`
- **严格模式**: 可配置严格模式，强制路径和tab完全匹配
- **多模块支持**: 一个路径下支持多个子模块
- **动态路由**: 支持带参数的动态路由检查
- **防无限重定向**: 内置重定向次数限制和冷却机制

### 🛠️ 开发友好
- **详细日志**: 完整的路由检查和重定向日志
- **开发工具**: 控制台调试工具和全局访问接口
- **状态监控**: 实时查看守卫状态
- **测试工具**: 路由检查测试功能
- **集中管理**: 路由守卫代码集成在 `router/index.js` 中，便于查找和维护

## 🚀 快速开始

### 路由配置示例

```javascript
// src/config/routes.js
export const ROUTE_CONFIG = {
  routeTabMapping: {
    // 简单映射：路径和tab参数相同
    '/a3QualityMap': {
      defaultTab: 'a3QualityMap',
      allowedTabs: ['a3QualityMap'],
      strict: true
    },
    
    // 别名映射：支持tab参数别名
    '/hr': {
      defaultTab: 'humanResource',
      allowedTabs: ['humanResource', 'hr'],
      tabAliases: {
        'hr': 'humanResource'
      },
      strict: false
    },
    
    // 多模块：一个路径下多个子模块
    '/globalNew': {
      defaultTab: 'a',
      allowedTabs: ['a', 'b', 'c'],
      strict: true
    }
  }
}
```

### 自动初始化

路由守卫在 `router/index.js` 中自动初始化，无需手动设置：

```javascript
// src/router/index.js
import { ROUTE_CONFIG, checkRouteRedirect, getRouteConfig } from '../config/routes'

// 路由守卫在创建router后自动初始化
// 无需额外的手动设置步骤
```

### 全局访问接口

路由守卫工具函数会自动挂载到全局：

```javascript
// 直接在控制台或组件中使用
window.routeGuard.getState()              // 获取守卫状态
window.routeGuard.setEnabled(true/false)  // 启用/禁用守卫
window.routeGuard.checkRoute(path, tab)   // 检查路由
window.routeGuard.getRouteInfo(path)      // 获取路由配置
window.routeGuard.buildCorrectUrl(path, tab) // 构建正确URL
window.routeGuard.reset()                 // 重置守卫状态
```

## 📝 路由配置详解

### 配置项说明

#### 基础配置
```javascript
{
  defaultTab: 'tabName',        // 默认tab参数
  allowedTabs: ['tab1', 'tab2'], // 允许的tab值列表
  strict: true,                 // 是否启用严格模式
  tabAliases: {                 // tab别名映射
    'alias': 'realTab'
  }
}
```

#### 高级配置
```javascript
{
  // 动态路由支持
  dynamic: true,
  pathPattern: '/project/:id?',
  
  // 子模块定义
  subModules: {
    'a': { name: '模块A', description: '描述' },
    'b': { name: '模块B', description: '描述' }
  }
}
```

### 守卫配置
```javascript
guard: {
  enabled: true,              // 是否启用路由守卫
  redirectMode: 'replace',    // 重定向模式: 'replace' | 'push'
  fallbackRoute: '/',         // 默认回退路由
  logMismatch: true           // 是否记录不匹配的日志
}
```

## 🎯 使用场景

### 场景1: 简单路径-tab映射
```javascript
// 配置
'/a3QualityMap': {
  defaultTab: 'a3QualityMap',
  allowedTabs: ['a3QualityMap'],
  strict: true
}

// URL行为
'/a3QualityMap?tab=a3QualityMap' ✅ 正常访问
'/a3QualityMap?tab=wrongTab'     ➡️ 重定向到 '/a3QualityMap?tab=a3QualityMap'
'/a3QualityMap'                  ➡️ 重定向到 '/a3QualityMap?tab=a3QualityMap'
```

### 场景2: 别名映射
```javascript
// 配置
'/hr': {
  defaultTab: 'humanResource',
  allowedTabs: ['humanResource', 'hr'],
  tabAliases: {
    'hr': 'humanResource'
  }
}

// URL行为
'/hr?tab=humanResource' ✅ 正常访问
'/hr?tab=hr'           ➡️ 重定向到 '/hr?tab=humanResource'
'/hr'                  ➡️ 重定向到 '/hr?tab=humanResource'
```

### 场景3: 多子模块
```javascript
// 配置
'/globalNew': {
  defaultTab: 'a',
  allowedTabs: ['a', 'b', 'c'],
  strict: true
}

// URL行为
'/globalNew?tab=a' ✅ 正常访问 - 全球模块A
'/globalNew?tab=b' ✅ 正常访问 - 全球模块B
'/globalNew?tab=c' ✅ 正常访问 - 全球模块C
'/globalNew'       ➡️ 重定向到 '/globalNew?tab=a'
```

### 场景4: 动态路由
```javascript
// 配置
'/project': {
  defaultTab: 'list',
  allowedTabs: ['list', 'create', 'edit', 'detail'],
  dynamic: true,
  pathPattern: '/project/:id?'
}

// URL行为
'/project?tab=list'        ✅ 项目列表
'/project/123?tab=detail'  ✅ 项目详情
'/project/123'             ➡️ 重定向到 '/project/123?tab=list'
```

## 🔧 开发工具

### 控制台命令

#### 基础查看
```javascript
devTools.showCurrentRoute()     // 查看当前路由信息
devTools.showRouteConfig()      // 查看路由配置
devTools.generateRouteReport()  // 生成路由测试报告
```

#### 路由测试
```javascript
// 测试指定路由
devTools.testRouteCheck('/a3QualityMap', 'a3QualityMap')  // 应该通过
devTools.testRouteCheck('/a3QualityMap', 'wrongTab')      // 应该重定向
devTools.testRouteCheck('/hr', 'hr')                      // 应该重定向到humanResource
```

#### 守卫控制
```javascript
devTools.toggleRouteGuard()     // 切换守卫启用状态
devTools.showRouteGuardState()  // 查看守卫状态
devTools.resetRouteGuard()      // 重置守卫状态
```

#### 直接访问全局接口
```javascript
// 直接使用window.routeGuard
window.routeGuard.getState()              // 获取当前状态
window.routeGuard.setEnabled(false)       // 禁用守卫
window.routeGuard.checkRoute('/path', 'tab') // 检查指定路由
window.routeGuard.reset()                 // 重置状态
```

### Vue组件中使用

```vue
<script>
export default {
  setup() {
    // 直接访问全局路由守卫
    const checkResult = window.routeGuard?.checkRoute('/path', 'tab')
    const routeInfo = window.routeGuard?.getRouteInfo('/path')
    const correctUrl = window.routeGuard?.buildCorrectUrl('/path', 'wrongTab')
    
    // 安全访问（包含默认值）
    const getRouteGuard = () => {
      return window.routeGuard || {
        getState: () => ({ enabled: false, redirectCount: 0 }),
        setEnabled: () => {},
        reset: () => {},
        checkRoute: () => null,
        getRouteInfo: () => null,
        buildCorrectUrl: () => ''
      }
    }
    
    const routeGuard = getRouteGuard()
    const state = routeGuard.getState()
    
    return { /* ... */ }
  }
}
</script>
```

## 📊 重定向原因说明

### 重定向原因类型
- **missing_tab**: Tab参数缺失，使用默认tab
- **invalid_tab**: Tab参数无效，不在允许列表中
- **alias_resolution**: Tab别名解析，重定向到标准tab
- **strict_mismatch**: 严格模式下不匹配
- **alias**: 路由别名重定向

### 示例输出
```javascript
// 控制台输出示例
[路由守卫] 检测到路由不一致，准备重定向 {
  reason: 'invalid_tab',
  current: { path: '/a3QualityMap', tab: 'wrongTab' },
  target: { path: '/a3QualityMap', query: { tab: 'a3QualityMap' } },
  count: 1
}
```

## 🛡️ 安全机制

### 防无限重定向
- **最大重定向次数**: 默认5次
- **冷却时间**: 1秒冷却期
- **自动重置**: 正常路由时重置计数

### 错误处理
```javascript
// 超过重定向限制时
[路由守卫] 重定向次数超过限制，停止重定向 {
  count: 5,
  max: 5
}

// 重定向冷却时
[路由守卫] 重定向冷却中，跳过本次重定向
```

## 🎨 技术实现

### Vue Router原生守卫

```javascript
// src/router/index.js 中的守卫实现
router.beforeEach((to, from, next) => {
  // 路由检查和重定向逻辑
})

router.afterEach((to, from) => {
  // 路由变化后的验证和日志
})
```

### 自动初始化
```javascript
// 在router创建后自动初始化
function initializeRouteGuard() {
  // 注册守卫
  router.beforeEach(beforeEachGuard)
  router.afterEach(afterEachGuard)
  
  // 挂载到全局
  window.routeGuard = routeGuardUtils
}

// 自动执行
initializeRouteGuard()
```

### 集中管理优势
- **便于维护**: 路由定义和守卫逻辑在同一文件
- **减少依赖**: 无需额外的插件文件
- **自动初始化**: 引入router即自动启用守卫
- **代码清晰**: 路由相关逻辑集中管理

## 📋 最佳实践

### 1. 配置命名规范
```javascript
// ✅ 推荐：使用清晰的命名
'/userManagement': {
  defaultTab: 'userList',
  allowedTabs: ['userList', 'userCreate', 'userEdit']
}

// ❌ 不推荐：使用模糊的命名
'/user': {
  defaultTab: 'a',
  allowedTabs: ['a', 'b', 'c']
}
```

### 2. 合理使用严格模式
```javascript
// 简单模块使用严格模式
'/simpleModule': { strict: true }

// 复杂模块或有历史兼容需求时使用非严格模式
'/complexModule': { strict: false }
```

### 3. 安全访问全局对象
```javascript
// ✅ 推荐：安全访问
const routeGuard = window.routeGuard || defaultRouteGuard

// ❌ 不推荐：直接访问可能报错
const state = window.routeGuard.getState()
```

### 4. 监听路由变化
```vue
<script>
export default {
  setup() {
    const route = useRoute()
    
    // 监听路由变化
    watch(() => route.fullPath, (newPath) => {
      console.log('路由已变化:', newPath)
    })
  }
}
</script>
```

## 🚨 注意事项

1. **自动初始化**: 路由守卫在引入router时自动初始化
2. **全局访问**: window.routeGuard在守卫初始化后才可用
3. **动态路由**: 动态路由需要正确配置pathPattern
4. **性能考虑**: 大量路由时考虑优化配置结构
5. **日志管理**: 生产环境可考虑关闭详细日志
6. **浏览器兼容**: 确保目标浏览器支持现代JavaScript特性
7. **代码位置**: 路由守卫代码现在位于 `src/router/index.js` 中

## 🔗 相关文件

- [路由配置](../src/config/routes.js) - 路由和tab映射配置
- [路由定义和守卫](../src/router/index.js) - Vue Router配置和路由守卫逻辑
- [开发工具](../src/utils/devTools.js) - 调试工具
- [演示组件](../src/components/RouteGuardDemo.vue) - 功能演示

## 📚 扩展阅读

- [Vue Router官方文档](https://router.vuejs.org/)
- [Navigation Guards详解](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [路由元信息](https://router.vuejs.org/guide/advanced/meta.html) 