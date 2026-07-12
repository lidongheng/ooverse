import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'

// 导入语言文件
import zh from '../locales/zh'
import en from '../locales/en'

const messages = {
  zh,
  en
}

// 获取浏览器语言
function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // 如果没有cookie，则获取浏览器语言
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'zh'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getLanguage(), // 设置地区
  fallbackLocale: 'zh', // 设置备用语言
  messages
})

export default i18n 