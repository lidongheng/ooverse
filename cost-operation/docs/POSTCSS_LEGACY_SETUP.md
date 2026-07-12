# PostCSS 兼容配置指南

## 使用 postcss@8.4.41 和 postcss-px-to-viewport@1.1.1

本文档提供在必须使用特定版本 `postcss@8.4.41` 和 `postcss-px-to-viewport@1.1.1` 时的兼容配置方案。

## 🎯 版本要求

- ✅ `postcss@8.4.41` (固定版本)
- ✅ `postcss-px-to-viewport@1.1.1` (固定版本)
- ⚠️ 解决 "postcss.plugin was deprecated" 警告

## 📦 安装指定版本

```bash
# 安装指定版本
npm install --save-dev postcss@8.4.41 postcss-px-to-viewport@1.1.1

# 验证版本
npm list postcss postcss-px-to-viewport
```

## 🔧 配置方案

### 方案1: 屏蔽警告 (推荐)

```javascript
// postcss.config.js
const pxToVw = require('postcss-px-to-viewport');

// 临时屏蔽废弃警告
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0] && args[0].includes && args[0].includes('postcss.plugin was deprecated')) {
    return; // 忽略这个特定警告
  }
  originalWarn.apply(console, args);
};

module.exports = {
  plugins: [
    // 转换源码
    pxToVw({
      viewportWidth: 1920,          // 设计稿宽度
      unitPrecision: 5,             // 转换精度
      selectorBlackList: ['ignore'], // 忽略转换的类名
      minPixelValue: 1,             // 最小转换值
      mediaQuery: false,            // 不转换媒体查询
      exclude: /node_modules/,      // 排除第三方包
    }),

    // 专门处理 Element Plus
    pxToVw({
      viewportWidth: 1920,
      unitPrecision: 5,
      selectorBlackList: ['ignore'],
      minPixelValue: 1,
      mediaQuery: false,
      include: [/node_modules[\\\/]element-plus/], // 只转换element-plus
    }),
  ]
};
```

### 方案2: 环境变量控制

```javascript
// postcss.config.js
const pxToVw = require('postcss-px-to-viewport');

const isDev = process.env.NODE_ENV === 'development';
const enablePxToVw = process.env.ENABLE_PX_TO_VW !== 'false';

// 屏蔽警告
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('postcss.plugin was deprecated')) return;
  originalWarn.apply(console, args);
};

module.exports = {
  plugins: enablePxToVw ? [
    pxToVw({
      viewportWidth: 1920,
      unitPrecision: isDev ? 5 : 3, // 开发环境更高精度
      selectorBlackList: ['ignore'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: /node_modules/,
    }),
    pxToVw({
      viewportWidth: 1920,
      unitPrecision: isDev ? 5 : 3,
      selectorBlackList: ['ignore'],
      minPixelValue: 1,
      mediaQuery: false,
      include: [/node_modules[\\\/]element-plus/],
    }),
  ] : []
};
```

### 方案3: 包装函数

```javascript
// postcss.config.js
const pxToVw = require('postcss-px-to-viewport');

// 屏蔽警告
console.warn = (msg, ...args) => {
  if (typeof msg === 'string' && msg.includes('postcss.plugin was deprecated')) {
    return;
  }
  console.warn(msg, ...args);
};

function createPxToVwConfig(options) {
  try {
    return pxToVw(options);
  } catch (error) {
    console.error('PostCSS px-to-viewport 配置错误:', error.message);
    return null;
  }
}

module.exports = {
  plugins: [
    createPxToVwConfig({
      viewportWidth: 1920,
      unitPrecision: 5,
      selectorBlackList: ['ignore'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: /node_modules/,
    }),
    createPxToVwConfig({
      viewportWidth: 1920,
      unitPrecision: 5,
      selectorBlackList: ['ignore'],
      minPixelValue: 1,
      mediaQuery: false,
      include: [/node_modules[\\\/]element-plus/],
    }),
  ].filter(Boolean)
};
```

### 方案4: 最简配置

```javascript
// postcss.config.js
// 直接忽略警告，使用最简配置
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 1920,
      exclude: /node_modules/,
    }),
    require('postcss-px-to-viewport')({
      viewportWidth: 1920,
      include: [/element-plus/],
    }),
  ]
};
```

## 🔧 配置参数详解

### 基础参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `viewportWidth` | Number | 320 | 设计稿宽度 |
| `unitPrecision` | Number | 5 | 转换后保留小数位数 |
| `selectorBlackList` | Array | [] | 不转换的选择器列表 |
| `minPixelValue` | Number | 1 | 最小转换像素值 |
| `mediaQuery` | Boolean | false | 是否转换媒体查询中的px |

### 文件过滤参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `include` | RegExp/Array | 只处理匹配的文件 | `/element-plus/` |
| `exclude` | RegExp/Array | 排除匹配的文件 | `/node_modules/` |

## 📱 转换效果

### 1920px 设计稿转换表

| 原始值 | 转换结果 | 计算 |
|--------|----------|------|
| `300px` | `15.625vw` | 300÷1920×100 |
| `200px` | `10.41667vw` | 200÷1920×100 |
| `100px` | `5.20833vw` | 100÷1920×100 |
| `50px` | `2.60417vw` | 50÷1920×100 |
| `20px` | `1.04167vw` | 20÷1920×100 |
| `16px` | `0.83333vw` | 16÷1920×100 |

## 🚨 注意事项

### 1. 警告处理
```javascript
// ✅ 正确: 只屏蔽特定警告
console.warn = function(...args) {
  if (args[0]?.includes?.('postcss.plugin was deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};

// ❌ 错误: 屏蔽所有警告
console.warn = () => {};
```

### 2. 正则表达式兼容性
```javascript
// ✅ 跨平台兼容
include: [/node_modules[\\\/]element-plus/]

// ❌ 可能在 Windows 下失败
include: [/node_modules\/element-plus/]
```

### 3. 避免重复转换
```javascript
// ✅ 正确: 明确分离
plugins: [
  pxToVw({ exclude: /node_modules/ }),     // 只转换源码
  pxToVw({ include: [/element-plus/] }),   // 只转换element-plus
]

// ❌ 错误: 可能重复处理
plugins: [
  pxToVw({ /* 没有include/exclude */ }),
  pxToVw({ include: [/element-plus/] }),
]
```

## 🧪 测试验证

### 启动项目
```bash
npm run serve
```

### 检查警告
启动后观察控制台输出，应该看到：
- ✅ 没有 "postcss.plugin was deprecated" 警告
- ✅ 正常的编译信息
- ✅ px 值正确转换为 vw

### 验证转换
1. 访问 `http://localhost:8081/#/postcss-demo`
2. 打开开发者工具查看计算样式
3. 确认 px 值已转换为 vw

## 🔄 故障排除

### 问题1: 仍有废弃警告
```javascript
// 解决方案: 确保警告屏蔽在配置最前面
const originalWarn = console.warn;
console.warn = function(...args) {
  // 警告过滤逻辑
};

// 然后才是插件配置
const pxToVw = require('postcss-px-to-viewport');
```

### 问题2: 转换不生效
```javascript
// 检查正则表达式语法
include: [/node_modules[\\\/]element-plus/] // ✅
include: [/node_modules\/element-plus/]     // ❌ Windows兼容性问题
```

### 问题3: 构建失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run serve
```

## 📚 参考资源

- [postcss-px-to-viewport@1.1.1 文档](https://github.com/evrone/postcss-px-to-viewport/tree/v1.1.1)
- [PostCSS 8.4.41 发布说明](https://github.com/postcss/postcss/releases/tag/8.4.41)
- [Vue CLI CSS 配置](https://cli.vuejs.org/guide/css.html#postcss) 