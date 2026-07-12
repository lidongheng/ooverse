import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { applyBubbleConfig } from "./commonComputerPowerConfig";
import { selectedPool } from "./ResourcesLifecycle";
import { useCurrentDate } from "./useCurrentDate";

function keepEnglishOnly(str) {
  const match = String(str ?? "").match(/^[a-zA-Z\s]*/);
  return match ? match[0].trimEnd() : "";
}


/**
 * 盈亏趋势散点图 Hook
 * operate 接口（白名单）：list 仅含 azName、profitLoss；403 时无权限
 * efficiency 接口（无权限控制）：list 含 azName、useRate、serverNum，profitLoss 全为 null
 * 两个接口通过 azName 匹配合并
 */

/** 模拟 operate 接口（白名单控制，仅返回 azName + profitLoss） */
function mockFetchOperate(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            list: [
              { azName: "华东-上海二(AZ1)", profitLoss: 200, grossProfitMargin: 0.12 },
              { azName: "华东-北京四(AZ1)", profitLoss: -450, grossProfitMargin: -0.08 },
              { azName: "华北-北京--AZ1-c6-mgr-2", profitLoss: -800, grossProfitMargin: -0.15 },
              { azName: "华东-上海--AZ2-c6-mgr-1", profitLoss: 600, grossProfitMargin: 0.21 },
              { azName: "华南-深圳--AZ1-c6-mgr-3", profitLoss: -1100, grossProfitMargin: -0.25 },
              { azName: "华北-北京--AZ2-c6-mgr-1", profitLoss: 350, grossProfitMargin: 0.09 },
              { azName: "华东-杭州--AZ1-c6-mgr-2", profitLoss: -300, grossProfitMargin: -0.05 },
              { azName: "华南-广州--AZ1-c6-mgr-1", profitLoss: 900, grossProfitMargin: 0.30 },
              { azName: "华北-天津--AZ1-c6-mgr-2", profitLoss: 100, grossProfitMargin: 0.03 },
              { azName: "华东-南京--AZ2-c6-mgr-2", profitLoss: -150, grossProfitMargin: -0.04 },
              { azName: "华南-深圳--AZ2-c6-mgr-1", profitLoss: -950, grossProfitMargin: -0.20 },
              { azName: "华北-北京--AZ3-c6-mgr-1", profitLoss: 750, grossProfitMargin: 0.18 },
            ],
          },
        }),
      300
    );
  });
  // 取消下行注释可模拟无权限
  // return Promise.resolve({ status: 403, data: null, message: "没有相关权限" });
}

/** 模拟 efficiency 接口（无权限控制，profitLoss 全为 null） */
function mockFetchEfficiency(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            useRate: 0.5832,
            list: [
              { azName: "华东-上海二(AZ1)", profitLoss: null, useRate: 0.35, serverNum: 80 },
              { azName: "华东-北京四(AZ1)", profitLoss: null, useRate: 0.42, serverNum: 120 },
              { azName: "华北-北京--AZ1-c6-mgr-2", profitLoss: null, useRate: 0.28, serverNum: 55 },
              { azName: "华东-上海--AZ2-c6-mgr-1", profitLoss: null, useRate: 0.51, serverNum: 200 },
              { azName: "华南-深圳--AZ1-c6-mgr-3", profitLoss: null, useRate: 0.15, serverNum: 30 },
              { azName: "华北-北京--AZ2-c6-mgr-1", profitLoss: null, useRate: 0.62, serverNum: 150 },
              { azName: "华东-杭州--AZ1-c6-mgr-2", profitLoss: null, useRate: 0.38, serverNum: 90 },
              { azName: "华南-广州--AZ1-c6-mgr-1", profitLoss: null, useRate: 0.72, serverNum: 300 },
              { azName: "华北-天津--AZ1-c6-mgr-2", profitLoss: null, useRate: 0.55, serverNum: 45 },
              { azName: "华东-南京--AZ2-c6-mgr-2", profitLoss: null, useRate: 0.48, serverNum: 70 },
              { azName: "华南-深圳--AZ2-c6-mgr-1", profitLoss: null, useRate: 0.20, serverNum: 180 },
              { azName: "华北-北京--AZ3-c6-mgr-1", profitLoss: null, useRate: 0.66, serverNum: 250 },
            ],
          },
        }),
      200
    );
  });
}

/** 解析 efficiency 接口响应，无效时返回 null */
function parseEfficiencyResponse(res) {
  if (res.status !== 200 || !res.data?.list) return null;
  return {
    list: res.data.list,
  };
}

/** 从 operate 接口构建 azName -> { profitLoss, grossProfitMargin } 映射，403 时返回 { forbidden: true } */
function buildProfitLossMap(operateRes) {
  if (operateRes.status === 403) return { forbidden: true, map: {} };
  const list = operateRes.data?.list ?? [];
  const map = Object.fromEntries(
    list.map((item) => [
      item.azName,
      { profitLoss: item.profitLoss, grossProfitMargin: item.grossProfitMargin },
    ])
  );
  return { forbidden: false, map };
}

/** 合并 efficiency 与 operate 数据 */
function mergeEfficiencyWithProfitLoss(efficiencyList, profitLossMap) {
  return efficiencyList.map((item) => {
    const operate = profitLossMap[item.azName];
    return {
      ...item,
      profitLoss: operate?.profitLoss ?? item.profitLoss,
      grossProfitMargin: operate?.grossProfitMargin ?? null,
    };
  });
}

/** 转换为散点图所需的数据格式 */
function toChartData(mergedList) {
  const baseList = mergedList.map((item) => ({
    name: item.azName,
    x: item.useRate != null ? item.useRate * 100 : null,
    y: item.incomeProfitLoss != null ? item.incomeProfitLoss / 10000 : null,
    serverNum: item.serverNum ?? 0,
    grossProfitMargin: item.grossProfitMargin ?? null,
  }));
  return baseList.map((item) => applyBubbleConfig(item));
}

/** 盈亏趋势数据 Hook */
export function useProfitLossTrend() {
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
      // TODO: 替换为真实接口，如 axios.get('/api/xxx/efficiency', { params: { cloudServerName, month } })
      const efficiencyRes = await mockFetchEfficiency({ cloudServerName, month });
      const parsed = parseEfficiencyResponse(efficiencyRes);
      if (!parsed) {
        resetState();
        return;
      }

      const { list: efficiencyList } = parsed;

      // TODO: 替换为真实接口，如 axios.get('/api/xxx/operate', { params: { cloudServerName, month } })
      const operateRes = await mockFetchOperate({ cloudServerName, month });
      const { forbidden: isForbidden, map: profitLossMap } = buildProfitLossMap(operateRes);
      forbidden.value = isForbidden;

      const mergedList = mergeEfficiencyWithProfitLoss(efficiencyList, profitLossMap);
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
