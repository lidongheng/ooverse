/**
 * 后端 paraCode → 与图表 tooltip 一致的指标名（亮灯规则 key）
 * 未出现在此表中的 paraCode 将回退使用接口的 paraName
 */
export const PARA_CODE_TO_TRAFFIC_LABEL = {
  pool_npu_use_rate_all: 'NPU使用率',
  ecs_alloc_rate: 'ECS分配率',
  a3_alloc_rate: 'A3分配率',
  gross_margin: '毛利率',
  ecs_gross_margin: 'ECS毛利率',
  npu_card_time: 'NPU卡时使用率',
  cpu_use_rate: 'CPU使用率',
  evs_use_rate: 'EVS使用率',
}

/**
 * @param {{ paraCode?: string, paraName?: string }} row
 * @returns {string}
 */
export function resolveTrafficLightLabel(row) {
  if (!row || typeof row !== 'object') return ''
  const code = row.paraCode
  if (code != null && code !== '') {
    const mapped = PARA_CODE_TO_TRAFFIC_LABEL[code]
    if (mapped != null && mapped !== '') return mapped
  }
  return row.paraName || ''
}

/**
 * 将接口中的字符串/小数转为与图表 tooltip 一致的数值（百分比为主：0~1 小数转为 0~100）
 * @param {string|number|null|undefined} val
 * @returns {number|null}
 */
export function valToChartNumber(val) {
  if (val == null || val === '') return null
  const n = parseFloat(String(val))
  if (Number.isNaN(n)) return null
  if (Math.abs(n) <= 1) return n * 100
  return n
}

/** 两档：小于分界为红，否则为绿（与 getTrafficLight 依次比较 value 与 max 一致） */
function thresholdsRedGreen(cutoff) {
  return [
    { max: cutoff, light: 'red' },
    { max: Infinity, light: 'green' },
  ]
}

/**
 * 将 targetNum 接口的一行转为 getTrafficLight 用的阈值数组（与 getTrafficLight 约定一致：依次判断 value 是否小于 max）
 *
 * challengeVal 不参与分档。
 *
 * - 底线、目标**均有**有效值：三档红黄绿；黄区为两值在数轴上的区间（小者为下界、大者为上界）；两值相等则退化为两档红/绿。
 * - **仅其一**有有效值：两档红/绿；分界取该值——不低于该值（含等于）为绿，否则红。
 * - 两者皆无有效值：返回 null（本指标不产生规则）。
 *
 * @param {{ baseLineVal?: string|null, targetVal?: string|null, challengeVal?: unknown }} row
 * @returns {Array<{ max: number, light: string }>|null}
 */
export function rowToThresholds(row) {
  if (!row || typeof row !== 'object') return null

  const baseline = valToChartNumber(row.baseLineVal)
  const target = valToChartNumber(row.targetVal)
  const hasBase = baseline != null
  const hasTarget = target != null

  if (!hasBase && !hasTarget) {
    return null
  }

  if (hasBase && !hasTarget) {
    return thresholdsRedGreen(baseline)
  }
  if (!hasBase && hasTarget) {
    return thresholdsRedGreen(target)
  }

  if (baseline === target) {
    return thresholdsRedGreen(baseline)
  }

  const low = Math.min(baseline, target)
  const high = Math.max(baseline, target)

  return [
    { max: low, light: 'red' },
    { max: high, light: 'yellow' },
    { max: Infinity, light: 'green' },
  ]
}

/**
 * @param {Array<{ paraCode?: string, paraName?: string, baseLineVal?: string|null, targetVal?: string|null, challengeVal?: unknown }>} rows
 * @returns {Record<string, Array<{ max: number, light: string }>>}
 */
export function buildTrafficLightRulesFromRows(rows) {
  const out = {}
  if (!Array.isArray(rows)) return out
  for (const row of rows) {
    const label = resolveTrafficLightLabel(row)
    if (!label) continue
    const thresholds = rowToThresholds(row)
    if (thresholds) out[label] = thresholds
  }
  return out
}
