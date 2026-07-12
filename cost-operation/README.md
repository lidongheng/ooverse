# InfraMap - 基础设施地图

基于 Vue 3 的基础设施资源可视化平台。

## 技术栈

Vue 3 + Element Plus + ECharts + Vue Router + Vuex/Pinia + Vue I18n

## 功能模块

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/commonComputerPower` | 通用算力资源 |
| `/generalCompute` | 通用计算资源 |
| `/aiCompute` | AI 算力资源 |
| `/PLAnalysis` | 损益分析 |
| `/profitLossTrend` | 损益趋势 |

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 开发环境
npm run build        # 生产构建
npm run build-sit    # SIT 环境构建
npm run build-uat    # UAT 环境构建
npm run lint:fix     # 代码检查并修复
```

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── composables/   # 组合式函数
├── config/        # 配置文件
├── locales/       # 国际化
├── plugins/       # 插件配置
├── router/        # 路由
├── store/         # 状态管理
├── styles/        # 样式
├── utils/         # 工具函数
└── views/         # 页面组件
```

## 特性

- 多环境构建（dev/sit/uat/prod）
- 完善的路由守卫系统
- 国际化支持
- 主题切换
- 响应式设计

## 浏览器支持

> 1% 市场份额，不支持 IE 11