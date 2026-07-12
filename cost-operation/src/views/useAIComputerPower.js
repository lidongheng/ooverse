import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { applyBubbleConfig, AI_SIZE_TIERS } from "./commonComputerPowerConfig";
import { selectedPool } from "./ResourcesLifecycle";
import { useCurrentDate } from "./useCurrentDate";

function keepEnglishOnly(str) {
  const match = String(str ?? "").match(/^[a-zA-Z\s]*/);
  return match ? match[0].trimEnd() : "";
}

/**
 * 智算散点图 Hook
 * operate 接口（白名单）：currentCost 含 groupKey、grossProfitMargin；403 时无权限（数据可能多于 efficiency）
 * efficiency 接口（无权限控制）：currentIntelligentList 含 groupKey、regionName、npuUseRate、sellableAmount、allocationRate 及智算气泡图新增指标
 *   顶层含 currentAllocationRate（分配率平均值）、currentNpuUseRateRate（NPU使用率平均值）
 * 以 efficiency 的 groupKey 为基准去匹配 operate 的 groupKey 合并
 */

/** 模拟 operate 接口 */
function mockFetchOperate(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            currentCost: [
              { groupKey: "华东-上海二(AZ1)", regionName: "华东-上海二(AZ1)", grossProfitMargin: 0.15 },
              { groupKey: "华东-北京四(AZ1)", regionName: "华东-北京四(AZ1)", grossProfitMargin: -0.48 },
              { groupKey: "华北-北京一(AZ1)-c6-mgr-2", regionName: "华北-北京一(AZ1)-c6-mgr-2", grossProfitMargin: null },
              { groupKey: "华东-上海一(AZ2)-c6-mgr-1", regionName: "华东-上海一(AZ2)-c6-mgr-1", grossProfitMargin: 0.35 },
              { groupKey: "华南-深圳一(AZ1)-c6-mgr-3", regionName: "华南-深圳一(AZ1)-c6-mgr-3", grossProfitMargin: -0.72 },
              { groupKey: "华北-北京一(AZ2)-c6-mgr-1", regionName: "华北-北京一(AZ2)-c6-mgr-1", grossProfitMargin: 0.28 },
              { groupKey: "多余数据-1", regionName: "多余数据-1", grossProfitMargin: 0.10 },
              { groupKey: "多余数据-2", regionName: "多余数据-2", grossProfitMargin: -0.05 },
            ],
          },
        }),
      300
    );
  });
  // 取消下行注释可模拟无权限
  // return Promise.resolve({ status: 403, data: null, message: "没有相关权限" });
}

/** 模拟 efficiency 接口 */
function mockFetchEfficiency(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            currentAllocationRate: 0.42,
            currentNpuUseRateRate: 0.65,
            currentIntelligentList: [
              { groupKey: "华东-上海二(AZ1)", regionName: "华东-上海二(AZ1)", npuUseRate: 0.72, sellableAmount: 600, allocationRate: 1, npuCardTimeUseRate: 0.68, aiCoreUseRate: 0.64, tokenUseRate: 0.74, actualTps: 66, dailyToken: 840, avgRpm: 50 },
              { groupKey: "华东-北京四(AZ1)", regionName: "华东-北京四(AZ1)", npuUseRate: 0.55, sellableAmount: 3600, allocationRate: 1, npuCardTimeUseRate: 0.51, aiCoreUseRate: 0.57, tokenUseRate: 0.61, actualTps: 57, dailyToken: 620, avgRpm: 54 },
              { groupKey: "华北-北京一(AZ1)-c6-mgr-2", regionName: "华北-北京一(AZ1)-c6-mgr-2", npuUseRate: 0.43, sellableAmount: 250, allocationRate: 0.9788, npuCardTimeUseRate: 0.39, aiCoreUseRate: 0.41, tokenUseRate: 0.83, actualTps: 72, dailyToken: 1200, avgRpm: 42 },
              { groupKey: "华东-上海一(AZ2)-c6-mgr-1", regionName: "华东-上海一(AZ2)-c6-mgr-1", npuUseRate: 0.88, sellableAmount: 80, allocationRate: 1, npuCardTimeUseRate: 0.82, aiCoreUseRate: 0.70, tokenUseRate: 0.48, actualTps: 41, dailyToken: 460, avgRpm: 64 },
              { groupKey: "华南-深圳一(AZ1)-c6-mgr-3", regionName: "华南-深圳一(AZ1)-c6-mgr-3", npuUseRate: 0.31, sellableAmount: 120, allocationRate: 0.9910, npuCardTimeUseRate: 0.27, aiCoreUseRate: 0.38, tokenUseRate: 0.68, actualTps: 60, dailyToken: 1280, avgRpm: 48 },
              { groupKey: "华北-北京一(AZ2)-c6-mgr-1", regionName: "华北-北京一(AZ2)-c6-mgr-1", npuUseRate: 0.65, sellableAmount: 4200, allocationRate: 1, npuCardTimeUseRate: 0.60, aiCoreUseRate: 0.56, tokenUseRate: 0.53, actualTps: 47, dailyToken: 760, avgRpm: 52 },
            ],
          },
        }),
      200
    );
  });
}

/** 解析 efficiency 接口响应 */
function parseEfficiencyResponse(res) {
  if (res.status !== 200 || !res.data?.currentIntelligentList) return null;
  return {
    list: res.data.currentIntelligentList,
  };
}

/** 从 operate 接口构建 groupKey -> { grossProfitMargin } 映射 */
function buildOperateMap(operateRes) {
  if (operateRes.status === 403) return { forbidden: true, map: {} };
  const list = operateRes.data?.currentCost ?? [];
  const map = Object.fromEntries(
    list.map((item) => [item.groupKey, { grossProfitMargin: item.grossProfitMargin ?? null }])
  );
  return { forbidden: false, map };
}

/** 以 efficiency 的 groupKey 为基准匹配 operate 数据 */
function mergeEfficiencyWithOperate(efficiencyList, operateMap) {
  return efficiencyList.map((item) => {
    const operate = operateMap[item.groupKey];
    return {
      ...item,
      grossProfitMargin: operate?.grossProfitMargin ?? null,
    };
  });
}

/** 转换为散点图所需的数据格式 */
function toChartData(mergedList) {
  const toNum = (v) => (v != null ? Number(v) : null);
  const toPercent = (v) => (v != null ? v * 100 : null);
  const baseList = mergedList.map((item) => {
    const allocationRate = toNum(item.allocationRate);
    const npuUseRate = toNum(item.npuUseRate);
    const grossProfitMargin = toNum(item.grossProfitMargin);
    const npuCardTimeUseRate = toNum(item.npuCardTimeUseRate);
    const aiCoreUseRate = toNum(item.aiCoreUseRate);
    const tokenUseRate = toNum(item.tokenUseRate);
    const actualTps = toNum(item.actualTps);
    const dailyToken = toNum(item.dailyToken);
    const avgRpm = toNum(item.avgRpm);
    return {
      name: item.regionName,
      azName: item.regionName,
      x: toPercent(allocationRate),
      y: toPercent(grossProfitMargin),
      serverNum: Number(item.sellableAmount) || 0,
      _allocationRate: toPercent(allocationRate),
      _npuUseRate: toPercent(npuUseRate),
      _grossProfitMargin: toPercent(grossProfitMargin),
      _cardTimeUseRate: toPercent(npuCardTimeUseRate),
      _npuCardTimeUseRate: toPercent(npuCardTimeUseRate),
      _aiCoreUseRate: toPercent(aiCoreUseRate),
      _tokenUseRate: toPercent(tokenUseRate),
      _actualTps: actualTps,
      _dailyToken: dailyToken,
      _avgRpm: avgRpm,
    };
  });
  return baseList.map((item) => applyBubbleConfig(item, AI_SIZE_TIERS));
}

/**
 * 智算数据 Hook
 */
export function useAIComputerPower() {
  const data = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const forbidden = ref(false);
  const rawData = ref(null);

  function resetState() {
    data.value = [];
    rawData.value = null;
  }

  async function fetchData(month) {
    loading.value = true;
    error.value = null;
    forbidden.value = false;
    const cloudServerName = keepEnglishOnly(selectedPool.value);

    try {
      // TODO: 替换为真实接口
      const efficiencyRes = await mockFetchEfficiency({ cloudServerName, month });
      const parsed = parseEfficiencyResponse(efficiencyRes);
      if (!parsed) {
        resetState();
        return;
      }

      const { list: efficiencyList } = parsed;

      // TODO: 替换为真实接口
      const operateRes = await mockFetchOperate({ cloudServerName, month });
      const { forbidden: isForbidden, map: operateMap } = buildOperateMap(operateRes);
      forbidden.value = isForbidden;

      const mergedList = mergeEfficiencyWithOperate(efficiencyList, operateMap);
      rawData.value = { list: mergedList };
      data.value = toChartData(mergedList);
    } catch (e) {
      error.value = e;
      resetState();
    } finally {
      loading.value = false;
    }
  }

  const { date: currentMonth } = storeToRefs(useCurrentDate());
  watch([selectedPool, currentMonth], ([, month]) => fetchData(month));

  return {
    data,
    loading,
    error,
    forbidden,
    rawData,
    fetchData,
  };
}
