import { getApp, mountApp } from './main'
import router from './router/express'

getApp().use(router)
mountApp()
