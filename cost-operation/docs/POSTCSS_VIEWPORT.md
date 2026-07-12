# PostCSS px-to-viewport 配置指南

本项目已配置 `postcss-px-to-viewport-8-plugin` 来实现 px 单位到 vw 单位的自动转换，支持桌面端响应式设计。

## 🎯 配置目标

- ✅ **自己的源码** (`src/` 目录) - px 转换为 vw
- ✅ **Element Plus 组件** - px 转换为 vw  
- ❌ **其他第三方包** - 保持 px 不变，避免样式错乱

## 📁 相关文件

### 1. PostCSS 配置文件
```javascript
// postcss.config.js
const pxToVw = require('postcss-px-to-viewport-8-plugin');

module.exports = {
  plugins: [
    // 转换源码
    pxToVw({
      unitToConvert: 'px',
      viewportWidth: 1920,         // 桌面端设计稿宽度
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      mediaQuery: true,
      minPixelValue: 0,
      replace: true,
      exclude: /node_modules/,     // 排除 node_modules
    }),
    
    // 专门转换 Element Plus
    pxToVw({
      unitToConvert: 'px',
      viewportWidth: 1920,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      mediaQuery: true,
      minPixelValue: 0,
      replace: true,
      include: [/node_modules\/element-plus/], // 只包含 element-plus
    }),
  ],
};
```

### 2. Vue CLI 配置
```javascript
// vue.config.js
module.exports = defineConfig({
  css: {
    sourceMap: true,  // 开启CSS源码映射
    loaderOptions: {
      postcss: {
        // PostCSS 配置从 postcss.config.js 读取
      }
    }
  }
});
```

## 🔧 配置参数说明

| 参数 | 说明 | 当前值 |
|------|------|--------|
| `unitToConvert` | 需要转换的单位 | `'px'` |
| `viewportWidth` | 设计稿宽度 (px) | `1920` (桌面端) |
| `viewportUnit` | 转换后的单位 | `'vw'` |
| `fontViewportUnit` | 字体转换单位 | `'vw'` |
| `mediaQuery` | 转换媒体查询 | `true` |
| `minPixelValue` | 最小转换值 | `0` |
| `replace` | 替换原值 | `true` |
| `exclude` | 排除文件/目录 | `/node_modules/` |
| `include` | 包含文件/目录 | `/element-plus/` |

## 📱 转换示例

### 设计稿宽度 1920px 时的转换

| 原始 px | 转换后 vw | 计算公式 |
|---------|-----------|----------|
| `1920px` | `100vw` | 1920 ÷ 1920 × 100 |
| `960px` | `50vw` | 960 ÷ 1920 × 100 |
| `300px` | `15.625vw` | 300 ÷ 1920 × 100 |
| `200px` | `10.41667vw` | 200 ÷ 1920 × 100 |
| `50px` | `2.60417vw` | 50 ÷ 1920 × 100 |
| `20px` | `1.04167vw` | 20 ÷ 1920 × 100 |

### CSS 转换前后对比

```css
/* 转换前 */
.container {
  width: 300px;
  height: 200px;
  padding: 20px;
  margin: 15px;
  font-size: 16px;
}

/* 转换后 (1920px 设计稿) */
.container {
  width: 15.625vw;    /* 300 ÷ 1920 × 100 */
  height: 10.41667vw; /* 200 ÷ 1920 × 100 */
  padding: 1.04167vw; /* 20 ÷ 1920 × 100 */
  margin: 0.78125vw;  /* 15 ÷ 1920 × 100 */
  font-size: 0.83333vw; /* 16 ÷ 1920 × 100 */
}
```

## 🎨 使用技巧

### 1. 忽略特定样式转换
```css
/* 方法1: 使用 ignore 类名 */
.ignore {
  width: 100px; /* 不会被转换 */
}

/* 方法2: 使用注释 */
.container {
  width: 300px; /* 会被转换 */
  /* postcss-px-to-viewport-ignore-next */
  height: 200px; /* 不会被转换 */
}

/* 方法3: 使用大写 PX */
.fixed-size {
  width: 100PX; /* 不会被转换 */
}
```

### 2. 不同设计稿宽度适配
```javascript
// 根据实际设计稿调整 viewportWidth
// 1920px 设计稿 (桌面端)
viewportWidth: 1920

// 1440px 设计稿
viewportWidth: 1440

// 375px 设计稿 (移动端)
viewportWidth: 375
```

### 3. Element Plus 组件样式调整
```vue
<template>
  <el-button class="custom-button">按钮</el-button>
</template>

<style>
/* Element Plus 的 padding、margin 会自动转换为 vw */
.custom-button {
  margin: 10px; /* 转换为 0.52083vw */
}

/* 如果需要保持固定尺寸 */
.custom-button.ignore {
  margin: 10px; /* 保持 px */
}
</style>
```

## 🧪 测试验证

### 访问测试页面
```
http://localhost:8081/#/postcss-demo
```

### 检查转换结果
1. 打开浏览器开发者工具
2. 查看 Elements 面板的 Computed 样式
3. 确认 px 值是否转换为 vw
4. 使用页面内的"检查样式转换结果"按钮

### 预期结果
- ✅ 源码中的 px 值转换为 vw
- ✅ Element Plus 组件的 px 值转换为 vw
- ✅ 其他第三方库保持 px 不变
- ✅ 桌面端设备自适应正常

## ⚠️ 重要更新

### 插件升级
我们已将插件从 `postcss-px-to-viewport@1.1.1` 升级到 `postcss-px-to-viewport-8-plugin`，解决了以下问题：

1. **PostCSS 兼容性** - 新插件兼容 PostCSS 8+
2. **废弃警告修复** - 不再有 `postcss.plugin was deprecated` 警告
3. **更好的配置支持** - 支持更多配置选项

### 安装命令
```bash
# 卸载旧版本
npm uninstall postcss-px-to-viewport

# 安装新版本
npm install --save-dev postcss-px-to-viewport-8-plugin
```

## 🚨 注意事项

### 1. 设计稿尺寸一致性
确保 `viewportWidth` 与实际设计稿宽度一致。当前配置为 1920px 桌面端设计稿。

### 2. 最小像素值设置
```javascript
minPixelValue: 0, // 所有px值都转换
```

设置为 0 意味着所有 px 值都会被转换，包括 1px 的边框。

### 3. 字体大小处理
字体大小转换为 vw 后会根据屏幕宽度缩放：
```css
/* 16px 字体在不同屏幕的表现 */
font-size: 0.83333vw; /* 16 ÷ 1920 × 100 */

/* 1920px 屏幕: 0.83333vw = 16px */
/* 1440px 屏幕: 0.83333vw = 12px */
/* 2560px 屏幕: 0.83333vw = 21.33px */
```

### 4. 媒体查询转换
当前配置 `mediaQuery: true`，媒体查询中的 px 也会被转换：
```css
/* 转换前 */
@media (max-width: 768px) {
  .container { width: 300px; }
}

/* 转换后 */
@media (max-width: 40vw) {
  .container { width: 15.625vw; }
}
```

## 🔧 自定义配置

### 不同环境使用不同配置
```javascript
// postcss.config.js
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  plugins: [
    pxToVw({
      viewportWidth: 1920,
      minPixelValue: isDevelopment ? 0 : 1, // 开发环境转换所有值
      // ... 其他配置
    }),
  ],
};
```

### 移动端适配
如需同时支持移动端，可以配置多个插件实例：
```javascript
module.exports = {
  plugins: [
    // 桌面端配置
    pxToVw({
      viewportWidth: 1920,
      exclude: [/node_modules/, /mobile/],
    }),
    
    // 移动端配置
    pxToVw({
      viewportWidth: 375,
      include: [/mobile/],
    }),
  ],
};
```

## 📚 相关资源

- [postcss-px-to-viewport-8-plugin 官方文档](https://github.com/lkxian888/postcss-px-to-viewport-8-plugin)
- [Vue CLI CSS 预处理器配置](https://cli.vuejs.org/guide/css.html)
- [桌面端响应式设计指南](https://web.dev/responsive-web-design-basics/)

## 🎯 最佳实践

1. **统一设计稿规范** - 确保设计稿宽度固定为 1920px
2. **渐进式应用** - 新页面使用 vw，老页面逐步迁移
3. **测试多分辨率** - 在不同分辨率显示器上验证效果
4. **性能监控** - 关注转换后的性能影响
5. **版本控制** - 重要配置变更要有版本记录 