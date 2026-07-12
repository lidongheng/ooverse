import { getApp, mountApp } from './main'
import router from './router/asset'

getApp().use(router)
mountApp()
