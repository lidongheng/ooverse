/**
 * Region 标签位置与引导线配置
 *
 * 每个 Region 可设置：
 * - offset.x: 正数=右, 负数=左
 * - offset.y: 正数=下, 负数=上
 * - lineStyle: 'elbow'（默认） | 'elbowReverse' | 'straight'
 * - lineLength: 线段长度（px，可选，不设则自动计算）
 *     elbow 模式下为第 1 段（正方向）长度；
 *     elbowReverse 模式下为第 2 段（正方向）长度。
 *
 * 偏移值在运行时会乘以缩放系数 s，以适配不同屏幕。
 *
 * elbow 模式（默认）：第 1 段走东/南/西/北正方向，拐点处呈 125° 钝角，
 *   第 2 段走东北/东南/西南/西北斜方向到达标签。
 * elbowReverse 模式：第 1 段走东北/东南/西南/西北斜方向，拐点处呈 125° 钝角，
 *   第 2 段走东/南/西/北正方向到达标签。
 * straight 模式：散点到标签的直线。
 */

/** 默认标签配置 */
export const DEFAULT_LABEL = {
  offset: { x: 0, y: -40 },
  lineStyle: 'elbow',
};

/**
 * 各 Region 自定义标签配置
 * key = Region name（与 regionData 中的 name 一致）
 */
export const REGION_LABEL_MAP = {
  // ---- 欧洲 ----
  "欧洲-巴黎-OP1": { offset: { x: -50, y: -25 } },
  "欧洲-法兰克福": { offset: { x: 40, y: -35 } },
  "欧洲-伦敦": { offset: { x: -45, y: -30 } },
  "欧洲-阿姆斯特丹": { offset: { x: 35, y: -35 } },
  "欧洲-马德里": { offset: { x: -45, y: 30 } },

  // ---- 俄罗斯 ----
  "俄罗斯-莫斯科": { offset: { x: 45, y: -30 } },

  // ---- 中东 ----
  "土耳其-伊斯坦布尔": { offset: { x: 50, y: -20 } },
  "中东-迪拜": { offset: { x: 50, y: 20 } },

  // ---- 非洲 ----
  "非洲-约翰内斯堡": { offset: { x: 45, y: 30 } },
  "非洲-开罗": { offset: { x: 50, y: -20 } },
  "非洲-拉各斯": { offset: { x: -50, y: 25 } },

  // ---- 中国 ----
  // 去重后每个坐标只展示首个 Region 标签。全部使用 elbowReverse 模式。
  // 左右分列：东侧向右上阶梯排布，西侧向左阶梯排布，避免互相遮挡。

  // 右列：北京/上海/广州/深圳/香港 — 向右上，阶梯 y 间距 ≥35
  "华北-北京四": { offset: { x: 90, y: -70 }, lineStyle: 'elbowReverse' },
  "华北-北京一": { offset: { x: 90, y: -30 }, lineStyle: 'elbowReverse' },
  "华北-北京二": { offset: { x: 90, y: 10 }, lineStyle: 'elbowReverse' },
  "华东-上海一": { offset: { x: 90, y: -70 }, lineStyle: 'elbowReverse' },
  "华东-上海二": { offset: { x: 90, y: -35 }, lineStyle: 'elbowReverse' },
  "华南-广州": { offset: { x: 90, y: -70 }, lineStyle: 'elbowReverse' },
  "华南-广州-友好用户环境": { offset: { x: 90, y: -35 }, lineStyle: 'elbowReverse' },
  "华南-深圳": { offset: { x: 90, y: -45 }, lineStyle: 'elbowReverse' },
  "中国-香港": { offset: { x: 90, y: -10 }, lineStyle: 'elbowReverse' },

  // 左列：乌兰察布/克拉玛依/贵阳/武汉/成都 — 向左，阶梯 y 间距 ≥40
  "华北-乌兰察布一": { offset: { x: -105, y: -65 }, lineStyle: 'elbowReverse' },
  "华北-乌兰察布-汽车一": { offset: { x: -105, y: -25 }, lineStyle: 'elbowReverse' },
  "腾讯云政务平台-乌兰察布": { offset: { x: -105, y: 15 }, lineStyle: 'elbowReverse' },
  "西北-克拉玛依": { offset: { x: -80, y: -5 }, lineStyle: 'elbowReverse' },
  "华中-武汉": { offset: { x: -100, y: -30 }, lineStyle: 'elbowReverse' },
  "西南-成都": { offset: { x: -100, y: -70 }, lineStyle: 'elbowReverse' },
  "西南-贵阳一": { offset: { x: -100, y: 10 }, lineStyle: 'elbowReverse' },
  "西南-贵阳-汽车二": { offset: { x: -100, y: 50 }, lineStyle: 'elbowReverse' },

  // ---- 亚太 ----
  "亚太-雅加达": { offset: { x: 55, y: 55 }, lineStyle: 'elbowReverse' },
  "亚太-新加坡": { offset: { x: 55, y: -15 }, lineStyle: 'elbowReverse' },
  "亚太-东京": { offset: { x: 55, y: -30 }, lineStyle: 'elbowReverse' },
  "亚太-悉尼": { offset: { x: 50, y: 30 }, lineStyle: 'elbowReverse' },
  "亚太-首尔": { offset: { x: 45, y: -40 }, lineStyle: 'elbowReverse' },
  "亚太-孟买": { offset: { x: -55, y: -25 }, lineStyle: 'elbowReverse' },
  "亚太-曼谷": { offset: { x: -55, y: -25 }, lineStyle: 'elbowReverse' },
  "亚太-马尼拉": { offset: { x: 55, y: 30 }, lineStyle: 'elbowReverse' },
  "亚太-吉隆坡": { offset: { x: -55, y: 30 }, lineStyle: 'elbowReverse' },

  // ---- 美洲 ----
  "拉美-墨西哥城一": { offset: { x: -45, y: -30 } },
  "拉美-圣保罗": { offset: { x: 50, y: 25 } },
  "拉美-波哥大": { offset: { x: -50, y: -20 } },
  "拉美-布宜诺斯艾利斯": { offset: { x: 45, y: 30 } },
  "拉美-圣地亚哥": { offset: { x: -50, y: 25 } },
  "北美-弗吉尼亚": { offset: { x: 50, y: -25 } },
  "北美-硅谷": { offset: { x: -45, y: -30 } },
  "北美-达拉斯": { offset: { x: 45, y: 30 } },
};

/**
 * 获取指定 Region 的标签配置
 * @param {string} name - Region 名称
 * @returns {{ offset: { x: number, y: number }, lineStyle?: 'elbow' | 'elbowReverse' | 'straight', lineLength?: number }}
 */
export function getRegionLabelConfig(name) {
  return REGION_LABEL_MAP[name] || DEFAULT_LABEL;
}
