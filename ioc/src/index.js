import { getApp, mountApp } from './main'
import router from './router'

getApp().use(router)
mountApp()
