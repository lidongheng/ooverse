<template>
  <div class="map-panel">
    <div class="chart-wrapper">
      <div ref="chartEl" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import * as echarts from "echarts";
import worldJson from "@/assets/geo/world.geo.json";
import { getRegionLabelConfig } from "@/config/regionLabel";
import { getChartScale } from "@/utils/chartScale";
import { useHomeOverview } from "@/views/useHomeOverview";

// ================================================================
// 中国标准世界地图坐标偏移
// ================================================================
const CUT_LONGITUDE = -30;

function shiftWorldGeoJSON(geojson) {
  const shifted = JSON.parse(JSON.stringify(geojson));
  shifted.features.forEach((feature) => {
    const { type, coordinates } = feature.geometry;
    if (type === "Polygon") {
      feature.geometry.coordinates = coordinates.map((ring) => processRing(ring));
    } else if (type === "MultiPolygon") {
      feature.geometry.coordinates = coordinates.map((polygon) =>
        polygon.map((ring) => processRing(ring))
      );
    }
  });
  return shifted;
}

function processRing(ring) {
  let hasBelow = false;
  let hasAbove = false;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const coord of ring) {
    const lng = coord[0];
    if (lng < CUT_LONGITUDE) hasBelow = true;
    if (lng >= CUT_LONGITUDE) hasAbove = true;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  const crossesCutLine = hasBelow && hasAbove && maxLng - minLng < 180;
  if (crossesCutLine) {
    return ring.map(([lng, lat, ...rest]) => [lng + 360, lat, ...rest]);
  }
  return ring.map(([lng, lat, ...rest]) => [
    lng < CUT_LONGITUDE ? lng + 360 : lng,
    lat,
    ...rest,
  ]);
}

echarts.registerMap("world", shiftWorldGeoJSON(worldJson));

/** 散点坐标也需同样偏移 */
function shiftLng(lng) {
  return lng < CUT_LONGITUDE ? lng + 360 : lng;
}

const {
  regionData,
  profitCount,
  lossCount,
  rates,
  fetchRegionStats,
  selectedRegion,
  formatDisplayValue,
  formatRate,
  getMarkerColor,
} = useHomeOverview();

// regionData 变化时（含 selectedMonth 触发的自动刷新）重新渲染地图
watch(regionData, () => updateMap(), { deep: true });

/** visualMap 当前选中范围 [min, max]，用于同步过滤散点标签 */
const visualMapRange = ref(null);

// ================================================================
// ECharts
// ================================================================
const chartEl = ref(null);
let chart = null;
let resizeObserver = null;
let isUnmounted = false;

// 拖拽偏移覆盖表：region name → { x, y }（未缩放基准值）
const dragOverrides = ref(new Map());

function getEffectiveOffset(name, s) {
  const override = dragOverrides.value.get(name);
  if (override) {
    return { x: Math.round(override.x * s), y: Math.round(override.y * s) };
  }
  const cfg = getRegionLabelConfig(name);
  return { x: Math.round(cfg.offset.x * s), y: Math.round(cfg.offset.y * s) };
}

// ---- 引导线折线计算 ----
const BEND_ANGLE = 125;
const TURN_RAD = (180 - BEND_ANGLE) * Math.PI / 180;
const TAN_TURN = Math.tan(TURN_RAD);

function computeLinePoints(ox, oy, labelCfg, s) {
  if (labelCfg.lineStyle === 'straight' || ox === 0 || oy === 0) {
    return [[0, 0], [ox, oy]];
  }
  const absOx = Math.abs(ox);
  const absOy = Math.abs(oy);

  // elbowReverse: 第 1 段斜方向(NE/SE/SW/NW)，拐点 125°，第 2 段正方向(N/S/E/W)
  if (labelCfg.lineStyle === 'elbowReverse') {
    const useEndVertical = absOy > absOx * TAN_TURN;
    let bendX, bendY;
    if (labelCfg.lineLength != null) {
      const L = labelCfg.lineLength * s;
      if (useEndVertical) {
        bendX = ox;
        bendY = Math.round(oy < 0 ? oy + L : oy - L);
      } else {
        bendX = Math.round(ox < 0 ? ox + L : ox - L);
        bendY = oy;
      }
    } else {
      if (useEndVertical) {
        bendX = ox;
        bendY = Math.round((oy < 0 ? -1 : 1) * absOx / TAN_TURN);
      } else {
        bendX = Math.round((ox < 0 ? -1 : 1) * absOy / TAN_TURN);
        bendY = oy;
      }
    }
    if (Math.abs(ox - bendX) < 2 && Math.abs(oy - bendY) < 2) return [[0, 0], [ox, oy]];
    return [[0, 0], [bendX, bendY], [ox, oy]];
  }

  // elbow (默认): 第 1 段正方向(N/S/E/W)，拐点 125°，第 2 段斜方向(NE/SE/SW/NW)
  const useVertical = absOy > absOx * TAN_TURN;
  let bendX, bendY;
  if (labelCfg.lineLength != null) {
    const L = labelCfg.lineLength * s;
    if (useVertical) { bendX = 0; bendY = Math.round(oy < 0 ? -L : L); }
    else { bendX = Math.round(ox < 0 ? -L : L); bendY = 0; }
  } else {
    if (useVertical) {
      const L = absOy - absOx / TAN_TURN;
      bendX = 0; bendY = Math.round(oy < 0 ? -L : L);
    } else {
      const L = absOx - absOy / TAN_TURN;
      bendX = Math.round(ox < 0 ? -L : L); bendY = 0;
    }
  }
  if (Math.abs(bendX) < 2 && Math.abs(bendY) < 2) return [[0, 0], [ox, oy]];
  return [[0, 0], [bendX, bendY], [ox, oy]];
}

/**
 * 构建引导线 + 可拖拽标签的 graphic 元素
 * - 标签用 graphic.group（rect + richText），支持 draggable
 * - 拖拽时实时更新引导线，松手后写入 dragOverrides
 */
function buildMarkersGraphic(s, rangeMin, rangeMax) {
  if (!chart) return [];
  const elements = [];
  const fontSize = Math.round(12 * s);
  const padX = Math.round(8 * s);
  const padY = Math.round(4 * s);
  const borderR = Math.round(20 * s);
  const _ctx = document.createElement('canvas').getContext('2d');
  _ctx.font = `500 ${fontSize}px sans-serif`;

  // 坐标去重：同一经纬度只展示第一个 Region 的标签，避免同坐标标签重叠
  const labeledCoords = new Set();

  regionData.value.forEach((item) => {
    const rateVal = item.rate ?? 0;
    const inRange = item.rate == null || (rateVal >= rangeMin && rateVal <= rangeMax);
    if (!inRange) return;

    // 同坐标只保留首个标签，其余跳过（散点仍全部显示）
    const coordKey = `${item.lng},${item.lat}`;
    if (labeledCoords.has(coordKey)) return;
    labeledCoords.add(coordKey);

    const coord = [shiftLng(item.lng), item.lat];
    let pixelPos;
    try { pixelPos = chart.convertToPixel('geo', coord); }
    catch { return; }
    if (!pixelPos || isNaN(pixelPos[0])) return;

    const [px, py] = pixelPos;
    const labelCfg = getRegionLabelConfig(item.name);
    const { x: ox, y: oy } = getEffectiveOffset(item.name, s);

    // 标签文本与宽度计算
    const rateStr = formatRate(item.rate);
    const plainText = `${item.name}  销毛率：${rateStr}`;
    const textW = Math.ceil(_ctx.measureText(plainText).width);
    const rectW = textW + padX * 2;
    const rectH = fontSize + padY * 2;
    const regionName = item.name;

    const linePoints = computeLinePoints(ox, oy, labelCfg, s);
    if (['拉美-圣地亚哥', '拉美-布宜诺斯艾利斯一', '拉美-圣保罗一', '西南-贵阳一'].includes(item.name)) {
      const lastPoint = linePoints[linePoints.length - 1];
      linePoints[linePoints.length - 1] = [
        lastPoint[0] + rectW,
        lastPoint[1]
      ];
    }

    elements.push({
      type: 'polyline',
      id: `line-${item.name}`,
      position: [px, py],
      shape: { points: linePoints },
      style: { stroke: '#b4b8ce', lineWidth: 1, lineDash: [4, 2] },
      z: 100,
      silent: true,
    });

    elements.push({
      type: 'group',
      id: `label-${regionName}`,
      position: [px + ox, py + oy],
      draggable: true,
      cursor: 'move',
      z: 200,
      ondrag() {
        const newOx = this.position[0] - px;
        const newOy = this.position[1] - py;
        const points = computeLinePoints(newOx, newOy, labelCfg, s);
      if (['拉美-圣地亚哥', '拉美-布宜诺斯艾利斯一', '拉美-圣保罗一', '西南-贵阳一'].includes(item.name)) {
        const last = points[points.length - 1];
        points[points.length - 1] = [last[0] + rectW, last[1]];
      }
        chart.setOption({
          graphic: [{ id: `line-${regionName}`, shape: { points } }],
        });
      },
      ondragend() {
        const newOx = this.position[0] - px;
        const newOy = this.position[1] - py;
        dragOverrides.value.set(regionName, { x: newOx / s, y: newOy / s });
        updateMap();
      },
      children: [
        {
          type: 'rect',
          shape: { x: 0, y: -rectH / 2, width: rectW, height: rectH, r: borderR },
          style: {
            fill: 'rgba(242,246,255,1)',
            shadowColor: 'rgba(33,48,92,0.15)',
            shadowBlur: 4,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
          },
        },
        {
          type: 'text',
          style: {
            text: `{name|${item.name}}  {gray|销毛率：}{number|${rateStr}}`,
            x: padX,
            y: 0,
            textVerticalAlign: 'middle',
            rich: {
              name: { fontSize, fill: '#353575', fontWeight: 500 },
              gray: { fontSize, fill: '#7171a8' },
              number: { fontSize, fill: '#353575', fontWeight: 500 },
            },
          },
        },
      ],
    });
  });

  return elements;
}

function buildOption() {
  const s = getChartScale(chartEl.value);

  const validRates = rates.value.filter((r) => r != null);

  const GREEN_GRADIENT = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "rgba(133,233,202,1)" },
    { offset: 0.5, color: "rgba(43,197,149,1)" },
    { offset: 1, color: "rgba(21,155,113,1)" },
  ]);
  const RED_GRADIENT = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "rgba(255,175,172,1)" },
    { offset: 0.5, color: "rgba(228,69,63,1)" },
    { offset: 1, color: "rgba(244,140,136,1)" },
  ]);
  const SHADOW = {
    shadowBlur: 2 * s,
    shadowColor: "rgba(0,0,0,0.15)",
    shadowOffsetX: 0,
    shadowOffsetY: 2 * s,
  };

  // 可拖拽范围条的取值区间（排除 null）— 需在 scatterData 之前，供 inRange 判定
  const gaugeMin = validRates.length ? Math.floor(Math.min(...validRates) / 5) * 5 : -5;
  const gaugeMax = validRates.length ? Math.ceil(Math.max(...validRates) / 5) * 5 : 20;
  const [rangeMin, rangeMax] = visualMapRange.value ?? [gaugeMin, gaugeMax];

  const scatterData = regionData.value.map((item) => {
    const rateVal = item.rate ?? 0;
    const isLoss = item.rate != null && item.rate < 0;
    let color;
    if (item.rate == null) {
      color = "#999";
    } else if (isLoss) {
      color = RED_GRADIENT;
    } else {
      color = GREEN_GRADIENT;
    }
    return {
      name: item.name,
      value: [shiftLng(item.lng), item.lat, rateVal],
      itemStyle: { color, ...SHADOW },
    };
  });

  return {
    backgroundColor: "#e7ebf8",

    tooltip: {
      trigger: "item",
      appendToBody: true,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e8ecf1",
      textStyle: { color: "#333", fontSize: 13 },
      formatter: (p) => {
        if (p.seriesType === "scatter" || p.seriesType === "effectScatter") {
          const item = regionData.value.find((r) => r.name === p.name);
          const rate = item?.rate;
          const rateStr = formatRate(rate);
          let c;
          if (rate == null) c = "#999";
          else if (rate < 0) c = "#e4453f";
          else c = "#2bc595";
          return `<strong>${p.name}</strong><br/>销毛率: <span style="color:${c};font-weight:bold">${rateStr}</span>`;
        }
      },
    },

    // 右上角可拖拽范围过滤条（仿截图样式）
    visualMap: [
      {
        type: "continuous",
        calculable: true,
        dimension: 2,
        seriesIndex: 0,
        min: gaugeMin,
        max: gaugeMax,
        range: [rangeMin, rangeMax],
        right: 10 * s,
        top: 4 * s,
        orient: "horizontal",
        itemWidth: 5 * s,
        itemHeight: 140 * s,
        align: 'bottom',
        text: [`${gaugeMax}%`, `${gaugeMin}%`],
        textGap: 10 * s,
        textStyle: { fontSize: Math.round(10 * s), color: "#999" },
        inRange: {
          color: ["#e4453f", "#2bc595"],
        },
        outOfRange: {
          color: "rgba(200,200,200,0.3)",
        },
        handleIcon:
          "path://M0,0 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0",
        handleSize: 14 * s,
        handleStyle: {
          borderColor: "transparent",
          borderWidth: 0,
          shadowBlur: 4,
          shadowColor: "rgba(0,0,0,0.2)",
          shadowOffsetY: 1,
        },
        indicatorIcon: "none",
        indicatorSize: 0,
        formatter: (value) => `${value.toFixed(1)}%`,
        backgroundColor: "transparent",
        padding: [32 * s, 12 * s, 16 * s, 12 * s],
        borderRadius: 0,
        borderColor: "transparent",
        borderWidth: 0,
      },
    ],

    geo: {
      map: "world",
      roam: true,
      top: 115,
      bottom: 10,
      left: 10,
      right: 10,
      tooltip: { show: false },
      label: { show: false },
      itemStyle: {
        areaColor: "#fefeff",
        borderColor: "#e3e7f4",
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
      },
    },

    // 散点标记层
    series: [
      {
        type: "scatter",
        coordinateSystem: "geo",
        data: scatterData,
        symbol: "circle",
        symbolSize: Math.round(12 * s),
        label: { show: false },
        z: 150,
      },
    ],

    // 图形覆盖层（含 0 刻度线）
    graphic: (() => {
      // ========== 0 刻度线精确定位公式 ==========
      // 所有数值均从 visualMap 配置推导，min/max 变化时自动对齐
      //
      // ECharts 内部实现：水平 visualMap 的条是竖直绘制后旋转 90°，
      // 两端文字在条的左右两侧（不受 align:'bottom' 影响），
      // positionGroup 按 bounding-rect（含 padding 背景）定位整个组件。
      //
      // 水平方向：barRight = right + paddingRight + textGap + rightLabelWidth
      // 垂直方向：tickY = top + paddingTop + handleSize + 1
      // ---------------------------------------------------------
      const VM_RIGHT      = 10 * s;
      const VM_TOP         = 4 * s;
      const VM_PADDING_T   = 32 * s;
      const VM_PADDING_R   = 12 * s;
      const VM_TEXT_GAP     = 10 * s;
      const VM_FONT_SIZE   = Math.round(10 * s);
      const VM_BAR_LENGTH  = 140 * s;
      const VM_HANDLE_SIZE = 14 * s;

      const VM_PADDING_B   = 16 * s;
      const VM_PADDING_L   = 12 * s;

      // 用 Canvas 精确测量两端标签宽度（和 ECharts 内部一致）
      const _ctx = document.createElement('canvas').getContext('2d');
      _ctx.font = `${VM_FONT_SIZE}px sans-serif`;
      const rightLabelW = Math.ceil(_ctx.measureText(`${gaugeMax}%`).width);
      const leftLabelW = Math.ceil(_ctx.measureText(`${gaugeMin}%`).width);

      // visualMap 背景总宽高（padding + 两侧文字 + 条长度 + textGap）
      const vmTotalW = VM_PADDING_L + leftLabelW + VM_TEXT_GAP + VM_BAR_LENGTH + VM_TEXT_GAP + rightLabelW + VM_PADDING_R;
      const vmTotalH = VM_PADDING_T + VM_HANDLE_SIZE + 6 * s + VM_PADDING_B;

      // 条右端距图表右边缘（px）
      const barRightFromEdge = VM_RIGHT + VM_PADDING_R + VM_TEXT_GAP + rightLabelW;
      // 刻度线垂直起点（条底 + 手柄半径 + 1px 间距）
      const tickTopY = VM_TOP + VM_PADDING_T + VM_HANDLE_SIZE + 1;

      // 0 值在条上的水平位置
      const zeroRatio = (0 - gaugeMin) / (gaugeMax - gaugeMin);
      const zeroRight = barRightFromEdge + VM_BAR_LENGTH * (1 - zeroRatio);
      const showZeroTick = gaugeMin < 0 && gaugeMax > 0;

      return [
      // visualMap 阴影背景（z 低于 visualMap，不遮挡拖动条）
      {
        type: "rect",
        right: VM_RIGHT,
        top: VM_TOP,
        z: 0,
        shape: { width: vmTotalW, height: vmTotalH, r: 8 * s },
        style: {
          fill: "rgba(255,255,255,0.8)",
          shadowBlur: 10,
          shadowColor: "rgba(0,0,0,0.08)",
          shadowOffsetY: 2,
        },
      },
      {
        type: "text",
        right: 140 * s,
        top: 9 * s,
        z: 100,
        style: {
          text: "联赛/俱乐部销毛率",
          fontSize: Math.round(14 * s),
          fontWeight: "normal",
          fill: "#353575",
        },
      },

      ...(showZeroTick
        ? [
            {
              type: "group",
              right: zeroRight - 0.5,
              top: tickTopY,
              children: [
                {
                  type: "rect",
                  z: 100,
                  shape: { x: 0, y: 0, width: 1, height: 7 * s },
                  style: { fill: "#9e9ed0" },
                },
                {
                  type: "text",
                  left: -2.5,
                  top: 9 * s,
                  z: 100,
                  style: {
                    text: "0",
                    fontSize: Math.round(9 * s),
                    fill: "#9e9ed0",
                    textAlign: "center",
                  },
                },
              ],
            },
          ]
        : []),
      {
        type: "group",
        z: 100,
        left: 10 * s,
        top: 4 * s,
        children: [
          {
            type: "rect",
            shape: { x: -18 * s, y: -6 * s, width: 230 * s, height: 56 * s, r: 8 * s },
            style: {
              fill: "rgba(255,255,255,0.8)",
              shadowBlur: 10,
              shadowColor: "rgba(0,0,0,0.08)",
              shadowOffsetY: 2,
            },
          },

          { type: "text", left: 0, top: 0, style: { text: formatDisplayValue(regionData.value.length), fontSize: Math.round(28 * s), fontWeight: "bold", fill: "#333" } },
          { type: "text", left: 38 * s, top: 10 * s, style: { text: "个", fontSize: Math.round(13 * s), fill: "#999" } },
          { type: "text", left: 2 * s, top: 36 * s, style: { text: "联赛/俱乐部", fontSize: Math.round(12 * s), fill: "#999" } },

          {
            type: "rect",
            shape: { x: 65 * s, y: 2 * s, width: 1, height: 36 * s, r: 0 },
            style: {
              fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(0,0,0,0)" },
                { offset: 0.5, color: "rgba(0,0,0,0.1)" },
                { offset: 1, color: "rgba(0,0,0,0)" },
              ]),
            },
          },

          { type: "text", left: 80 * s, top: 0, style: { text: formatDisplayValue(profitCount.value), fontSize: Math.round(28 * s), fontWeight: "bold", fill: "#52c41a" } },
          { type: "text", left: 118 * s, top: 10 * s, style: { text: "个", fontSize: Math.round(13 * s), fill: "#52c41a" } },
          { type: "text", left: 87 * s, top: 36 * s, style: { text: "盈利", fontSize: Math.round(12 * s), fill: "#999" } },

          {
            type: "rect",
            shape: { x: 143 * s, y: 2 * s, width: 1, height: 36 * s, r: 0 },
            style: {
              fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(0,0,0,0)" },
                { offset: 0.5, color: "rgba(0,0,0,0.1)" },
                { offset: 1, color: "rgba(0,0,0,0)" },
              ]),
            },
          },

          { type: "text", left: 158 * s, top: 0, style: { text: formatDisplayValue(lossCount.value), fontSize: Math.round(28 * s), fontWeight: "bold", fill: "#f5222d" } },
          { type: "text", left: 174 * s, top: 10 * s, style: { text: "个", fontSize: Math.round(13 * s), fill: "#f5222d" } },
          { type: "text", left: 160 * s, top: 36 * s, style: { text: "亏损", fontSize: Math.round(12 * s), fill: "#999" } },
        ],
      },
      ...buildMarkersGraphic(s, rangeMin, rangeMax),
    ];
    })(),
  };
}

function updateMap() {
  if (!chart) return;
  chart.setOption(buildOption(), { replaceMerge: ["series", "graphic"] });
}

onMounted(async () => {
  if (!chartEl.value) return;
  isUnmounted = false;
  const chartInstance = echarts.init(chartEl.value);
  chart = chartInstance;

  // useRegionData 会监听全局日期；这里仅处理地图先挂载、数据还未回来时的首次补拉。
  if (!regionData.value.length) {
    await fetchRegionStats();
  }

  // 异步请求期间组件可能已被路由卸载，不能继续注册已销毁图表的事件。
  if (isUnmounted || chart !== chartInstance) {
    return;
  }

  updateMap();
  // 首次 setOption 后 geo 已初始化，convertToPixel 可用，再渲染一次以添加折线引导线
  updateMap();

  // 地图缩放/平移时重新计算引导线像素位置
  chartInstance.on('georoam', updateMap);

  // visualMap 拖动时同步过滤散点标签
  chartInstance.on('dataRangeSelected', (params) => {
    const range =
      params?.batch?.[0]?.selected ??
      chartInstance.getOption()?.visualMap?.[0]?.range;
    if (Array.isArray(range) && range.length === 2) {
      visualMapRange.value = [range[0], range[1]];
      updateMap();
    }
  });

  // 点击散点 → 右侧面板显示详情
  chartInstance.on('click', 'series.scatter', (params) => {
    const item = regionData.value.find((r) => r.name === params.name);
    if (item) selectedRegion.value = item;
  });

  resizeObserver = new ResizeObserver(() => {
    if (chart === chartInstance) {
      chartInstance.resize();
      updateMap();
    }
  });
  resizeObserver.observe(chartEl.value);
});

onBeforeUnmount(() => {
  isUnmounted = true;

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  const chartInstance = chart;
  chart = null;

  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style lang="less" scoped>
.map-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  background: #e7ebf8;
  border-radius: 8px;
  overflow: hidden;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart {
  position: absolute;
  inset: 0;
}
</style>
