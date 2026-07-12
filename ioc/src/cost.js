import { getApp, mountApp } from './main'
import router from './router/cost'

getApp().use(router)
mountApp()
