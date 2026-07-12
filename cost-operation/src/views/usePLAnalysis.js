import { ref } from "vue";
import {
  fetchRevenue,
  fetchCost,
  fetchGrossProfitRate,
  fetchCpuUsage,
} from "./apiPLAnalysis";

/**
 * 将 API 返回的 data 转为图表所需格式（近6个月，已排序）
 * @param {Array<{ month: string, value: number }>} raw
 * @param {'revenue'|'cost'|'grossProfitRate'|'cpuUsage'} type
 * @returns {{ months: string[], values: number[] }}
 */
function parseMetricData(raw, type) {
  const months = [];
  const values = [];
  (raw || []).forEach(({ month, value }) => {
    months.push(String(month));
    const v = Number(value);
    values.push(type === "revenue" || type === "cost" ? v / 1e8 : v);
  });
  return { months, values };
}

/**
 * 盈亏分析数据 Hook
 * @returns {{
 *   revenue: import('vue').Ref<number[]>,
 *   cost: import('vue').Ref<number[]>,
 *   grossProfitRate: import('vue').Ref<number[]>,
 *   cpuUsage: import('vue').Ref<number[]>,
 *   loading: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<Error|null>,
 *   fetchData: () => Promise<void>,
 * }}
 */
export function usePLAnalysis() {
  const monthLabels = ref([]);
  const revenue = ref([]);
  const cost = ref([]);
  const grossProfitRate = ref([]);
  const cpuUsage = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      const [revRes, costRes, gprRes, cpuRes] = await Promise.all([
        fetchRevenue(),
        fetchCost(),
        fetchGrossProfitRate(),
        fetchCpuUsage(),
      ]);
      const revParsed = parseMetricData(revRes?.data, "revenue");
      const costParsed = parseMetricData(costRes?.data, "cost");
      const gprParsed = parseMetricData(gprRes?.data, "grossProfitRate");
      const cpuParsed = parseMetricData(cpuRes?.data, "cpuUsage");

      monthLabels.value = revParsed.months;
      revenue.value = revParsed.values;
      cost.value = costParsed.values;
      grossProfitRate.value = gprParsed.values;
      cpuUsage.value = cpuParsed.values;
    } catch (e) {
      error.value = e;
      monthLabels.value = [];
      revenue.value = [];
      cost.value = [];
      grossProfitRate.value = [];
      cpuUsage.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    monthLabels,
    revenue,
    cost,
    grossProfitRate,
    cpuUsage,
    loading,
    error,
    fetchData,
  };
}
