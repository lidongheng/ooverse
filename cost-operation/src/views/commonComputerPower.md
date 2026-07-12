# commonComputerPower.vue 代码逻辑简述

该文件实现了一个**散点气泡图**，用于展示「销毛率」与「分配率」的关系，核心是 ECharts 的 scatter 系列和自定义 graphic。

---

## 一、数据结构（约 18–37 行）

`data` 中每个点包含：

| 字段 | 含义 |
|------|------|
| `name` | 区域标识（如 华北-北京--AZ1-c6-mgr-2） |
| `x` | 分配率（0–100），对应 X 轴，气泡内下方小字 |
| `y` | 销毛率（-200–200），对应 Y 轴，气泡内上方大字 |
| `tailDirection` | 气泡尾巴方向：`bottom` / `top` / `left` / `right`。文字位置：bottom→下方，top→上方，left→右侧，right→左侧 |
| `labelOffset` | 气泡内数字偏移 `[dx, dy]` |
| `color` | 气泡颜色（优先级最高），不填则按销毛率：y≥0 盈利(#1bcc8e)、y<0 亏损(#f55b5b) |
| `symbolSize` | 气泡大小（像素，代表服务器规模），完全靠配置写死，不填则默认 72 |

---

## 二、核心函数

### 1. `getColor(d)`（约 68–74 行）

根据销毛率：y≥0 返回盈利色 `#1bcc8e`，y<0 返回亏损色 `#f55b5b`。`color` 字段优先级最高。

### 2. `makeBubbleSvg(hexColor, tailDirection)`（约 65–88 行）

生成带尾巴的气泡 SVG：

- 基础形状：圆 + 正三角形（边长 8，与原先最短边一致）
- 通过 `tailDirection` 控制尾巴方向（top/left/right 用 `transform` 旋转）
- 使用 60×60 的 viewBox 保证是正圆

### 3. `buildOption()`（约 90–203 行）

构建 ECharts 配置：

- **坐标轴**：X 轴 0–100（分配率），Y 轴 -200–200（销毛率），虚线颜色 `#9e9ed1`、线宽 3。X/Y 轴箭头均由 graphic polygon 绘制（同款三角）。刻度由 graphic 绘制：X 轴箭头右侧「100%」、下方「分配率」，Y 轴顶部「200%」、底部「-200%」、0 点左侧「0」。grid right 设为 80，使趋势图更宽
- **scatter 系列**：用 `makeBubbleSvg` 作为 symbol，气泡内显示两行：上方销毛率(y)、下方分配率(x)
- **markLine**：y=0 灰色虚线、x=avgX 粉色虚线（分配率平均值），不显示默认 label，避免出现多余的 0；「平均值」文字由 graphic 在粉色虚线上方单独绘制

### 4. `updateGraphicLabels()`（约 206–284 行）

在图表渲染后，用 `graphic` 精确放置：

- **四象限背景**：由平均值线（垂直）和 y=0 线（水平）划分为 4 个区域，各带渐变色（盈利区绿色系、亏损区粉色系）。渐变方向：左上/右上 上→下，左下/右下 下→上。每个象限两个圆角（上方象限顶部两角、下方象限底部两角，半径 16px），中间交界处直角
- **区域标签**：4 个角落分别标注「低/高分配率 盈利区/亏损区」，盈利区绿色、亏损区红色
- **右上角图例**：盈利、亏损（彩色圆点）、服务器规模（气泡 pin 图标）
- x 轴右端、Y 轴顶端、Y 轴底端三角箭头（均用 graphic polygon 绘制）
- x 轴「100%」、Y 轴「200%」「-200%」「0」刻度标签
- 粉色虚线上方的「平均值」
- 每个气泡旁的名称标签（字号 14px，颜色与气泡一致：盈利 `#1bcc8e`、亏损 `#f55b5b`）

---

## 三、数据到像素的换算

在 `updateGraphicLabels` 中，用线性映射把数据坐标转为像素：

```
px = gl + (x - xMin) / (xMax - xMin) * w
py = gt + (1 - (y - yMin) / (yMax - yMin)) * h
```

其中 `gl, gr, gt, gb` 为 grid 边距，`w, h` 为绘图区宽高。

---

## 四、生命周期

- **onMounted**：初始化 ECharts，`setOption`，约 100ms 后调用 `updateGraphicLabels`（等布局稳定）
- **resize**：窗口变化时 `chart.resize()`，再延迟 50ms 调用 `updateGraphicLabels` 重新计算 graphic 位置
- **onBeforeUnmount**：移除 resize 监听并 `chart.dispose()`

---

## 五、开发时注意点

1. **数据源**：修改 `data` 即可更新图表，`avgX` 会随数据自动计算。
2. **气泡样式**：改 `BUBBLE_CIRCLE`、`BUBBLE_PATH` 或 `makeBubbleSvg` 的 configs。
3. **颜色**：优先 `color`，否则按销毛率：y≥0 盈利 `#1bcc8e`、y<0 亏损 `#f55b5b`。
4. **graphic 位置**：所有 graphic 在 `updateGraphicLabels` 中计算，改 grid 或坐标范围时要同步检查这里的公式。
5. **文字与尾巴方向**：`tailDirection` 决定气泡尾巴方向，名称标签位置：bottom→下方，top→上方，left→右侧，right→左侧。名称颜色与气泡一致（盈利/亏损）。
6. **平均值与分配率**：两者字体一致（16px、bold、`#353575`）。
7. **四象限圆角**：`shape.r` 为 `[topLeft, topRight, bottomRight, bottomLeft]`，上方象限 `[16,16,0,0]`，下方象限 `[0,0,16,16]`。
8. **图例位置**：`lx = chartW - totalLegendW - 16`，使图例靠右显示。
