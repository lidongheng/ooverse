<template>
  <div class="route-guard-demo">
    <div class="demo-content">
      <h1 class="text-primary">🛡️ 路由守卫演示</h1>
      
      <!-- 当前路由信息 -->
      <div class="current-route-section">
        <h2 class="text-secondary">当前路由信息</h2>
        <div class="route-info bg-secondary">
          <div class="info-item">
            <span class="label text-primary">当前路径:</span>
            <span class="value text-secondary">{{ currentRoute.path }}</span>
          </div>
          <div class="info-item">
            <span class="label text-primary">Tab参数:</span>
            <span class="value text-secondary">{{ currentRoute.query.tab || '无' }}</span>
          </div>
          <div class="info-item">
            <span class="label text-primary">完整URL:</span>
            <span class="value text-tertiary">{{ currentRoute.fullPath }}</span>
          </div>
          <div class="info-item">
            <span class="label text-primary">守卫状态:</span>
            <span class="value" :class="guardState.enabled ? 'color-success' : 'color-danger'">
              {{ guardState.enabled ? '启用' : '禁用' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 路由检查状态 -->
      <div class="route-check-section">
        <h2 class="text-secondary">路由检查状态</h2>
        <div class="check-result bg-tertiary">
          <div v-if="routeCheckResult" class="check-info">
            <div v-if="routeCheckResult.isValid" class="valid-route">
              <el-icon class="icon color-success"><SuccessFilled /></el-icon>
              <span class="text-success">路由状态正常</span>
            </div>
            <div v-else class="invalid-route">
              <el-icon class="icon color-warning"><WarningFilled /></el-icon>
              <span class="text-warning">需要重定向</span>
              <div class="redirect-info">
                <p class="text-secondary">原因: {{ routeCheckResult.redirect.reason }}</p>
                <p class="text-secondary">目标: {{ routeCheckResult.redirect.path }}?tab={{ routeCheckResult.redirect.query.tab }}</p>
              </div>
            </div>
          </div>
          <div v-if="routeConfig" class="config-info">
            <h4 class="text-primary">路由配置:</h4>
            <ul class="config-list">
              <li><span class="text-secondary">默认Tab:</span> <code>{{ routeConfig.config.defaultTab }}</code></li>
              <li><span class="text-secondary">允许的Tab:</span> <code>{{ routeConfig.config.allowedTabs?.join(', ') || '任意' }}</code></li>
              <li><span class="text-secondary">严格模式:</span> <span :class="routeConfig.config.strict ? 'color-warning' : 'color-success'">{{ routeConfig.config.strict ? '是' : '否' }}</span></li>
              <li v-if="routeConfig.config.tabAliases">
                <span class="text-secondary">Tab别名:</span> 
                <code>{{ Object.entries(routeConfig.config.tabAliases).map(([k,v]) => `${k}→${v}`).join(', ') }}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 路由测试工具 -->
      <div class="route-test-section">
        <h2 class="text-secondary">路由测试工具</h2>
        <div class="test-tools bg-secondary">
          <div class="test-form">
            <div class="form-row">
              <div class="form-item">
                <label class="text-primary">测试路径:</label>
                <el-input v-model="testRoute.path" placeholder="例如: /a3QualityMap" />
              </div>
              <div class="form-item">
                <label class="text-primary">测试Tab:</label>
                <el-input v-model="testRoute.tab" placeholder="例如: a3QualityMap" />
              </div>
              <div class="form-actions">
                <el-button @click="testRouteCheck" type="primary">测试路由</el-button>
                <el-button @click="clearTestResult">清除结果</el-button>
              </div>
            </div>
          </div>
          
          <div v-if="testResult" class="test-result">
            <h4 class="text-primary">测试结果:</h4>
            <div class="result-content bg-tertiary">
              <div v-if="testResult.isValid" class="valid-result">
                <el-icon class="color-success"><CircleCheckFilled /></el-icon>
                <span class="text-success">路由检查通过</span>
              </div>
              <div v-else class="invalid-result">
                <el-icon class="color-warning"><CircleCloseFilled /></el-icon>
                <span class="text-warning">需要重定向</span>
                <div class="redirect-details">
                  <p><span class="text-secondary">原因:</span> {{ getRedirectReasonText(testResult.redirect.reason) }}</p>
                  <p><span class="text-secondary">目标路径:</span> <code>{{ testResult.redirect.path }}</code></p>
                  <p><span class="text-secondary">目标Tab:</span> <code>{{ testResult.redirect.query.tab }}</code></p>
                  <p><span class="text-secondary">正确URL:</span> <code>{{ testResult.correctUrl }}</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速导航测试 -->
      <div class="quick-nav-section">
        <h2 class="text-secondary">快速导航测试</h2>
        <div class="nav-buttons">
          <div class="button-group">
            <h4 class="text-primary">正确路由:</h4>
            <el-button @click="navigateTo('/a3QualityMap', 'a3QualityMap')" type="success">
              A3质量地图 (正确)
            </el-button>
            <el-button @click="navigateTo('/hr', 'humanResource')" type="success">
              人力资源 (正确)
            </el-button>
            <el-button @click="navigateTo('/globalNew', 'a')" type="success">
              全球模块A (正确)
            </el-button>
          </div>
          
          <div class="button-group">
            <h4 class="text-primary">错误路由 (会被重定向):</h4>
            <el-button @click="navigateTo('/a3QualityMap', 'wrongTab')" type="warning">
              A3质量地图 (错误Tab)
            </el-button>
            <el-button @click="navigateTo('/hr', 'hr')" type="warning">
              人力资源 (别名)
            </el-button>
            <el-button @click="navigateTo('/globalNew', '')" type="warning">
              全球模块 (无Tab)
            </el-button>
          </div>
        </div>
      </div>

      <!-- 路由守卫控制 -->
      <div class="guard-control-section">
        <h2 class="text-secondary">路由守卫控制</h2>
        <div class="control-panel bg-secondary">
          <div class="control-row">
            <el-button 
              @click="toggleGuard" 
              :type="guardState.enabled ? 'danger' : 'success'"
            >
              {{ guardState.enabled ? '禁用' : '启用' }}路由守卫
            </el-button>
            <el-button @click="resetGuardState" type="info">
              重置守卫状态
            </el-button>
            <el-button @click="showGuardState">
              查看守卫状态
            </el-button>
          </div>
          
          <div class="guard-stats">
            <div class="stat-item">
              <span class="text-secondary">重定向次数:</span>
              <span class="text-primary">{{ guardState.redirectCount }}</span>
            </div>
            <div class="stat-item">
              <span class="text-secondary">最大重定向:</span>
              <span class="text-tertiary">{{ guardState.maxRedirects }}</span>
            </div>
            <div class="stat-item">
              <span class="text-secondary">上次重定向:</span>
              <span class="text-tertiary">{{ lastRedirectTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 开发工具提示 -->
      <div class="dev-tools-section">
        <h2 class="text-secondary">🛠️ 开发工具</h2>
        <div class="tools-content bg-tertiary">
          <p class="text-primary">在控制台中可以使用以下命令进行更详细的测试:</p>
          <ul class="tools-list">
            <li><code>devTools.showCurrentRoute()</code> - 查看当前路由详情</li>
            <li><code>devTools.testRouteCheck('/path', 'tab')</code> - 测试指定路由</li>
            <li><code>devTools.showRouteConfig()</code> - 查看路由配置</li>
            <li><code>devTools.generateRouteReport()</code> - 生成路由测试报告</li>
            <li><code>devTools.toggleRouteGuard()</code> - 切换路由守卫</li>
            <li><code>window.routeGuard.getState()</code> - 直接访问路由守卫状态</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SuccessFilled, WarningFilled, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

export default {
  name: 'RouteGuardDemo',
  components: {
    SuccessFilled,
    WarningFilled,
    CircleCheckFilled,
    CircleCloseFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 获取路由守卫工具（从全局）
    const getRouteGuard = () => {
      return window.routeGuard || {
        getState: () => ({ enabled: false, redirectCount: 0, maxRedirects: 5, lastRedirectTime: 0 }),
        setEnabled: () => {},
        reset: () => {},
        checkRoute: () => null,
        getRouteInfo: () => null,
        buildCorrectUrl: () => ''
      }
    }
    
    // 响应式数据
    const currentRoute = ref(route)
    const guardState = ref(getRouteGuard().getState())
    const testRoute = ref({ path: '/a3QualityMap', tab: 'wrongTab' })
    const testResult = ref(null)
    
    // 计算属性
    const routeConfig = computed(() => {
      return getRouteGuard().getRouteInfo(currentRoute.value.path)
    })
    
    const routeCheckResult = computed(() => {
      const redirect = getRouteGuard().checkRoute(currentRoute.value.path, currentRoute.value.query.tab)
      return {
        isValid: !redirect,
        redirect: redirect
      }
    })
    
    const lastRedirectTime = computed(() => {
      if (!guardState.value.lastRedirectTime) return '无'
      return new Date(guardState.value.lastRedirectTime).toLocaleTimeString()
    })
    
    // 方法
    const updateState = () => {
      currentRoute.value = route
      guardState.value = getRouteGuard().getState()
    }
    
    const testRouteCheck = () => {
      const routeGuard = getRouteGuard()
      const redirect = routeGuard.checkRoute(testRoute.value.path, testRoute.value.tab)
      const correctUrl = routeGuard.buildCorrectUrl(testRoute.value.path, testRoute.value.tab)
      
      testResult.value = {
        isValid: !redirect,
        redirect: redirect,
        correctUrl: correctUrl
      }
    }
    
    const clearTestResult = () => {
      testResult.value = null
    }
    
    const navigateTo = (path, tab) => {
      const query = tab ? { tab } : {}
      router.push({ path, query })
    }
    
    const toggleGuard = () => {
      const routeGuard = getRouteGuard()
      routeGuard.setEnabled(!guardState.value.enabled)
      updateState()
    }
    
    const resetGuardState = () => {
      getRouteGuard().reset()
      updateState()
    }
    
    const showGuardState = () => {
      console.group('🛡️ 路由守卫状态详情')
      console.log('当前状态:', guardState.value)
      console.log('当前路由:', currentRoute.value)
      console.log('路由配置:', routeConfig.value)
      console.log('检查结果:', routeCheckResult.value)
      console.groupEnd()
    }
    
    const getRedirectReasonText = (reason) => {
      const reasonTexts = {
        'missing_tab': 'Tab参数缺失',
        'invalid_tab': 'Tab参数无效',
        'alias_resolution': 'Tab别名解析',
        'strict_mismatch': '严格模式不匹配',
        'alias': '路由别名重定向'
      }
      return reasonTexts[reason] || reason
    }
    
    // 定时更新状态
    let updateInterval = null
    
    onMounted(() => {
      updateInterval = setInterval(updateState, 1000)
    })
    
    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })
    
    return {
      currentRoute,
      guardState,
      routeConfig,
      routeCheckResult,
      lastRedirectTime,
      testRoute,
      testResult,
      testRouteCheck,
      clearTestResult,
      navigateTo,
      toggleGuard,
      resetGuardState,
      showGuardState,
      getRedirectReasonText
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/themes.less';

.route-guard-demo {
  .theme-container();
  padding: 20px;
  min-height: 100vh;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 2.5em;
  }
}

// 通用section样式
.current-route-section,
.route-check-section,
.route-test-section,
.quick-nav-section,
.guard-control-section,
.dev-tools-section {
  margin-bottom: 30px;
  
  h2 {
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--theme-border-primary);
  }
}

// 当前路由信息
.route-info {
  padding: 20px;
  border-radius: 8px;
  .theme-shadow();
  
  .info-item {
    display: flex;
    margin-bottom: 8px;
    
    .label {
      min-width: 120px;
      font-weight: 500;
    }
    
    .value {
      flex: 1;
      word-break: break-all;
    }
  }
}

// 路由检查状态
.check-result {
  padding: 20px;
  border-radius: 8px;
  
  .check-info {
    margin-bottom: 15px;
    
    .valid-route,
    .invalid-route {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      
      .icon {
        font-size: 18px;
      }
    }
    
    .redirect-info {
      margin-left: 28px;
      
      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }
  }
  
  .config-info {
    h4 {
      margin-bottom: 10px;
    }
    
    .config-list {
      list-style: none;
      padding: 0;
      
      li {
        margin-bottom: 5px;
        
        code {
          background-color: var(--theme-bg-primary);
          color: var(--theme-primary);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

// 路由测试工具
.test-tools {
  padding: 20px;
  border-radius: 8px;
  
  .test-form {
    margin-bottom: 20px;
    
    .form-row {
      display: flex;
      gap: 15px;
      align-items: end;
      flex-wrap: wrap;
    }
    
    .form-item {
      flex: 1;
      min-width: 200px;
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .test-result {
    .result-content {
      padding: 15px;
      border-radius: 6px;
      
      .valid-result,
      .invalid-result {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .redirect-details {
          margin-left: 28px;
          margin-top: 10px;
          
          p {
            margin: 5px 0;
            
            code {
              background-color: var(--theme-bg-secondary);
              color: var(--theme-primary);
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
            }
          }
        }
      }
    }
  }
}

// 快速导航测试
.nav-buttons {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  
  .button-group {
    flex: 1;
    min-width: 300px;
    
    h4 {
      margin-bottom: 15px;
    }
    
    .el-button {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
}

// 路由守卫控制
.control-panel {
  padding: 20px;
  border-radius: 8px;
  
  .control-row {
    margin-bottom: 20px;
    
    .el-button {
      margin-right: 15px;
    }
  }
  
  .guard-stats {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      
      span:first-child {
        font-size: 14px;
      }
      
      span:last-child {
        font-weight: 500;
      }
    }
  }
}

// 开发工具提示
.tools-content {
  padding: 20px;
  border-radius: 8px;
  
  .tools-list {
    margin-top: 15px;
    list-style: none;
    padding: 0;
    
    li {
      margin-bottom: 8px;
      
      code {
        background-color: var(--theme-bg-primary);
        color: var(--theme-primary);
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-weight: 500;
      }
    }
  }
}

// Element Plus 组件主题适配
:deep(.el-input__wrapper) {
  .theme-input();
}

:deep(.el-button) {
  .theme-transition();
}
</style> 