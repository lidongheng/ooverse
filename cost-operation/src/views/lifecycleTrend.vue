<template>
  <div class="lifecycle-trend-page">
    <section class="trend-card">
      <header class="trend-header">
        <div class="title-wrap">
          <span class="title-icon">
            <span class="title-line"></span>
          </span>
          <span class="title">累计盈亏</span>
          <span class="summary">上线 <strong>69</strong> 个月，累计亏损 <strong>146.61</strong> 万元;</span>
        </div>
        <div class="legend">
          <span class="legend-item flow">累计流水</span>
          <span class="legend-item cost">累计成本</span>
        </div>
      </header>
      <CommonChart
        ref="chartRef"
        class="trend-chart"
        :options="options"
        :style="chartStyle"
        @chartReady="onChartReady"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import CommonChart from "@/components/CommonChart.vue";

const chartRef = ref(null);
let chart = null;
const chartWidth = ref(1600);

const months = [
  "202007", "202012", "202105", "202110", "202203", "202208", "202301",
  "202306", "202311", "202404", "202409", "202502", "202507", "202512",
  "202602", "202603", "202604", "202605",
];

const fullXAxisLabels = [
  "202007", "202012", "202105", "202110", "202203", "202208", "202301",
  "202306", "202311", "202404", "202409", "202502", "202507", "202512",
  "202605",
];

const compactXAxisLabels = [
  "202007", "202105", "202203", "202301", "202311", "202409", "202512",
  "202605",
];

const phaseRanges = [
  { name: "起步爬坡", start: 0, end: 2 },
  { name: "主力售卖", start: 2, end: 12 },
  { name: "存量经营", start: 12, end: 15 },
  { name: "整合下线", start: 15, end: 17 },
];

const flowData = [
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  50.41, 25.31, 37.04, { value: 13.77, label: { position: "bottom" } }, null,
];

const costData = [
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  197.02, 94.55, 145.12, { value: 40.43, label: { position: "right" } }, null,
];

const axisColor = "#757aa5";
const chartFont = '"Microsoft YaHei", "PingFang SC", Arial, sans-serif';

const chartStyle = computed(() => ({
  width: chartWidth.value,
  height: 460,
}));

function getVisibleXAxisLabels() {
  return new Set(chartWidth.value >= 1500 ? fullXAxisLabels : compactXAxisLabels);
}

function buildOption() {
  const visibleXAxisLabels = getVisibleXAxisLabels();
  return {
    animation: false,
    grid: {
      left: 104,
      right: 54,
      top: 122,
      bottom: 58,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { color: "#a8acc9", type: "dashed" } },
      formatter(params) {
        const lines = params
          .filter((item) => item.value != null)
          .map((item) => `${item.marker}${item.seriesName}: ${Number(item.value).toFixed(2)} 万元`);
        return [`<strong>${params[0]?.axisValue ?? ""}</strong>`, ...lines].join("<br/>");
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: months,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        interval: (_index, value) => visibleXAxisLabels.has(value),
        showMinLabel: true,
        showMaxLabel: true,
        color: "#656b91",
        fontSize: 18,
        fontFamily: chartFont,
        margin: 16,
      },
      splitLine: {
        show: true,
        lineStyle: { color: "#d8dceb", width: 1 },
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 210,
      interval: 30,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#656b91",
        fontSize: 18,
        fontFamily: chartFont,
        margin: 18,
      },
      splitLine: {
        show: true,
        lineStyle: { color: "#d8dceb", width: 1 },
      },
    },
    series: [
      {
        name: "累计流水",
        type: "line",
        data: flowData,
        connectNulls: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: "#2d9d82", width: 3 },
        itemStyle: { color: "#dfe8e3", borderColor: "#2d9d82", borderWidth: 3 },
        label: {
          show: true,
          position: "top",
          color: "#333650",
          fontSize: 16,
          formatter: ({ value }) => (value == null ? "" : Number(value).toFixed(2)),
        },
      },
      {
        name: "累计成本",
        type: "line",
        data: costData,
        connectNulls: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: "#383b61", width: 3 },
        itemStyle: { color: "#dfe1e8", borderColor: "#383b61", borderWidth: 3 },
        label: {
          show: true,
          position: "top",
          color: "#333650",
          fontSize: 16,
          formatter: ({ value }) => (value == null ? "" : Number(value).toFixed(2)),
        },
      },
    ],
  };
}

const options = computed(() => buildOption());

function pxNumber(value, fallback) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function updateGraphicElements() {
  if (!chart) return;
  // 所有 graphic 都依赖 ECharts 计算后的 grid 像素位置，必须从当前实例读取。
  const opts = chart.getOption();
  const grid = opts.grid?.[0] ?? {};
  const left = pxNumber(grid.left, 104);
  const right = pxNumber(grid.right, 54);
  const top = pxNumber(grid.top, 122);
  const bottom = pxNumber(grid.bottom, 58);
  const width = chart.getWidth() - left - right;
  const height = chart.getHeight() - top - bottom;
  const bottomY = top + height;
  const endX = left + width;
  const graphics = [];
  const silent = { silent: true, cursor: "default" };

  // Y 轴单位：ECharts 默认 axis name 不好贴齐参考图，这里用 graphic 文本固定在轴左上。
  graphics.push({
    type: "text",
    position: [left - 62, top - 42],
    style: {
      text: "万元",
      fill: "#656b91",
      fontSize: 18,
      fontFamily: chartFont,
      align: "left",
      verticalAlign: "middle",
    },
    z: 10,
    ...silent,
  });

  // 生命周期阶段条：根据月份在 xAxis 上的真实像素位置，画顶部灰色阶段背景和阶段名称。
  phaseRanges.forEach((phase) => {
    const startX = chart.convertToPixel({ xAxisIndex: 0 }, months[phase.start]);
    const endBoundaryX = phase.end === months.length - 1
      ? endX
      : chart.convertToPixel({ xAxisIndex: 0 }, months[phase.end]);

    // 阶段背景矩形，宽度由阶段起止月份换算出来。
    graphics.push({
      type: "rect",
      shape: { x: startX, y: top - 76, width: endBoundaryX - startX, height: 50 },
      style: { fill: "#bec6d6", opacity: 0.92 },
      z: 1,
      ...silent,
    });
    // 阶段名称放在对应背景块中心。
    graphics.push({
      type: "text",
      position: [(startX + endBoundaryX) / 2, top - 51],
      style: {
        text: phase.name,
        fill: "#1d2138",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: chartFont,
        align: "center",
        verticalAlign: "middle",
      },
      z: 2,
      ...silent,
    });

    if (phase.start > 0) {
      // 阶段分割线：从阶段条顶部贯穿到 X 轴底部，对齐阶段起始月份。
      graphics.push({
        type: "line",
        shape: { x1: startX, y1: top - 76, x2: startX, y2: bottomY },
        style: { stroke: "#c8cfdd", lineWidth: 1.5 },
        z: 2,
        ...silent,
      });
    }
  });

  // Y 轴虚线：关闭 ECharts 默认轴线后，用 graphic 手动画，便于和箭头统一样式。
  graphics.push({
    type: "line",
    shape: { x1: left, y1: top, x2: left, y2: bottomY },
    style: { stroke: axisColor, lineWidth: 2, lineDash: [7, 5] },
    z: 5,
    ...silent,
  });
  // X 轴虚线：从 grid 左下角画到右下角，右端再接箭头。
  graphics.push({
    type: "line",
    shape: { x1: left, y1: bottomY, x2: endX, y2: bottomY },
    style: { stroke: axisColor, lineWidth: 2, lineDash: [7, 5] },
    z: 5,
    ...silent,
  });

  const arrowWidth = 7;
  const arrowLength = 14;
  // Y 轴顶部箭头：参考 BubbleChart.vue，用 graphic polygon 画三角形。
  // position [left, top] 是箭头底边中心点，也就是 Y 轴虚线顶部。
  // points 三个点分别是：底边左点、底边右点、向上的尖端点。
  graphics.push({
    type: "polygon",
    position: [left, top],
    shape: { points: [[-arrowWidth, 0], [arrowWidth, 0], [0, -arrowLength]] },
    style: { fill: axisColor },
    z: 6,
    ...silent,
  });
  // X 轴末端箭头：同样用 graphic polygon 画三角形。
  // position [endX, bottomY] 是箭头底边中心点，也就是 X 轴虚线右端。
  // points 三个点分别是：底边上点、底边下点、向右的尖端点。
  graphics.push({
    type: "polygon",
    position: [endX, bottomY],
    shape: { points: [[0, -arrowWidth], [0, arrowWidth], [arrowLength, 0]] },
    style: { fill: axisColor },
    z: 6,
    ...silent,
  });

  chart.setOption({ graphic: graphics }, { replaceMerge: ["graphic"] });
}

function syncChartLayout() {
  if (!chart) return;
  requestAnimationFrame(() => {
    if (!chart) return;
    chart.resize();
    updateGraphicElements();
  });
}

function handleResize() {
  if (!chart) return;
  chartWidth.value = chart.getWidth?.() ?? window.innerWidth;
  nextTick(() => syncChartLayout());
}

function onChartReady(chartInstance) {
  chart = chartInstance;
  chartWidth.value = chart.getWidth?.() ?? window.innerWidth;
  nextTick(() => syncChartLayout());
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chart = null;
});
</script>

<style scoped lang="less">
.lifecycle-trend-page {
  min-height: 100vh;
  padding: 24px;
  background: #edf1f8;
  box-sizing: border-box;
}

.trend-card {
  width: 100%;
  height: 560px;
  padding: 34px 38px 18px;
  border-radius: 14px;
  background: rgba(246, 248, 252, 0.9);
  box-sizing: border-box;
}

.trend-chart {
  width: 100% !important;
  height: 460px !important;
}

.trend-header {
  height: 42px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title-wrap,
.legend {
  display: flex;
  align-items: center;
}

.title-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border: 3px solid #24264f;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.title-line {
  width: 21px;
  height: 14px;
  border-left: 3px solid #24264f;
  border-bottom: 3px solid #24264f;
  transform: skewY(-28deg) translateY(-1px);
}

.title {
  margin-right: 24px;
  color: #16183d;
  font-size: 30px;
  font-weight: 700;
  line-height: 34px;
}

.summary {
  color: #111532;
  font-size: 20px;
  line-height: 34px;

  strong {
    color: #c2374c;
    font-size: 25px;
    padding: 0 4px;
  }
}

.legend {
  gap: 36px;
  padding-top: 4px;
  color: #1b2038;
  font-size: 21px;
  font-weight: 700;
}

.legend-item {
  position: relative;
  padding-left: 20px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: translateY(-50%);
    background: #dfe8e3;
  }

  &.flow::before {
    border: 3px solid #2d9d82;
  }

  &.cost::before {
    border: 3px solid #383b61;
  }
}

</style>
