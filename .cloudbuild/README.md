# 前端 CI 构建说明

`.cloudbuild` 用于保存企业 CI 流水线需要执行的构建脚本和 Docker 镜像配置。

当前阶段负责：

```text
从 Git 拉取代码
→ 进入项目根目录
→ 安装依赖
→ 构建四个前端项目
→ 整理统一静态文件目录
→ 为 Docker 构建准备上下文
```

镜像仓库登录、镜像推送和 Kubernetes 部署将在后续阶段接入。

## 文件说明

```text
.cloudbuild/
├── README.md
├── build.sh
├── build_npm.sh
├── Dockerfile
├── start.sh
├── build_backup.sh
├── Dockerfile_backup
└── start_backup.sh
```

- `build.sh`：优先使用的 pnpm 构建脚本。
- `build_npm.sh`：CI 无法使用 pnpm 时的 npm 备用构建脚本。
- `Dockerfile`：将统一产物复制进 Nginx 镜像。
- `start.sh`：保留的 Nginx 启动脚本，当前 Dockerfile 不再复制或执行它。
- `*_backup`：改造前的企业样例备份，不参与当前构建。

## 项目与产物目录

仓库包含四个前端项目：

| 项目 | 包名 | 构建产物 |
| --- | --- | --- |
| cost-operation | `@ooverse/cost-operation` | `cost-operation/dist/cost-operation/` |
| digital-map-cost | `@ooverse/digital-map-cost` | `digital-map-cost/dist/digital-map-cost/` |
| ioc | `@ooverse/ioc` | `ioc/dist/ioc/` |
| operation-map | `@ooverse/operation-map` | `operation-map/dist/operation-map/` |

构建脚本会把四份产物整理为：

```text
ooverse/
├── cost-operation/
├── digital-map-cost/
├── ioc/
└── operation-map/
```

`ooverse/` 位于仓库根目录，只是临时构建目录，已经加入根 `.gitignore`，不会提交到 Git。

## PROFILE 构建环境

执行脚本时必须设置 `PROFILE`：

| PROFILE | package.json 脚本 | 用途 |
| --- | --- | --- |
| `sit` | `build:sit` | SIT 测试环境 |
| `uat` | `build:uat` | UAT 验收环境 |
| `prod` | `build` | 生产环境 |

没有设置 `PROFILE` 或传入其他值时，脚本会直接停止，不会自动选择环境。

## 使用 pnpm 构建

推荐 CI 执行：

```bash
PROFILE=sit sh .cloudbuild/build.sh
```

生产环境示例：

```bash
PROFILE=prod sh .cloudbuild/build.sh
```

`build.sh` 使用：

```bash
npx --yes pnpm@10.12.3 install --frozen-lockfile
```

含义如下：

- `npx --yes`：自动同意临时下载，不等待 CI 人工输入。
- `pnpm@10.12.3`：每次临时下载固定版本，避免 pnpm 11 的供应链策略询问和配置兼容问题。
- `install`：安装 workspace 全部依赖。
- `--frozen-lockfile`：严格按照根 `pnpm-lock.yaml` 安装，禁止 CI 自动修改锁文件。

如果开发人员修改了 `package.json`，必须在本地执行 `pnpm install`，并把更新后的 `pnpm-lock.yaml` 一起提交，否则 CI 会因锁文件不一致而失败。

pnpm 能读取根目录的 `pnpm-workspace.yaml`，因此一次安装即可处理四个项目。

## 使用 npm 备用构建

当 CI 无法临时下载 pnpm 时，可以执行：

```bash
PROFILE=sit sh .cloudbuild/build_npm.sh
```

npm 不识别 `pnpm-workspace.yaml`，所以 `build_npm.sh` 会分别安装四个项目：

```bash
npm install --prefix cost-operation
npm install --prefix digital-map-cost
npm install --prefix ioc
npm install --prefix operation-map
```

随后分别通过以下形式执行构建：

```bash
npm --prefix <项目目录> run <构建脚本>
```

注意：

- npm 方案不会使用根 `pnpm-lock.yaml`。
- 项目没有 npm 锁文件时，npm 可能生成 `package-lock.json`。
- pnpm 与 npm 的依赖解析结果可能不同。
- pnpm 是主构建方案，npm 只作为无法使用 pnpm 时的备用方案。

## 构建脚本执行顺序

两份脚本的业务流程相同：

1. 检查 `PROFILE`。
2. 确定运行 `build:sit`、`build:uat` 或 `build`。
3. 检查 Node.js 和包管理器版本。
4. 安装依赖。
5. 依次构建四个项目。
6. 删除上一轮根目录 `ooverse/`。
7. 创建四个应用目录。
8. 把四份构建产物复制到 `ooverse/`。
9. 检查四个目录中是否存在 `index.html`。
10. 全部检查通过后输出完成信息。

脚本使用：

```sh
set -ex
```

- `-e`：任意命令失败时立即终止脚本。
- `-x`：把执行的命令打印到流水线日志，便于排查问题。

因此，任意一个项目构建失败时，不会继续整理产物或构建错误镜像。

## 统一产物检查

成功后必须存在：

```text
ooverse/cost-operation/index.html
ooverse/digital-map-cost/index.html
ooverse/ioc/index.html
ooverse/operation-map/index.html
```

缺少任意一个入口文件，脚本都会执行 `exit 1`，让 CI 任务失败。

## Dockerfile 原理

Dockerfile 使用 Nginx 作为基础镜像：

```dockerfile
FROM nginx:1.31.2
```

统一产物通过下面的命令进入镜像：

```dockerfile
COPY ooverse/ /usr/share/nginx/html/ooverse/
```

镜像内目录为：

```text
/usr/share/nginx/html/ooverse/
├── cost-operation/
├── digital-map-cost/
├── ioc/
└── operation-map/
```

对应生产访问路径：

```text
/ooverse/cost-operation/
/ooverse/digital-map-cost/
/ooverse/ioc/
/ooverse/operation-map/
```

## Nginx 启动原理

容器不能让 Nginx 在后台运行，否则容器主进程退出后，容器也会停止。

当前 Dockerfile 直接使用官方 Nginx 启动命令：

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

- `daemon off;`：让 Nginx 在前台运行。
- exec 格式的 `CMD` 不经过 Shell，Nginx 会直接成为容器主进程并接收 Kubernetes 的停止信号。
- `start.sh` 当前只作为备用文件保留，不参与镜像构建和容器启动。

## 下一阶段

前端构建和统一产物整理稳定后，再在 CI 中增加：

```text
docker build
→ docker login 企业镜像仓库
→ docker push
→ 更新 Kubernetes Deployment 镜像版本
```

镜像仓库地址、登录凭据、镜像标签规则、Kubernetes namespace 和域名需要由企业环境提供，不能写死在当前脚本中。

## 常见问题

### package.json 和 pnpm-lock.yaml 不一致

错误通常包含：

```text
ERR_PNPM_OUTDATED_LOCKFILE
```

解决方法是在开发环境执行：

```bash
pnpm install
```

然后提交新的 `pnpm-lock.yaml`。

### 构建完成但没有 zip

检查对应项目的构建脚本是否使用生产环境，以及项目的构建配置是否注册了 zip 插件。

统一 Docker 目录复制的是解压后的项目产物，不依赖各项目 zip。

### CI 一直等待输入

通常表示构建工作区残留旧 `node_modules`，pnpm 正在询问是否重新安装。最稳妥的方式是让 CI 每次使用干净工作区。

### ooverse 目录有旧文件

构建脚本会先执行：

```sh
rm -rf ooverse
```

如果流水线没有执行到这一步，说明前面的依赖安装或项目构建已经失败，应查看更早的日志。
