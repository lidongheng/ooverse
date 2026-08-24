/**
 * Region 标签位置与引导线配置
 *
 * 每个 Region 可设置:
 * - offset.x: 正数=右, 负数=左
 * - offset.y: 正数=下, 负数=上
 * - lineStyle: 'elbow' (默认) | 'elbowReverse' | 'straight'
 * - lineLength: 线段长度 (px, 可选, 不设则自动计算)
 *   elbow 模式下为第 1 段 (正方向) 长度;
 *   elbowReverse 模式下为第 2 段 (正方向) 长度。
 *
 * 偏移值在运行时会乘以缩放系数 s, 以适配不同屏幕。
 *
 * elbow 模式 (默认): 第 1 段走东/南/西/北正方向, 拐点处呈 125° 钝角,
 * 第 2 段走东北/东南/西南/西北斜方向到达标签。
 * elbowReverse 模式: 第 1 段走东北/东南/西南/西北斜方向, 拐点处呈 125° 钝角,
 * 第 2 段走东/南/西/北正方向到达标签。
 * straight 模式: 散点到标签的直线。
 */
/**
 * 默认标签配置
 */
export const DEFAULT_LABEL = {
  offset: { x: 40, y: 0 },
  lineStyle: 'straight',
  anchor: 'left', // 连接方向: left(默认) | right | top | bottom
};

export const SALE_REGION_LABEL_MAP = {
  // 俄罗斯已过滤, 不再展示
  // 俄罗斯: { offset: { x: -70.57, y: -203.42}, anchor: 'right', lineStyle: 'elbow', lineLength: 40 },
  欧洲: { offset: { x: -15.42, y: -46.85 }, anchor: 'right', lineStyle: 'elbow' },
  北部非洲: { offset: { x: -14.85, y: 28.57 }, anchor: 'right', lineStyle: 'elbow' },
  南部非洲: { offset: { x: -52.57, y: 82 }, anchor: 'right', lineStyle: 'elbow' },
  中东: { offset: { x: 74.28, y: -227.71 }, anchor: 'bottom', lineStyle: 'elbowReverse' },
  亚太: { offset: { x: -27.42, y: 90.28 }, anchor: 'top', lineStyle: 'elbow' },
  华北: { offset: { x: 114.28, y: -251.42 }, anchor: 'left', lineStyle: 'elbow', lineLength: 90 },
  华东: { offset: { x: 108.57, y: -102.85 }, anchor: 'left', lineStyle: 'elbowReverse' },
  华南: { offset: { x: 120, y: 42.28 }, anchor: 'left', lineStyle: 'elbow', lineLength: 50 },
  西部: { offset: { x: 133.28, y: 226.28 }, anchor: 'left', lineStyle: 'elbow', lineLength: 40 },
  拉美: { offset: { x: 52.85, y: 60.42 }, anchor: 'left', lineStyle: 'elbowReverse' },
};

/**
 * 获取指定 Region 的标签配置
 * @param {string} name - Region 名称
 * @returns {{ offset: { x: number, y: number }, lineStyle?: 'elbow' | 'elbowReverse' | 'straight', lineLength?: number, anchor?: 'left' | 'right' | 'top' | 'bottom' }}
 */
export function getSaleRegionLabelConfig(name) {
  return SALE_REGION_LABEL_MAP[name] || DEFAULT_LABEL;
}