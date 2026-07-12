# 主题系统使用指南

本项目实现了一套完整的主题系统，支持亮白和暗黑两种主题，通过URL参数控制，并且非常方便在Less中使用。

## 🎨 功能特性

### ✨ 核心功能
- **URL参数控制**: `?theme=light` 或 `?theme=dark`
- **Cookie持久化**: 用户选择会自动保存
- **系统偏好检测**: 自动检测操作系统主题偏好
- **平滑过渡**: 主题切换时的优雅动画效果
- **实时响应**: 支持系统主题变化的实时跟随

### 🛠️ 开发友好
- **CSS变量系统**: 基于原生CSS Custom Properties
- **Less混合器**: 丰富的混合器简化开发
- **工具类**: 现成的CSS工具类
- **开发工具**: 控制台调试工具

## 🚀 快速开始

### URL参数控制
在URL中添加主题参数：
```
http://localhost:8080?theme=light  // 亮色主题
http://localhost:8080?theme=dark   // 暗黑主题
```

### 编程式切换
```javascript
// 在Vue组件中使用
this.$theme.switch('dark')
this.$theme.switch('light')

// 或者使用注入的方式
const theme = inject('theme')
theme.switchTheme('dark')
```

### 控制台快捷操作
```javascript
devTools.light()      // 切换到亮色主题
devTools.dark()       // 切换到暗黑主题
devTools.toggleTheme() // 在两个主题间切换
```

## 📝 在Less中使用

### 引入主题样式
```less
@import '../styles/themes.less';
```

### 使用主题变量
```less
.my-component {
  background-color: @theme-bg-primary;
  color: @theme-text-primary;
  border: 1px solid @theme-border-primary;
  box-shadow: @theme-shadow;
}
```

### 使用混合器
```less
.my-card {
  .theme-card();        // 主题卡片样式
  padding: 20px;
  border-radius: 8px;
}

.my-button {
  .theme-button(primary); // 主题按钮样式
  padding: 10px 20px;
}

.my-input {
  .theme-input();       // 主题输入框样式
}

.my-table {
  .theme-table();       // 主题表格样式
}
```

### 添加过渡动画
```less
.my-element {
  .theme-transition();  // 默认过渡
  .theme-transition(background-color, 0.5s); // 自定义过渡
}
```

## 🎯 常用工具类

### 文字颜色
```html
<div class="text-primary">主要文字</div>
<div class="text-secondary">次要文字</div>
<div class="text-tertiary">三级文字</div>
<div class="text-disabled">禁用文字</div>
```

### 背景颜色
```html
<div class="bg-primary">主背景</div>
<div class="bg-secondary">次背景</div>
<div class="bg-tertiary">三级背景</div>
```

### 状态颜色
```html
<div class="color-primary">品牌色文字</div>
<div class="color-success">成功色文字</div>
<div class="color-warning">警告色文字</div>
<div class="color-danger">危险色文字</div>

<div class="bg-success">成功状态背景</div>
<div class="bg-warning">警告状态背景</div>
<div class="bg-danger">危险状态背景</div>
```

### 阴影效果
```html
<div class="shadow-sm">小阴影</div>
<div class="shadow">默认阴影</div>
<div class="shadow-md">中等阴影</div>
<div class="shadow-lg">大阴影</div>
```

## 🔧 自定义主题

### 修改现有主题
在 `src/config/themes.js` 中修改颜色值：

```javascript
themes: {
  light: {
    colors: {
      '--theme-bg-primary': '#ffffff',
      '--theme-text-primary': '#212529',
      // ... 修改其他颜色
    }
  }
}
```

### 添加新主题
```javascript
themes: {
  // ... 现有主题
  blue: {
    name: '蓝色主题',
    key: 'blue',
    colors: {
      '--theme-bg-primary': '#e3f2fd',
      '--theme-text-primary': '#1976d2',
      // ... 定义所有颜色变量
    }
  }
}
```

### 创建新的混合器
在 `src/styles/themes.less` 中添加：

```less
// 自定义卡片样式
.my-special-card() {
  .theme-card();
  border-radius: 12px;
  padding: 24px;
  
  &:hover {
    transform: translateY(-2px);
    .theme-shadow(lg);
  }
}
```

## 📱 在Vue组件中使用

### 基础用法
```vue
<template>
  <div class="my-component">
    <h1 class="text-primary">{{ title }}</h1>
    <div class="theme-content">
      <!-- 内容 -->
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../styles/themes.less';

.my-component {
  .theme-container();
  
  .theme-content {
    .theme-card();
    padding: 20px;
    margin: 20px 0;
  }
}
</style>
```

### 获取主题信息
```vue
<script>
import { inject, ref, onMounted } from 'vue'

export default {
  setup() {
    const theme = inject('theme')
    const currentTheme = ref(theme.getCurrentTheme())
    
    // 监听主题变化
    const handleThemeChange = () => {
      currentTheme.value = theme.getCurrentTheme()
    }
    
    onMounted(() => {
      window.addEventListener('themeChanged', handleThemeChange)
    })
    
    return {
      currentTheme,
      isDark: () => currentTheme.value.isDark,
      switchTheme: theme.switchTheme
    }
  }
}
</script>
```

### 条件渲染
```vue
<template>
  <div>
    <div v-if="isDark()" class="dark-only-content">
      暗黑主题专用内容
    </div>
    <div v-else class="light-only-content">
      亮色主题专用内容
    </div>
  </div>
</template>
```

## 🎛️ API参考

### 主题管理方法
```javascript
// 切换主题
switchTheme(themeName)          // 切换到指定主题
switchTheme()                   // 在light/dark间切换

// 获取信息
getCurrentTheme()               // 获取当前主题信息
getAvailableThemes()           // 获取所有可用主题
getThemeColor(colorKey)        // 获取主题颜色值

// 工具方法
resetTheme()                   // 重置到默认主题
```

### Vue全局属性
```javascript
// 在组件中可以使用
this.$theme.switch('dark')
this.$theme.current()
this.$theme.getColor('--theme-primary')
this.$theme.utils.isDark()
this.$theme.utils.getValueByTheme('light-value', 'dark-value')
```

### 主题工具函数
```javascript
themeUtils.isDark()            // 是否为暗黑主题
themeUtils.isLight()           // 是否为亮色主题
themeUtils.getCurrentThemeName() // 获取当前主题名
themeUtils.getColor(colorKey)  // 获取颜色值
themeUtils.getValueByTheme(lightValue, darkValue) // 根据主题返回值
```

## 🛠️ 开发工具

### 控制台命令
```javascript
// 主题切换
devTools.light()               // 切换到亮色
devTools.dark()                // 切换到暗黑
devTools.toggleTheme()         // 切换主题

// 查看信息
devTools.showCurrentTheme()    // 查看当前主题
devTools.showAvailableThemes() // 查看所有主题

// 测试功能
devTools.testThemeAnimation()  // 测试切换动画
devTools.resetTheme()          // 重置主题
```

### 主题检测优先级
1. **URL参数** (`?theme=dark`)
2. **Cookie保存** (用户上次选择)
3. **系统偏好** (操作系统设置)
4. **默认主题** (配置中的默认值)

## 🎨 主题变量列表

### 基础颜色
```less
@theme-bg-primary      // 主背景色
@theme-bg-secondary    // 次背景色
@theme-bg-tertiary     // 三级背景色
@theme-bg-hover        // 悬停背景色
@theme-bg-active       // 激活背景色

@theme-text-primary    // 主文字色
@theme-text-secondary  // 次文字色
@theme-text-tertiary   // 三级文字色
@theme-text-disabled   // 禁用文字色
@theme-text-inverse    // 反色文字
```

### 边框和阴影
```less
@theme-border-primary   // 主边框色
@theme-border-secondary // 次边框色
@theme-border-light     // 浅边框色
@theme-border-dark      // 深边框色

@theme-shadow-sm        // 小阴影
@theme-shadow           // 默认阴影
@theme-shadow-md        // 中等阴影
@theme-shadow-lg        // 大阴影
```

### 品牌和状态色
```less
@theme-primary          // 主品牌色
@theme-primary-light    // 浅主品牌色
@theme-primary-dark     // 深主品牌色
@theme-primary-bg       // 主品牌背景色

@theme-success          // 成功色
@theme-warning          // 警告色
@theme-danger           // 危险色
@theme-info             // 信息色
```

## 🔧 最佳实践

### 1. 命名规范
```less
// ✅ 推荐：使用主题变量
.my-component {
  background-color: @theme-bg-primary;
  color: @theme-text-primary;
}

// ❌ 不推荐：硬编码颜色
.my-component {
  background-color: #ffffff;
  color: #333333;
}
```

### 2. 混合器优先
```less
// ✅ 推荐：使用现成的混合器
.my-card {
  .theme-card();
}

// ❌ 不推荐：重复定义样式
.my-card {
  background-color: @theme-card-bg;
  border: 1px solid @theme-card-border;
  box-shadow: @theme-card-shadow;
}
```

### 3. 过渡动画
```less
// ✅ 推荐：添加过渡动画
.my-element {
  .theme-transition();
  background-color: @theme-bg-primary;
}
```

### 4. 响应式主题
```javascript
// ✅ 推荐：监听主题变化
onMounted(() => {
  window.addEventListener('themeChanged', handleThemeChange)
})

onUnmounted(() => {
  window.removeEventListener('themeChanged', handleThemeChange)
})
```

## 🚨 注意事项

1. **避免硬编码颜色**: 始终使用主题变量
2. **添加过渡动画**: 提升用户体验
3. **测试两种主题**: 确保在两种主题下都正常显示
4. **监听主题变化**: 组件需要响应主题切换
5. **避免重复定义**: 优先使用现成的混合器和工具类

## 📦 文件结构

```
src/
├── config/
│   └── themes.js          # 主题配置
├── plugins/
│   └── theme.js           # 主题管理逻辑
├── styles/
│   └── themes.less        # 主题样式和混合器
├── utils/
│   └── devTools.js        # 开发工具(包含主题调试)
├── components/
│   └── ThemeDemo.vue      # 主题演示组件
└── main.js               # 主题系统集成
```

## 🔗 相关链接

- [主题演示组件](../src/components/ThemeDemo.vue)
- [主题配置文件](../src/config/themes.js)
- [主题样式文件](../src/styles/themes.less)
- [开发工具文档](./INITIALIZATION.md#开发工具) 