import { computed } from "vue";

export function finiteNumbers(values) {
  return values.map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

/** [min - pad, max + pad]，无有效数值时返回 null */
export function paddedAxisRange(values, pad) {
  const nums = finiteNumbers(values);
  if (!nums.length) return null;
  return [Math.min(...nums) - pad, Math.max(...nums) + pad];
}

/**
 * 按最高位向上取整：58.5→60, 8.5→9, 585→600
 */
export function ceilToMagnitude(val) {
  if (val <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(val)));
  return Math.ceil(val / mag) * mag;
}

/**
 * 根据数据最大值生成 4 个刻度 [0, step, step*2, step*3]
 */
export function buildYTicksFromData(values) {
  const nums = finiteNumbers(values).filter((n) => n >= 0);
  if (!nums.length) return null;
  const maxVal = Math.max(...nums);
  if (maxVal <= 0) return [0];
  const step = ceilToMagnitude(maxVal / 3);
  return [0, step, step * 2, step * 3];
}

/**
 * 气泡图按数据 ±padding 计算 X/Y 轴范围与 Y 刻度（与 commonComputerPower 一致）。
 * @param {object} props - 含 axisRangeDataPadding, xField, yField, yRange, xRange, yTicks
 * @param {import('vue').ComputedRef<object[]>} mappedData
 * @param {{ includeXAxis?: boolean }} [options] includeXAxis 为 false 时仅计算 Y（智算页保留自定义 X）
 */
export function useBubbleAxisRange(props, mappedData, options = {}) {
  const includeXAxis = options.includeXAxis !== false;

  const dataPaddedAxisRanges = computed(() => {
    if (props.axisRangeDataPadding == null) return null;
    const rows = mappedData.value;
    if (!rows.length) return null;
    const pad = props.axisRangeDataPadding;
    return {
      xRange: paddedAxisRange(
        rows.map((r) => r[props.xField]),
        pad
      ),
      yRange: props.yField
        ? paddedAxisRange(rows.map((r) => r[props.yField]), pad)
        : null,
    };
  });

  const dataYTicks = computed(() => {
    if (props.axisRangeDataPadding == null || !props.yField) return null;
    return buildYTicksFromData(
      mappedData.value.map((r) => r[props.yField])
    );
  });

  const chartXRange = computed(() => {
    if (!includeXAxis) return null;
    const dataRange = dataPaddedAxisRanges.value?.xRange;
    if (!dataRange) return props.xRange;
    return [0, Math.min(dataRange[1], 105)];
  });

  const chartYRange = computed(() => {
    if (dataYTicks.value && dataYTicks.value.length > 1) {
      const tickMax = dataYTicks.value[dataYTicks.value.length - 1];
      const pad = props.axisRangeDataPadding ?? 5;
      return [-pad, tickMax + pad];
    }
    return dataPaddedAxisRanges.value?.yRange ?? props.yRange;
  });

  const chartYTicks = computed(() => {
    if (props.axisRangeDataPadding == null) return props.yTicks;
    return dataYTicks.value ?? props.yTicks;
  });

  return {
    dataPaddedAxisRanges,
    dataYTicks,
    chartXRange,
    chartYRange,
    chartYTicks,
  };
}
