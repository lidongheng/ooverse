<template>
  <div class="example-usage">
    <div class="example-content">
      <h1 class="text-primary">{{ $t('hello') }}</h1>
      
      <!-- 主题切换按钮 -->
      <div class="theme-switcher">
        <el-button 
          @click="toggleTheme" 
          :type="currentTheme.isDark ? 'warning' : 'primary'"
          :icon="currentTheme.isDark ? 'Sunny' : 'Moon'"
        >
          {{ currentTheme.isDark ? '切换到亮色' : '切换到暗黑' }}
        </el-button>
        <span class="current-theme text-secondary">
          当前主题: {{ currentTheme.config?.name }}
        </span>
      </div>

      <!-- Element Plus 组件示例 -->
      <div class="component-section">
        <h2 class="text-secondary">Element Plus 组件</h2>
        
        <el-card class="demo-card">
          <template #header>
            <div class="card-header">
              <span class="text-primary">Element Plus 卡片</span>
            </div>
          </template>
          
          <el-form :model="form" label-width="120px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            
            <el-form-item label="日期">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <el-form-item label="状态">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary">提交</el-button>
              <el-button>重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 时间显示 -->
      <div class="time-section">
        <h2 class="text-secondary">时间处理 (DayJS)</h2>
        <div class="time-display bg-secondary">
          <p class="text-primary">当前时间: {{ currentTime }}</p>
          <p class="text-tertiary">格式化时间: {{ formattedTime }}</p>
          <p class="text-tertiary">相对时间: {{ relativeTime }}</p>
        </div>
      </div>

      <!-- ECharts 图表 -->
      <div class="chart-section">
        <h2 class="text-secondary">ECharts 图表</h2>
        <div ref="chartRef" class="chart-container"></div>
      </div>

      <!-- 语言切换和Cookie演示 -->
      <div class="demo-section">
        <h2 class="text-secondary">多语言和Cookie</h2>
        <div class="lang-demo bg-tertiary">
          <el-button @click="toggleLanguage" type="success">
            切换语言 ({{ $i18n.locale === 'zh' ? '中文' : 'English' }})
          </el-button>
          
          <div class="cookie-info">
            <p class="text-primary">Cookie 操作:</p>
            <el-button @click="setCookieExample" size="small">设置Cookie</el-button>
            <el-button @click="getCookieExample" size="small">读取Cookie</el-button>
            <el-button @click="clearCookieExample" size="small">清除Cookie</el-button>
            <p v-if="cookieValue" class="text-secondary">Cookie值: {{ cookieValue }}</p>
          </div>
        </div>
      </div>

      <!-- HTML内容过滤演示 -->
      <div class="purify-section">
        <h2 class="text-secondary">HTML内容过滤</h2>
        <div class="purify-demo bg-secondary">
          <p class="text-primary">安全的HTML内容:</p>
          <div v-dompurify-html="safeHtml" class="safe-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ExampleUsage',
  setup() {
    const { t, locale } = useI18n()
    const theme = inject('theme')
    
    // 主题相关
    const currentTheme = ref(theme.getCurrentTheme())
    
    // 表单数据
    const form = ref({
      username: '',
      date: '',
      status: ''
    })

    // 时间相关
    const currentTime = ref('')
    const formattedTime = ref('')
    const relativeTime = ref('')

    // Cookie演示
    const cookieValue = ref('')

    // 图表相关
    const chartRef = ref(null)
    let chartInstance = null

    // HTML过滤内容
    const safeHtml = `
      <h3 style="color: var(--theme-primary);">这是安全的HTML内容</h3>
      <p>包含了一些<strong>加粗文字</strong>和<em>斜体文字</em></p>
      <ul>
        <li>列表项 1</li>
        <li>列表项 2</li>
      </ul>
    `

    // 切换主题
    const toggleTheme = () => {
      theme.switchTheme()
      currentTheme.value = theme.getCurrentTheme()
      
      // 更新图表主题
      if (chartInstance) {
        updateChartTheme()
      }
    }

    // 监听主题变化
    const handleThemeChange = () => {
      currentTheme.value = theme.getCurrentTheme()
      if (chartInstance) {
        updateChartTheme()
      }
    }

    // 切换语言
    const toggleLanguage = () => {
      locale.value = locale.value === 'zh' ? 'en' : 'zh'
    }

    // Cookie操作示例
    const setCookieExample = () => {
      window.$cookies.set('example_key', 'Hello Theme System!', { expires: 7 })
      cookieValue.value = 'Cookie已设置'
    }

    const getCookieExample = () => {
      const value = window.$cookies.get('example_key')
      cookieValue.value = value || '没有找到Cookie'
    }

    const clearCookieExample = () => {
      window.$cookies.remove('example_key')
      cookieValue.value = 'Cookie已清除'
    }

    // 更新时间
    const updateTime = () => {
      const now = window.$dayjs()
      currentTime.value = now.format('YYYY-MM-DD HH:mm:ss')
      formattedTime.value = now.format('dddd, MMMM D, YYYY')
      relativeTime.value = now.fromNow()
    }

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return

      chartInstance = window.$echarts.init(chartRef.value)
      updateChartTheme()
    }

    // 更新图表主题
    const updateChartTheme = () => {
      if (!chartInstance) return

      const isDark = currentTheme.value.isDark
      const textColor = isDark ? '#ffffff' : '#333333'
      const backgroundColor = isDark ? '#2d2d2d' : '#ffffff'

      const option = {
        backgroundColor: backgroundColor,
        title: {
          text: '主题响应式图表',
          textStyle: {
            color: textColor
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? '#404040' : '#ffffff',
          textStyle: {
            color: textColor
          }
        },
        legend: {
          data: ['销量', '利润'],
          textStyle: {
            color: textColor
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLabel: {
            color: textColor
          },
          axisLine: {
            lineStyle: {
              color: isDark ? '#404040' : '#e0e0e0'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: textColor
          },
          axisLine: {
            lineStyle: {
              color: isDark ? '#404040' : '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: isDark ? '#404040' : '#e0e0e0'
            }
          }
        },
        series: [
          {
            name: '销量',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210],
            smooth: true,
            lineStyle: {
              color: '#409eff'
            },
            areaStyle: {
              color: isDark ? 'rgba(64, 158, 255, 0.1)' : 'rgba(64, 158, 255, 0.2)'
            }
          },
          {
            name: '利润',
            type: 'line',
            stack: '总量',
            data: [220, 182, 191, 234, 290, 330, 310],
            smooth: true,
            lineStyle: {
              color: '#67c23a'
            },
            areaStyle: {
              color: isDark ? 'rgba(103, 194, 58, 0.1)' : 'rgba(103, 194, 58, 0.2)'
            }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    // 定时器
    let timeInterval = null

    onMounted(() => {
      // 启动时间更新
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      
      // 初始化图表
      setTimeout(() => {
        initChart()
      }, 100)
      
      // 监听主题变化
      window.addEventListener('themeChanged', handleThemeChange)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
      if (chartInstance) {
        chartInstance.dispose()
      }
      window.removeEventListener('themeChanged', handleThemeChange)
    })

    return {
      // 主题相关
      currentTheme,
      toggleTheme,
      
      // 表单
      form,
      
      // 时间
      currentTime,
      formattedTime,
      relativeTime,
      
      // 语言
      toggleLanguage,
      
      // Cookie
      cookieValue,
      setCookieExample,
      getCookieExample,
      clearCookieExample,
      
      // 图表
      chartRef,
      
      // HTML过滤
      safeHtml
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/themes.less';

.example-usage {
  .theme-container();
  padding: 20px;
  min-height: 100vh;
}

.example-content {
  max-width: 1000px;
  margin: 0 auto;
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 2.5em;
  }
}

// 主题切换器
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px;
  .theme-card();
  border-radius: 8px;
  justify-content: center;

  .current-theme {
    font-size: 14px;
  }
}

// 通用section样式
.component-section,
.time-section,
.demo-section,
.purify-section {
  margin-bottom: 30px;
  
  h2 {
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--theme-border-primary);
  }
}

// 组件演示区域
.demo-card {
  .theme-card();
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// 时间显示区域
.time-display {
  padding: 20px;
  border-radius: 8px;
  .theme-shadow();
  
  p {
    margin: 8px 0;
    font-size: 16px;
  }
}

// 图表容器
.chart-container {
  width: 100%;
  height: 400px;
  .theme-card();
  border-radius: 8px;
}

// 演示区域
.lang-demo {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .cookie-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    p {
      margin: 0;
    }
    
    .el-button {
      align-self: flex-start;
      margin-right: 10px;
    }
  }
}

// HTML过滤演示
.purify-demo {
  padding: 20px;
  border-radius: 8px;
  
  .safe-content {
    .theme-card();
    padding: 15px;
    margin-top: 10px;
    border-radius: 6px;
    
    :deep(h3) {
      margin-top: 0;
      color: var(--theme-primary);
    }
    
    :deep(ul) {
      margin-bottom: 0;
    }
  }
}

// Element Plus 组件主题适配
:deep(.el-card) {
  .theme-card();
  
  .el-card__header {
    background-color: var(--theme-bg-secondary);
    border-bottom-color: var(--theme-border-primary);
  }
}

:deep(.el-form-item__label) {
  color: var(--theme-text-primary);
}

:deep(.el-input__wrapper) {
  background-color: var(--theme-input-bg);
  border-color: var(--theme-input-border);
  
  &:hover {
    border-color: var(--theme-primary);
  }
  
  &.is-focus {
    border-color: var(--theme-primary);
  }
}

:deep(.el-input__inner) {
  color: var(--theme-text-primary);
  
  &::placeholder {
    color: var(--theme-input-placeholder);
  }
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--theme-input-bg);
}

:deep(.el-date-editor .el-input__wrapper) {
  background-color: var(--theme-input-bg);
}

// 过渡动画
* {
  .theme-transition();
}
</style>