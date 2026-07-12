import { APP_CONFIG } from '@/config/app'
import { requestWithToken } from '@/plugins/init'

/** 底线 / 目标 / 挑战值统一配置接口路径 */
export const TARGET_NUM_PATH = '/system/target-num'

/** 开发模式：与后端约定结构一致的整包响应（含 status、data） */
const MOCK_TARGET_NUM_RESPONSE = {
  status: 200,
  massage: 'success',
  data: [
    { baseLineVal: '0.22', challengeVal: null, paraName: 'NPU使用率', targetVal: '0.32', paraCode: 'pool_npu_use_rate_all' },
    { baseLineVal: '0.30', challengeVal: null, paraName: 'ECS分配率', targetVal: '0.60', paraCode: 'ecs_alloc_rate' },
    { baseLineVal: '0.30', challengeVal: null, paraName: 'A3分配率', targetVal: '0.60', paraCode: 'a3_alloc_rate' },
    { baseLineVal: '0', challengeVal: null, paraName: '毛利率', targetVal: '0.50', paraCode: 'gross_margin' },
    { baseLineVal: '0', challengeVal: null, paraName: 'ECS毛利率', targetVal: '0.50', paraCode: 'ecs_gross_margin' },
    { baseLineVal: '0.30', challengeVal: null, paraName: 'NPU卡时使用率', targetVal: '0.50', paraCode: 'npu_card_time' },
    { baseLineVal: '0.30', challengeVal: null, paraName: 'CPU使用率', targetVal: '0.60', paraCode: 'cpu_use_rate' },
    { baseLineVal: '0.30', challengeVal: null, paraName: 'EVS使用率', targetVal: '0.60', paraCode: 'evs_use_rate' },
  ],
}

async function simulateRequestDelay(min = 300, max = 800) {
  const delay = Math.random() * (max - min) + min
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * 拉取底线 / 目标 / 挑战值列表（与 init 一致：skipBackendRequests 时用本地 mock）
 * @param {string} token XToken
 * @returns {Promise<{ status?: number, massage?: string, message?: string, data?: unknown }>}
 */
export async function fetchTargetNumList(token) {
  if (APP_CONFIG.dev.skipBackendRequests) {
    await simulateRequestDelay()
    console.log('🚀 [开发模式] 使用模拟 targetNum 数据')
    return { ...MOCK_TARGET_NUM_RESPONSE }
  }
  return requestWithToken(TARGET_NUM_PATH, {
    method: 'GET',
    token,
  })
}
