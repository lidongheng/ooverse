import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchTargetNumList } from '@/api/targetNum'
import { buildTrafficLightRulesFromRows } from '@/utils/thresholdRules'

function normalizeResponseBody(raw) {
  if (!raw) return []
  if (Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

export const useTargetNumStore = defineStore('targetNum', () => {
  const targetNumList = ref([])
  const loading = ref(false)
  const error = ref(null)

  const trafficLightRules = computed(() =>
    buildTrafficLightRulesFromRows(targetNumList.value)
  )

  /**
   * @param {string} token XToken
   */
  async function loadData(token) {
    loading.value = true
    error.value = null
    try {
      const raw = await fetchTargetNumList(token)

      const status = raw?.status
      if (status != null && status !== 200) {
        throw new Error(raw?.massage || raw?.message || 'targetNum 接口状态异常')
      }

      const list = normalizeResponseBody(raw)
      targetNumList.value = list
    } catch (e) {
      console.error('targetNum loadData:', e)
      error.value = e?.message || String(e)
      targetNumList.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    targetNumList,
    loading,
    error,
    loadData,
    trafficLightRules,
  }
})
