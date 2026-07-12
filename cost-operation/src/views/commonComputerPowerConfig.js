/**
 * 通用算力散点图 - 前端气泡配置
 * color、symbolSize 均由此处配置，接口不返回
 */

/** 盈利/亏损颜色 */
export const PROFIT_COLOR = "#1bcc8e";
export const LOSS_COLOR = "#f98181";

/** 服务器规模固定档位（颜色 + 气泡大小）*/
export const SIZE_TIERS = [
  { min: 0, max: 100, label: "0-100", color: "#e067ff", symbolSizeMin: 5, symbolSizeMax: 9 },
  { min: 100, max: 500, label: "100-500", color: "#2df2ff", symbolSizeMin: 13, symbolSizeMax: 19 },
  { min: 500, max: 1000, label: "500-1000", color: "#88ffae", symbolSizeMin: 21, symbolSizeMax: 27 },
  { min: 1000, max: Infinity, label: ">1000", color: "#7a7ae9", symbolSizeMin: 29, symbolSizeMax: 35 },
];

export const EVS_SIZE_TIERS = [
  { min: 0, max: 2000, label: "0-2000", color: "#e067ff", symbolSizeMin: 3, symbolSizeMax: 9 },
  { min: 2000, max: 10000, label: "2000-10000", color: "#2df2ff", symbolSizeMin: 13, symbolSizeMax: 19 },
  { min: 10000, max: 20000, label: "10000-20000", color: "#88ffae", symbolSizeMin: 21, symbolSizeMax: 27 },
  { min: 20000, max: Infinity, label: ">20000", color: "#7a7ae9", symbolSizeMin: 29, symbolSizeMax: 35 },
];

/** 智算卡数固定档位 */
export const AI_SIZE_TIERS = [
  { min: 0, max: 500, label: "0-500", color: "#51c7c7", symbolSizeMin: 5, symbolSizeMax: 9 },
  { min: 500, max: 5000, label: "500-5,000", color: "#6771b8", symbolSizeMin: 13, symbolSizeMax: 19 },
  { min: 5000, max: 10000, label: "5,000-10,000", color: "#2bc595", symbolSizeMin: 21, symbolSizeMax: 27 },
  { min: 10000, max: Infinity, label: ">10,000", color: "#a061d6", symbolSizeMin: 29, symbolSizeMax: 35 },
];

/** 超节点卡数固定档位 */
export const SUPER_NODE_SIZE_TIERS = [
  { min: 0, max: 100, label: "0-100", color: "#51c7c7", symbolSizeMin: 5, symbolSizeMax: 9 },
  { min: 100, max: 200, label: "100-200", color: "#6771b8", symbolSizeMin: 13, symbolSizeMax: 19 },
  { min: 200, max: 300, label: "200-300", color: "#2bc595", symbolSizeMin: 21, symbolSizeMax: 27 },
  { min: 300, max: Infinity, label: ">300", color: "#a061d6", symbolSizeMin: 29, symbolSizeMax: 35 },
];

/** 通用：根据数值在指定档位数组中查找所属档位 */
export function getTierByNum(num, tiers = SIZE_TIERS) {
  const n = num ?? 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (n > tiers[i].min) return tiers[i];
  }
  return tiers[0];
}

export function getTierByServerNum(serverNum) {
  return getTierByNum(serverNum, SIZE_TIERS);
}

/**
 * 按销毛率返回颜色
 * @param {number} y 销毛率 (%)
 * @returns {string} hex 颜色
 */
export function getColorByProfit(y) {
  return y >= 0 ? PROFIT_COLOR : LOSS_COLOR;
}

// ── 亮灯规则 ──

import lightRedUrl from "@/assets/icons/light-red.svg";
import lightYellowUrl from "@/assets/icons/light-yellow.svg";
import lightGreenUrl from "@/assets/icons/light-green.svg";

/** 亮灯 SVG 资源映射 */
export const LIGHT_SVGS = {
  red: lightRedUrl,
  yellow: lightYellowUrl,
  green: lightGreenUrl,
};

/**
 * 根据指标标签和数值返回亮灯类型
 * rules：key 为 tooltip 指标名，value 为阈值数组（依次判断 value 是否小于 max），一般由接口数据经 store 传入
 * @param {string} label 指标标签
 * @param {number} value 显示值（已转百分比）
 * @param {Record<string, Array<{ max: number, light: string }>>} [rules={}]
 * @returns {'red'|'yellow'|'green'|null}
 */
export function getTrafficLight(label, value, rules = {}) {
  const thresholds = rules[label];
  if (!thresholds) return null;
  for (const t of thresholds) {
    if (value < t.max) return t.light;
  }
  return thresholds[thresholds.length - 1].light;
}

/**
 * 生成亮灯 <img> HTML（引用 SVG 文件）
 * @param {'red'|'yellow'|'green'} light 灯色
 * @param {number} size 直径 px
 */
export function trafficLightHtml(light, size = 10) {
  const url = LIGHT_SVGS[light];
  if (!url) return "";
  return `<img src="${url}" width="${size}" height="${size}" style="vertical-align:middle;margin-right:4px;flex-shrink:0;" />`
}

/**
 * 在档位内按 serverNum 线性插值计算 symbolSize
 * serverNum 在 [tier.min, tier.max] 范围内映射到 [tier.symbolSizeMin, tier.symbolSizeMax]
 */
function calcSymbolSize(serverNum, tier) {
  const n = serverNum ?? 0;
  const range = tier.max === Infinity ? tier.min * 2 || 1 : tier.max - tier.min;
  const clamped = Math.min(Math.max(n - tier.min, 0), range);
  const ratio = range > 0 ? clamped / range : 0;
  return tier.symbolSizeMin + ratio * (tier.symbolSizeMax - tier.symbolSizeMin);
}

/**
 * 应用前端配置，为图表数据项补充 color、symbolSize
 * @param {{ name: string, x: number, y: number, serverNum: number }} item 接口转换后的基础项
 * @param {typeof SIZE_TIERS} [tiers]
 * @param {string} [sizeValueField]
 */
export function applyBubbleConfig(item, tiers = SIZE_TIERS, sizeValueField = "serverNum") {
  const sizeValue = Number(item[sizeValueField] ?? item.serverNum ?? 0) || 0;
  const tier = getTierByNum(sizeValue, tiers);

  return {
    ...item,
    sizeValue,
    color: tier.color,
    symbolSize: calcSymbolSize(sizeValue, tier),
  };
}

/**
 * 加权平均值核心计算
 * @param {Array<{val:number, num:number}>} pairs val-num 对数组
 * @returns {number} 加权平均值，无有效数据时返回 0
 */
function weightedAvg(pairs) {
  let sumWeighted = 0;
  let sumNum = 0;
  for (const { val, num } of pairs) {
    if (val == null) continue;
    sumWeighted += val * num;
    sumNum += num;
  }
  return sumNum > 0 ? sumWeighted / sumNum : 0;
}

/**
 * 前端根据图表数据 + 勾选档位 + dataFilter 计算加权平均值
 * 适用于后端不提供 avgRangeList 的场景（智算、主指标下钻等）
 * @param {Array} dataList       图表数据数组（已含 serverNum 等）
 * @param {string} xField        要计算平均的字段名（如 "x"、"_allocationRate"）
 * @param {boolean[]} visibleTiers 各档位是否选中，下标对应 sizeTiers
 * @param {Array} sizeTiers       档位配置数组
 * @param {Function|null} dataFilter  业务过滤函数，计算前先过滤无效数据
 * @returns {number} 加权平均值（与 xField 同单位，已是百分比则返回百分比）
 */
export function computeWeightedAvgFromData(
  dataList,
  xField,
  visibleTiers,
  sizeTiers = SIZE_TIERS,
  dataFilter = null,
  sizeValueField = "serverNum"
) {
  if (!dataList?.length) return 0;
  let filtered = dataList;
  if (dataFilter) filtered = filtered.filter(dataFilter);
  filtered = filtered.filter((d) => {
    const sizeValue = d[sizeValueField] ?? d.sizeValue ?? d.serverNum ?? 0;
    const tier = getTierByNum(sizeValue, sizeTiers);
    const tierIdx = sizeTiers.indexOf(tier);
    return tierIdx !== -1 && visibleTiers[tierIdx];
  });
  const pairs = filtered.map((d) => ({
    val: d[xField],
    num: d[sizeValueField] ?? d.sizeValue ?? d.serverNum ?? 0,
  }));
  return weightedAvg(pairs);
}
