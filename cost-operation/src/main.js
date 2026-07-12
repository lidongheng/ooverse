import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import { setupElementPlus } from './plugins/element'
import i18n from './plugins/i18n'
import echarts from './plugins/echarts'
import { dayjs, Cookies } from './plugins/utils'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import { initializeApp as runAppInit, showInitError } from './plugins/init'
import { setupTheme, initializeTheme } from './plugins/theme'
import { registerDevTools } from './utils/devTools'
import { useTargetNumStore } from './stores/targetNumStore'

// 提前初始化主题系统
initializeTheme()

// 注册开发工具（仅在开发环境）
registerDevTools()

/**
 * 应用初始化：请求 token（及 init 内其它接口）、写入全局初始化数据、拉取目标值/底线配置
 * 需在 `app.use(pinia)` 之后调用（Pinia 已激活，store 才可请求）
 * @param {import('vue').App} app
 */
async function initializeApp(app) {
  const initResult = await runAppInit()

  if (!initResult.success) {
    return initResult
  }

  app.config.globalProperties.$initData = initResult.data

  const token = initResult.data?.xtoken?.token
  if (token) {
    await useTargetNumStore().loadData(token)
  }

  return initResult
}

// 应用启动
async function bootstrap() {
  try {
    // 创建Vue应用实例
    const app = createApp(App)

    // 设置 Element Plus
    setupElementPlus(app)

    // 设置国际化
    app.use(i18n)

    // 设置主题系统
    setupTheme(app)

    // 注意: 路由守卫已在 router/index.js 中自动初始化

    // 设置 DOMPurify
    app.use(VueDOMPurifyHTML)

    // 全局属性
    app.config.globalProperties.$echarts = echarts
    app.config.globalProperties.$dayjs = dayjs
    app.config.globalProperties.$cookies = Cookies

    const pinia = createPinia()
    app.use(pinia)

    const initResult = await initializeApp(app)

    if (!initResult.success) {
      throw new Error(initResult.error)
    }

    app.use(store).use(router).mount('#app')

    console.log('应用启动成功')
  } catch (error) {
    console.error('应用启动失败:', error)
    showInitError(error.message || '应用启动失败')
  }
}

bootstrap()
