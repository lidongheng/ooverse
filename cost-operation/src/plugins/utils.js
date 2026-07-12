import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import Cookies from 'js-cookie'

// 配置 dayjs 插件
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(weekOfYear)
dayjs.extend(quarterOfYear)

// 设置默认语言
dayjs.locale('zh-cn')

// Cookie 操作函数
export const getCookie = (key) => {
  return Cookies.get(key)
}

export const setCookie = (key, value, options = {}) => {
  return Cookies.set(key, value, { expires: 7, ...options })
}

export const removeCookie = (key, options = {}) => {
  return Cookies.remove(key, options)
}

// 导出配置好的 dayjs 和 Cookies
export { dayjs, Cookies }
