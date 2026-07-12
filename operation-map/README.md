# operation-map

`operation-map` 是 `digital-map-cost` 迁移到 Vite + TypeScript 的重构项目。当前工程只提供迁移所需的基础能力，业务模块后续按功能逐步迁入。

## 常用命令

在仓库根目录执行：

```bash
pnpm install
pnpm --filter @ooverse/operation-map dev
pnpm --filter @ooverse/operation-map type-check
pnpm --filter @ooverse/operation-map build
pnpm --filter @ooverse/operation-map preview
```

## 构建与部署

- 本地开发路径：`/`
- 生产访问路径：`/ooverse/operation-map/`
- 生产输出目录：`operation-map/dist/operation-map/`
- 压缩包：`operation-map/dist/operation-map.zip`
- 路由模式：Hash Router

构建时会生成 gzip 文件，并将生产目录打包为 zip，供后续 Docker 镜像复制使用。

## 工程能力

- Vite 6 + Vue 3.5 + TypeScript 5.7
- Element Plus 2.14.3 全局注册
- `@` 指向 `operation-map/src`
- `@shared` 指向仓库根目录的 `shared`
- 生产资源使用时间戳文件名
- Element Plus 与其他第三方依赖分包
- 1920px 设计稿的 PostCSS `px` 转 `vw`
- Vue production source map 关闭

## TS/JS 共存

迁移阶段允许 `.ts`、`.js`、`.vue` 文件共存：

- `allowJs: true`：TypeScript 接受迁入的 JavaScript 文件。
- `checkJs: false`：暂不对旧 JavaScript 做类型检查。
- `src` 和根目录 `shared` 中的 TS、JS、Vue 文件都会参与解析。

新增框架代码优先使用 TypeScript；从 `digital-map-cost` 迁入的 JavaScript 可以先保持原样，再逐步重构。

## Vue CLI 到 Vite 的迁移规则

- `process.env.VUE_APP_*` 改为 `import.meta.env.VITE_*`。
- `require.context` 改为 `import.meta.glob`。
- Webpack loader 或 plugin 不能直接复制到 Vite 配置。
- Vue CLI 的 `publicPath` 对应 Vite 的 `base`。
- Vue CLI 的 `outputDir` 对应 Vite 的 `build.outDir`。
