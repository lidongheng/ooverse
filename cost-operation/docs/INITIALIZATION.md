# 应用初始化系统

本项目实现了一套完整的应用初始化系统，在应用挂载前会先进行必要的接口请求和数据验证。支持开发模式和生产模式的灵活切换。

## 功能特性

### 🚀 智能初始化
- **条件请求**: 根据URL参数智能判断需要请求的接口
- **并行请求**: 多个接口并行请求，提高初始化速度
- **重试机制**: 请求失败自动重试，提高成功率
- **数据验证**: 完整的数据格式验证和业务逻辑校验

### 🔧 开发模式支持
- **接口跳过**: 可跳过后端接口请求，使用模拟数据
- **模拟延迟**: 模拟真实网络请求延迟
- **开发工具**: 提供便捷的调试和配置切换工具
- **可视化提示**: 开发模式的视觉标识和警告提示

### 📱 用户体验
- **加载动画**: 优雅的加载提示界面
- **错误处理**: 友好的错误提示和重新加载功能
- **最小加载时间**: 避免加载界面闪烁

## 开发模式配置

### 启用/禁用开发模式
在 `src/config/app.js` 中配置：

```javascript
dev: {
  skipBackendRequests: true,  // true=开发模式，false=生产模式
  showMockDataWarning: true   // 是否显示模拟数据警告
}
```

### 模拟数据配置
```javascript
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
      // ... 更多模块
    ]
  }
}
```

## 开发工具

### 控制台工具
在开发环境下，可以在浏览器控制台使用以下命令：

```javascript
// 查看帮助
devTools.help()

// 切换后端请求模式
devTools.toggleBackendRequests()

// 查看当前配置
devTools.showCurrentConfig()

// 查看模拟数据
devTools.showMockData()

// 查看初始化数据
devTools.showInitData()

// 重新初始化应用
devTools.reinitializeApp()
```

### 可视化标识
- 🚀 开发模式时加载屏幕有特殊标识
- 🎨 开发模式使用渐变背景色
- ⚠️ 控制台会显示明显的开发模式警告

## 初始化流程

### 普通模式（生产环境）
当URL中没有特殊模块参数时，会并行请求以下4个接口：

1. **XToken接口** (`/auth/xtoken`) - 获取用户认证令牌
2. **Role接口** (`/auth/role`) - 获取用户角色权限
3. **Version接口** (`/system/version`) - 获取系统版本信息
4. **ModuleList接口** (`/system/modules`) - 获取可用模块列表

### 特殊模块模式
当URL包含特殊模块参数时（如 `?tab=login`），只会请求：

1. **XToken接口** (`/auth/xtoken`) - 获取基础认证信息

### 开发模式
当 `skipBackendRequests: true` 时：
- ✅ 跳过所有后端接口请求
- ✅ 使用预定义的模拟数据
- ✅ 模拟网络请求延迟（300-800ms）
- ✅ 显示开发模式标识和警告

## 配置说明

### 特殊模块配置
在 `src/config/app.js` 中配置特殊模块列表：

```javascript
specialModules: [
  'login',          // 登录页面
  'register',       // 注册页面  
  'reset-password', // 密码重置
  'guest-view',     // 访客视图
  'public-page'     // 公开页面
]
```

### API端点配置
```javascript
api: {
  endpoints: {
    xtoken: '/auth/xtoken',
    role: '/auth/role', 
    version: '/system/version',
    moduleList: '/system/modules'
  }
}
```

### 初始化配置
```javascript
init: {
  retryCount: 3,        // 请求失败重试次数
  retryDelay: 1000,     // 重试延迟(ms)
  loadingMinTime: 500   // 最小加载时间(ms)
}
```

## 使用方法

### 获取初始化数据
在组件中可以通过以下方式获取初始化数据：

```vue
<script>
export default {
  setup() {
    const { proxy } = getCurrentInstance()
    
    // 获取初始化数据
    const initData = proxy.$initData
    
    // 访问各种初始化信息
    const userRoles = initData.role?.roles || []
    const systemVersion = initData.version?.version
    const enabledModules = initData.moduleList?.enabledModules || []
    const isSpecialModule = initData.isSpecialModule
    const isDevelopmentMode = initData.isDevelopmentMode
    
    return {
      userRoles,
      systemVersion,
      enabledModules,
      isSpecialModule,
      isDevelopmentMode
    }
  }
}
</script>
```

### 开发调试流程

1. **开发阶段**: 设置 `skipBackendRequests: true`
2. **联调阶段**: 设置 `skipBackendRequests: false`
3. **生产环境**: 确保 `skipBackendRequests: false`

### 快速切换模式
```javascript
// 在控制台快速切换
devTools.toggleBackendRequests()
// 然后刷新页面
window.location.reload()
```

## 接口数据格式

### XToken接口响应
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2024-01-01T00:00:00Z"
}
```

### Role接口响应
```json
{
  "roles": ["admin", "user"],
  "permissions": ["read", "write", "delete"]
}
```

### Version接口响应
```json
{
  "version": "1.0.0",
  "buildTime": "2023-12-01T10:00:00Z",
  "environment": "production"
}
```

### ModuleList接口响应
```json
{
  "modules": [
    {
      "id": "dashboard",
      "name": "仪表盘",
      "enabled": true
    },
    {
      "id": "users",
      "name": "用户管理", 
      "enabled": true
    }
  ]
}
```

## 错误处理

### 自动重试
- 网络错误或临时故障会自动重试
- 默认重试3次，每次间隔1秒
- 可在配置中调整重试次数和延迟

### 错误展示
- 初始化失败会显示友好的错误界面
- 提供重新加载按钮
- 错误信息会在控制台详细记录
- 开发模式下会显示额外的调试信息

### 降级策略
- 特殊模块模式作为降级方案
- 关键接口失败时可手动切换到特殊模式
- 开发模式可作为临时的无后端开发方案

## 开发调试

### 环境变量
```bash
# API基础地址
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

### 控制台日志
初始化过程中会输出详细的日志信息：
- 模块检测结果
- 接口请求状态
- 数据处理结果
- 错误详情
- 开发模式标识

### 模拟特殊模块
在开发时可以通过URL参数测试特殊模块模式：
```
http://localhost:8080?tab=login
```

## 部署建议

### 开发环境
```javascript
dev: {
  skipBackendRequests: true,   // 使用模拟数据
  showMockDataWarning: true    // 显示警告
}
```

### 测试环境
```javascript
dev: {
  skipBackendRequests: false,  // 使用真实接口
  showMockDataWarning: false   // 不显示警告
}
```

### 生产环境
```javascript
dev: {
  skipBackendRequests: false,  // 使用真实接口
  showMockDataWarning: false   // 不显示警告
}
```

## 扩展说明

### 添加新接口
1. 在 `src/config/app.js` 中添加端点配置
2. 在 `src/plugins/init.js` 中添加请求函数
3. 添加数据处理和验证逻辑
4. 更新并行请求列表
5. 添加对应的模拟数据

### 添加特殊模块
只需在配置文件中添加模块名称即可：
```javascript
specialModules: [
  // ... 现有模块
  'new-special-module'
]
```

### 自定义模拟数据
修改 `mockData` 配置中的对应字段即可。

### 自定义数据处理
可以在对应的 `process*Data` 函数中添加自定义的数据处理逻辑。 