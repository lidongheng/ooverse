# operationMap

`operationMap` 是 `digitalMapCost` 迁移到 Vite + Vue 3.5 的目标项目。项目初始只提供干净的 Vite 运行壳，不直接搬运或修改 `digitalMapCost` 的业务代码。

## 常用命令

在仓库根目录执行：

```bash
pnpm install
pnpm --filter @kooVerse-web/operation-map dev
pnpm --filter @kooVerse-web/operation-map type-check
pnpm --filter @kooVerse-web/operation-map build
pnpm --filter @kooVerse-web/operation-map preview
```

## 目录结构

```text
operationMap
├── index.html
├── package.json
├── README.md
├── src
│   ├── App.vue
│   ├── main.ts
│   ├── router
│   │   └── index.ts
│   ├── views
│   │   └── HomeView.vue
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 路径别名

- `@` 指向 `operationMap/src`
- `@shared` 指向仓库根目录的 `shared`

示例：

```ts
import SvgIcon from '@shared/components/SvgIcon.vue';
```

## TS/JS 兼容说明

迁移阶段允许 `.ts`、`.js`、`.vue` 文件共存。`tsconfig.app.json` 中已开启 `allowJs`，并关闭 `checkJs`，避免旧 JS 代码迁移时被类型检查阻塞。

`operationMap/src/**/*.js` 和 `../shared/**/*.js` 已纳入 TypeScript 解析范围，方便迁移 `digitalMapCost` 现有 JS 文件和继续复用 `shared` 中的公共 JS。

## 迁移注意事项

`digitalMapCost` 中的 Vue CLI 或 webpack 专属写法不要直接照搬到 Vite 项目中，后续按模块迁移时再做最小改造：

- `require.context` 改为 `import.meta.glob`
- `process.env.VUE_APP_*` 改为 `import.meta.env.VITE_*`
- webpack svg-sprite-loader 相关逻辑按实际模块依赖单独迁移
- 旧 devServer 代理配置按接口使用情况迁移到 Vite server proxy
