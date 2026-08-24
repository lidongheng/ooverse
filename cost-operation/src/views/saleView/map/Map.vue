<template>
  <div class="center-col">
    <div class="chart-wrapper">
      <div ref="chartEl" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, toRefs, computed, watch } from "vue";
import * as echarts from "echarts";
import worldJson from "@/assets/geo/world.geo.json";
import { enrichSaleRegionWithCoords, indicators } from './useMap';
import { getChartScale } from '@/composables/autoLayout/chartScale';
import { homeData } from '../saleHome/useSaleHomeData';
import { useSaleFilterStore } from '../saleHome/useSaleFilter.js';
import { getSaleRegionLabelConfig } from '@/config/saleRegionCoords';

const filterStore = useSaleFilterStore();
const { filterValue, filterOptions } = toRefs(filterStore);

const regionData = computed(() => {
  const data = 
    homeData.value.regionalAvailableVolumeList
    ?.filter((v) => v.area !== '俄罗斯')
    .map(enrichSaleRegionWithCoords)
    .filter(Boolean) ?? [];
  const selectArea = filterValue.value.areaName?.length
    ? filterValue.value.areaName
    : filterOptions.value.regionNameList?.map((a) => a.value);
  return data.map((v) => {
    const isSelect = selectArea.includes(v.area);
    return {
      ...v,
      opacity: isSelect ? 1 : 0.6,
    };
  });
});

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
function computeLinePoints(ox, oy, labelCfg, s) {
  const BEND_ANGLE = labelCfg.bendAngle ?? 125;
  const TURN_RAD = ((180 - BEND_ANGLE) * Math.PI) / 180;
  const TAN_TURN = Math.tan(TURN_RAD);

  if (labelCfg.lineStyle === 'straight' || ox === 0 || oy === 0) {
    return [
      [0, 0],
      [ox, oy],
    ];
  }

  const absOx = Math.abs(ox);
  const absOy = Math.abs(oy);

  // elbowReverse: 第1段斜方向(NE/SE/SW/NW)，拐点125°，第2段正方向(N/S/E/W)
  if (labelCfg.lineStyle === 'elbowReverse') {
    const useEndVertical = absOy > absOx * TAN_TURN;
    let bendX;
    let bendY;
    if (labelCfg.lineLength !== null) {
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
        bendY = Math.round(((oy < 0 ? -1 : 1) * absOx) / TAN_TURN);
      } else {
        bendX = Math.round(((ox < 0 ? -1 : 1) * absOy) / TAN_TURN);
        bendY = oy;
      }
    }
    if (Math.abs(ox - bendX) < 2 && Math.abs(oy - bendY) < 2) {
      return [
        [0, 0],
        [ox, oy],
      ];
    }

    return [
      [0, 0],
      [bendX, bendY],
      [ox, oy],
    ];
  }

  // elbow (默认): 第1段正方向(N/S/E/W)，拐点125°，第2段斜方向(NE/SE/SW/NW)
  const useVertical = absOy > absOx * TAN_TURN;

  let bendX;
  let bendY;
  if (labelCfg.lineLength !== null) {
    const L = labelCfg.lineLength * s;
    if (useVertical) {
      bendX = 0;
      bendY = Math.round(oy < 0 ? -L : L);
    } else {
      bendX = Math.round(ox < 0 ? -L : L);
      bendY = 0;
    }
  } else {
    if (useVertical) {
      const L = absOy - absOx / TAN_TURN;
      bendX = 0;
      bendY = Math.round(oy < 0 ? -L : L);
    } else {
      const L = absOx - absOy / TAN_TURN;
      bendX = Math.round(ox < 0 ? -L : L);
      bendY = 0;
    }
  }

  if (Math.abs(bendX) < 2 && Math.abs(bendY) < 2) {
    return [
      [0, 0],
      [ox, oy],
    ];
  }

  return [
    [0, 0],
    [bendX, bendY],
    [ox, oy],
  ];
}

function eachIndicators({
  fontSize,
  values,
  startX,
  startY,
  s,
  rectW,
  opacity,
  hasAreaPermission,
}) {
  const datas = [];
  let itemHeight = 20 * s;
  indicators.forEach((v, index) => {
    const value = !homeData.value[v.permissionKey] || !hasAreaPermission ? '**' : v.format(values[v.key]);

    const textObj = {
      type: 'text',
      style: {
        text: `{label${v.label}}{unit(${v.unit})}`,
        x: startX,
        y: startY + index * itemHeight,
        textVerticalAlign: 'middle',
        rich: {
          label: { fontSize, fill: '#575D6C', fontWeight: 500, opacity },
          unit: { fontSize, fill: '#575D6C', opacity },
        },
      },
    };

    const valueObj = {
      type: 'text',
      style: {
        text: value,
        x: rectW - startX,
        y: startY + index * itemHeight,
        fontSize,
        textVerticalAlign: 'middle',
        fontWeight: 700,
        textAlign: 'right',
        color: '#252B3A',
        opacity,
      },
    };

    datas.push(textObj, valueObj);
  });
  return datas;
}

function getCardGroupPosition({ labelCfg, px, ox, py, oy, rectW, rectH }) {
  const halfW = rectW / 2;
  const halfH = rectH / 2;

  switch (labelCfg.anchor) {
    case 'bottom':
      return [px + ox - halfW, py + oy - halfH];
    case 'top':
      return [px + ox - halfW, py + oy + halfH];
    case 'left':
      return [px + ox, py + oy];
    case 'right':
      return [px + ox - rectW, py + oy];
    default:
      return [px + ox - halfW, py + oy - halfH]; // 默认处理，可调整
  }
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
    const hasAreaPermission = homeData.value.areaPermission.includes(item.area); // 大区权限
    // 同坐标只保留首个标签，其余跳过（散点仍全部显示）
    const coordKey = `${item.lng},${item.lat}`;
    if (labeledCoords.has(coordKey)) return;
    labeledCoords.add(coordKey);

    const coord = [shiftLng(item.lng), item.lat];
    let pixelPos;
    try {
      pixelPos = chart.convertToPixel('geo', coord);
    } catch {
      return;
    }
    if (!pixelPos || isNaN(pixelPos[0])) return;

    const [px, py] = pixelPos;
    const labelCfg = getSaleRegionLabelConfig(item.name);
    const { x: ox, y: oy } = getEffectiveOffset(item.name, s);
    // 标签文本与宽度计算
    const titleW = Math.ceil(ctx.measureText(item.name).width);
    const regionName = item.name;
    const linePoints = computeLinePoints(ox, oy, labelCfg, s);
    // 引导线（起点不变！）
    elements.push({
      type: 'polyline',
      id: `line-${item.name}`,
      position: [px, py],
      shape: { points: linePoints },
      style: { stroke: '#b4b8ce', lineWidth: 1, lineDash: [4, 2], opacity: item.opacity },
      z: 100,
      silent: true,
    });
    // 标签（位置不变）
    elements.push({
      type: 'group',
      id: `label-${regionName}`,
      position: getCardGroupPosition({ labelCfg, px, ox, py, oy, rectW, rectH }),
      draggable: true,
      cursor: 'move',
      z: 200,
      ondragend() {
        const newOx = this.position[0] - px;
        const newOy = this.position[1] - py;
        const config = { x: newOx / s, y: newOy / s };
        const halfW = rectW / s / 2;
        const halfH = rectH / s / 2;
        switch (labelCfg.anchor) {
          case 'bottom':
            config.y = config.y + halfH;
            config.x = config.x + halfW;
            break;
          case 'top':
            config.y = config.y - halfH;
            config.x = config.x + halfW;
            break;
          case 'right':
            config.x = config.x + rectW / s;
            break;
          default:
            break;
        }
        dragOverrides.value.set(regionName, config);
        updateMap();
      },
      children: [
      // 卡片背景色块
        {
          type: 'rect',
          shape: {
            x: 0,
            y: -rectH / 2,
            width: rectW,
            height: rectH,
            r: borderR,
          },
          style: {
            fill: '#fff',
            shadowColor: 'rgba(51, 51, 107, 0.16)',
            shadowBlur: 4,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            opacity: item.opacity,
          },
        },
        // title 背景
        {
          type: 'rect',
          shape: {
            x: padX,
            y: -rectH / 2 + padY,
            width: titleW + 20 * s,
            height: 25 * s,
            r: 40 * s,
          },
          style: {
            fill: 'rgba(98, 98, 168, 1)',
            opacity: item.opacity,
          },
        },
        // 大区名称
        {
          type: 'text',
          style: {
            text: item.name,
            x: padX + 10 * s,
            y: -rectH / 2 + padY + 10 * s,
            textVerticalAlign: 'middle',
            fontWeight: 700,
            fill: '#fff',
            fontSize: item.fontSize,
            opacity: item.opacity,
          },
        },
        ...eachIndicators({
          rectW,
          fontSize,
          values: item,
          startY: -rectH / 2 + padY + 40 * s,
          startX: padX,
          s,
          opacity: item.opacity,
          hasAreaPermission,
        }),
      ]
    });
  });

  return elements;
}

function buildOption() {
  const s = getChartScale(chartEl.value);

  const VM_FONT_SIZE = Math.round(10 * s);

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

  const scatterData = regionData.value.map((item) => {
    const rateVal = item.rate ?? 0;
    const isLoss = rateVal < 0;
    const color = isLoss ? RED_GRADIENT : GREEN_GRADIENT;
    return {
      name: item.name,
      value: [shiftLng(item.lng), item.lat, rateVal],
      itemStyle: {
        color: GREEN_GRADIENT,
        ...SHADOW,
        opacity: item.opacity,
      },
    };
  });

  return {
    backgroundColor: "#e7ebf8",

    geo: {
      map: "world",
      roam: false,
      zoom: 0.7,
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
        labelLayout: { hideOverlap: true },
        labelLine: {
          show: true,
          showAbove: false,
          lineStyle: {
            color: '#b4b8ce',
            width: 1,
            type: [4, 2]
          }
        }
      },
    ],

    // 图形覆盖层（含 0 刻度线）
    graphic: (() => {
      // 用 Canvas 精确测量右端标签宽度
      const _ctx = document.createElement('canvas').getContext('2d');
      _ctx.font = `${VM_FONT_SIZE}px sans-serif`;

      return [...buildMarkersGraphic(s)];
    })(),
  };
}

function updateMap() {
  if (!chart) return;
  chart.setOption(buildOption(), { replaceMerge: ["series", "graphic"] });
}

watch([regionData], (value) => {
  updateMap();
});

onMounted(async () => {
  if (!chartEl.value) return;
  isUnmounted = false;
  const chartInstance = echarts.init(chartEl.value, null, {
    renderer: 'svg',
  });
  chart = chartInstance;

  // 异步请求期间组件可能已被路由卸载，不能继续注册已销毁图表的事件。
  if (isUnmounted || chart !== chartInstance) {
    return;
  }

  updateMap();

  // 地图缩放/平移时重新计算引导线像素位置
  chartInstance.on('georoam', () => updateMap());

  resizeObserver = new ResizeObserver(() => {
    if (chartInstance) {
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
// ---- 面板通用 ----
.panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// ---- 中间区域 ----
.center-col {
  padding-top: 42px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
  aspect-ratio: 1024 / 690;
  max-height: 100%;
  position: relative;
  .legend {
    font-size: 13px;
    position: absolute;
    /* 组合 4890 */
    right: 10px;
    top: 0px;
    padding: 8px 12px;
    justify-content: center;
    gap: 8px;
    background-color: #fff;
    .text {
      margin-left: 6px;
    }
  }
}

.chart {
  position: absolute;
  inset: 0;
}
</style>
