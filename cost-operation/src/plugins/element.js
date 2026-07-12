/**
 * Element Plus 全局引入配置
 * 引入 Element Plus 所有组件和样式
 */
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

/**
 * 设置 Element Plus
 * @param {App} app - Vue 应用实例
 */
export function setupElementPlus(app) {
  // 全局注册 Element Plus
  app.use(ElementPlus, {
    locale: zhCn, // 设置中文语言
    size: '', // 默认尺寸，2.13 中 'default' 会触发校验警告
    zIndex: 3000 // 设置默认 z-index
  })

  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  console.log('Element Plus 已全局引入')
} 