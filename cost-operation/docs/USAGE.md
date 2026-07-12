# 项目功能使用指南

本项目已集成了以下功能和库，以下是详细的使用说明。

## 国际化 (Vue i18n)

### 在模板中使用
```vue
<template>
  <div>
    <!-- 使用 $t 函数 -->
    <h1>{{ $t('common.title') }}</h1>
    <button>{{ $t('common.confirm') }}</button>
  </div>
</template>
```

### 在 Composition API 中使用
```vue
<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()
    
    // 切换语言
    const switchLanguage = () => {
      locale.value = locale.value === 'zh' ? 'en' : 'zh'
    }
    
    return { t, switchLanguage }
  }
}
</script>
```

### 添加新的语言项
在 `src/locales/zh.js` 和 `src/locales/en.js` 中添加对应的翻译：

```javascript
// zh.js
export default {
  newModule: {
    title: '新模块标题',
    description: '新模块描述'
  }
}

// en.js  
export default {
  newModule: {
    title: 'New Module Title',
    description: 'New Module Description'
  }
}
```

## ECharts

### 基本使用
```vue
<template>
  <div ref="chartRef" style="width: 400px; height: 300px;"></div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue'

export default {
  setup() {
    const { proxy } = getCurrentInstance()
    const chartRef = ref(null)
    
    const initChart = () => {
      const chart = proxy.$echarts.init(chartRef.value)
      const option = {
        title: { text: '示例图表' },
        xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: {},
        series: [{
          name: '数据',
          type: 'bar',
          data: [120, 200, 150, 80, 70]
        }]
      }
      chart.setOption(option)
    }
    
    onMounted(initChart)
    
    return { chartRef }
  }
}
</script>
```

## DayJS

### 基本时间操作
```javascript
// 在组件中使用
export default {
  setup() {
    const { proxy } = getCurrentInstance()
    
    // 格式化当前时间
    const now = proxy.$dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2023-12-01 14:30:00
    const today = proxy.$dayjs(new Date()).format('YYYY-MM-DD')   // 2023-12-01
    
    // 相对时间
    const relative = proxy.$dayjs().subtract(1, 'hour').fromNow() // 1小时前
    
    // 直接使用 dayjs
    const customFormat = proxy.$dayjs().format('YYYY年MM月DD日')
    
    return { now, today, relative, customFormat }
  }
}
```

### 常用方法
```javascript
const { dayjs } = getCurrentInstance().proxy

// 时间计算
const tomorrow = dayjs().add(1, 'day')
const lastWeek = dayjs().subtract(1, 'week')

// 时间比较
const isAfter = dayjs().isAfter('2023-01-01')
const isBefore = dayjs().isBefore('2024-01-01')

// 获取时间信息
const year = dayjs().year()
const month = dayjs().month() + 1 // 注意月份从0开始
const day = dayjs().date()
```

## Cookies

### 基本操作
```javascript
export default {
  setup() {
    const { proxy } = getCurrentInstance()
    
    // 设置 Cookie
    const setCookie = () => {
      proxy.$cookies.set('user_preference', 'dark_mode', { expires: 7 })
    }
    
    // 获取 Cookie
    const getCookie = () => {
      const preference = proxy.$cookies.get('user_preference')
      return preference
    }
    
    // 删除 Cookie
    const removeCookie = () => {
      proxy.$cookies.remove('user_preference')
    }
    
    return { setCookie, getCookie, removeCookie }
  }
}
```

### Cookie 选项
```javascript
// 设置带选项的 Cookie
proxy.$cookies.set('key', 'value', {
  expires: 7,        // 7天后过期
  path: '/',         // 路径
  domain: '.example.com', // 域名
  secure: true,      // 仅HTTPS
  sameSite: 'strict' // SameSite策略
})
```

## Vue DOMPurify HTML

### 安全的HTML渲染
```vue
<template>
  <div>
    <!-- 自动清理不安全的HTML -->
    <div v-dompurify-html="htmlContent"></div>
  </div>
</template>

<script>
export default {
  setup() {
    // 包含潜在危险脚本的HTML会被自动清理
    const htmlContent = '<p>安全内容</p><script>alert("危险")</script><strong>保留的标签</strong>'
    
    return { htmlContent }
  }
}
</script>
```

## 全局配置

所有库都已在 `main.js` 中进行了全局配置：

- `$echarts` - ECharts 实例（完整引入）
- `$dayjs` - DayJS 实例
- `$cookies` - js-cookie 实例

## 示例组件

查看 `src/components/ExampleUsage.vue` 获取完整的使用示例。

## 目录结构

```
src/
├── locales/          # 国际化语言文件
│   ├── zh.js        # 中文
│   └── en.js        # 英文
├── plugins/          # 插件配置
│   ├── element.js   # Element Plus
│   ├── i18n.js      # 国际化
│   ├── echarts.js   # ECharts
│   └── utils.js     # 工具函数
└── components/       # 组件
    └── ExampleUsage.vue # 使用示例
```

## 注意事项

1. 语言切换后会自动保存到 Cookie 中
2. ECharts 图表需要在 DOM 挂载后初始化
3. DayJS 已配置中文语言包
4. 所有 HTML 内容都会被 DOMPurify 自动清理
5. Cookie 默认有效期为7天 