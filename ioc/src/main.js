import { createApp } from 'vue'
import App from './App.vue'

let app

// 四个入口复用同一个应用创建逻辑，各入口只负责注册自己的路由。
export const getApp = () => {
  if (!app) {
    app = createApp(App)
  }

  return app
}

export const mountApp = () => getApp().mount('#app')
