/**
 * 根据图表容器宽度计算缩放比例，用于 ECharts Canvas 绑定的像素值（fontSize、padding、symbolSize 等）
 * PostCSS 只能转换 CSS 中的 px，Canvas 绘制的元素需要手动缩放
 *
 * @param {HTMLElement} el - 图表容器 DOM 元素
 * @param {number} [baseWidth=1200] - el的宽度
 * @param {number} [min=0.5] - 最小缩放比
 * @param {number} [max=1] - 最大缩放比
 * @returns {number} 缩放系数 s，用法：fontSize: Math.round(12 * s)
 */
export function getChartScale(el, baseWidth = 1200, min = 0.5, max = 1) {
  if (!el) return 1;
  const w = el.offsetWidth;
  return Math.clamp
    ? Math.clamp(w / baseWidth, min, max)
    : Math.max(min, Math.min(max, w / baseWidth));
}

/**
 * 批量缩放数值的辅助函数
 * @param {number} s - 缩放系数
 * @param {number} value - 原始像素值
 * @param {boolean} [round=false] - 是否取整（用于 fontSize）
 * @returns {number}
 */
export function scaled(s, value, round = false) {
  const result = value * s;
  return round ? Math.round(result) : result;
}
