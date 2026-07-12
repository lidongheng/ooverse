import { ref } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { applyBubbleConfig, SIZE_TIERS } from "./commonComputerPowerConfig";
import { selectedPool } from "./ResourcesLifecycle";
import { useCurrentDate } from "./useCurrentDate";

/**
 * 通用算力散点图 Hook
 * operate 接口（白名单）：list 含 azName、grossProfitRate；avgRangeList 含各档位平均值；403 时无权限
 * efficiency 接口（无权限控制）：list 含 azName、useRate、allocationRate、serverNum
 *   avgRangeList 的 val 为 null（不涉及毛利率）
 * 两个接口通过 azName 匹配合并
 * 平均值使用后端 avgRangeList 中对应指标字段，再根据用户勾选的档位动态加权计算：(v1*n1+…+vn*nn)/(n1+…+nn)
 * color、symbolSize 由前端 commonComputerPowerConfig 配置
 */

/** 模拟 operate 接口（白名单控制，仅返回 azName + grossProfitRate） */
function mockFetchOperate(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            list: [
              { azName: "华东-上海二(AZ1)", grossProfitRate: 1 },
              { azName: "华东-北京四(AZ1)", grossProfitRate: -14.7251 },
              { azName: "华北-北京一(AZ1)-c6-mgr-2", grossProfitRate: -39.9059 },
              { azName: "华东-上海一(AZ2)-c6-mgr-1", grossProfitRate: 1 },
              { azName: "华南-深圳一(AZ1)-c6-mgr-3", grossProfitRate: -38.719 },
              { azName: "华北-北京一(AZ2)-c6-mgr-1", grossProfitRate: 0.2828 },
              { azName: "华东-杭州一(AZ1)-c6-mgr-2", grossProfitRate: -85.6816 },
              { azName: "华南-广州一(AZ1)-c6-mgr-1", grossProfitRate: 0.9955 },
              { azName: "华北-天津一(AZ1)-c6-mgr-2", grossProfitRate: 0.1604 },
              { azName: "华东-南京一(AZ2)-c6-mgr-2", grossProfitRate: 0.9062 },
              { azName: "华南-深圳一(AZ2)-c6-mgr-1", grossProfitRate: -114.3734 },
              { azName: "华北-北京一(AZ3)-c6-mgr-1", grossProfitRate: -209.2976 },
              { azName: "华东-上海一(AZ1)-c6-mgr-2", grossProfitRate: -69.7619 },
              { azName: "华南-广州一(AZ2)-c6-mgr-2", grossProfitRate: -105.4489 },
              { azName: "华北-石家庄一(AZ1)-c6-mgr-1", grossProfitRate: -13.3975 },
              { azName: "华东-苏州一(AZ1)-c6-mgr-3", grossProfitRate: -157.734 },
              { azName: "华南-东莞一(AZ1)-c6-mgr-1", grossProfitRate: 0.2018 },
              { azName: "华北-北京一(AZ4)-c6-mgr-1", grossProfitRate: 0.9743 },
              { azName: "华东-上海一(AZ3)-c6-mgr-2", grossProfitRate: 0.2441 },
            ],
            avgRangeList: [
              { name: "0-100", num: "323", val: 0.6499, allocationVal: 0.1865, useRateVal: 0.2742 },
              { name: "100-500", num: "156", val: 0.7234, allocationVal: 0.4821, useRateVal: 0.3688 },
              { name: "500-1000", num: "89", val: 0.5612, allocationVal: 0.3564, useRateVal: 0.1926 },
              { name: ">1000", num: "45", val: 0.8123, allocationVal: 0.6127, useRateVal: 0.4385 },
            ],
          },
        }),
      300
    );
  });
  // 取消下行注释可模拟无权限
  // return Promise.resolve({ status: 403, data: null, message: "没有相关权限" });
}

/** 模拟 efficiency 接口（无权限控制） */
function mockFetchEfficiency(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            avgRangeList: [
              { name: "0-100", num: "323", val: null },
              { name: "100-500", num: "156", val: null },
              { name: "500-1000", num: "89", val: null },
              { name: ">1000", num: "45", val: null },
            ],
            list: [
              { azName: "华东-上海二(AZ1)", useRate: 0, allocationRate: 0.12, writeBandwidthUseRate: 0.08, serverNum: 0, totalDiskSpace: 0.00 },
              { azName: "华东-北京四(AZ1)", useRate: 0.3715, allocationRate: 0.50, writeBandwidthUseRate: 0.62, serverNum: 36, totalDiskSpace: 1800.25 },
              { azName: "华北-北京一(AZ1)-c6-mgr-2", useRate: 0.4337, allocationRate: 0.50, writeBandwidthUseRate: 0.55, serverNum: 25, totalDiskSpace: 3200.75 },
              { azName: "华东-上海一(AZ2)-c6-mgr-1", useRate: 0, allocationRate: 0.08, writeBandwidthUseRate: 0.12, serverNum: 0, totalDiskSpace: 0.00 },
              { azName: "华南-深圳一(AZ1)-c6-mgr-3", useRate: 0.3123, allocationRate: 0.35, writeBandwidthUseRate: 0.48, serverNum: 0, totalDiskSpace: 2600.50 },
              { azName: "华北-北京一(AZ2)-c6-mgr-1", useRate: 0.4251, allocationRate: 0.60, writeBandwidthUseRate: 0.78, serverNum: 42, totalDiskSpace: 5200.35 },
              { azName: "华东-杭州一(AZ1)-c6-mgr-2", useRate: 0.0896, allocationRate: 0.10, writeBandwidthUseRate: 0.35, serverNum: 556, totalDiskSpace: 11200.80 },
              { azName: "华南-广州一(AZ1)-c6-mgr-1", useRate: 0.168, allocationRate: 0.22, writeBandwidthUseRate: 0.24, serverNum: 2, totalDiskSpace: 1600.10 },
              { azName: "华北-天津一(AZ1)-c6-mgr-2", useRate: 0.4197, allocationRate: 0.55, writeBandwidthUseRate: 0.68, serverNum: 37, totalDiskSpace: 7200.65 },
              { azName: "华东-南京一(AZ2)-c6-mgr-2", useRate: 0.2033, allocationRate: 0.20, writeBandwidthUseRate: 0.44, serverNum: 7777, totalDiskSpace: 24600.45 },
              { azName: "华南-深圳一(AZ2)-c6-mgr-1", useRate: 0.071, allocationRate: 0.15, writeBandwidthUseRate: 0.18, serverNum: 176, totalDiskSpace: 9600.20 },
              { azName: "华北-北京一(AZ3)-c6-mgr-1", useRate: 0.1006, allocationRate: 0.18, writeBandwidthUseRate: 0.31, serverNum: 240, totalDiskSpace: 12800.95 },
              { azName: "华东-上海一(AZ1)-c6-mgr-2", useRate: 0.4171, allocationRate: 0.45, writeBandwidthUseRate: 0.72, serverNum: 107, totalDiskSpace: 6100.40 },
              { azName: "华南-广州一(AZ2)-c6-mgr-2", useRate: 0, allocationRate: 0.05, writeBandwidthUseRate: 0.09, serverNum: 4, totalDiskSpace: 1400.05 },
              { azName: "华北-石家庄一(AZ1)-c6-mgr-1", useRate: 0.4123, allocationRate: 0.48, writeBandwidthUseRate: 0.59, serverNum: 17, totalDiskSpace: 3900.55 },
              { azName: "华东-苏州一(AZ1)-c6-mgr-3", useRate: 0.0959, allocationRate: 0.12, writeBandwidthUseRate: 0.28, serverNum: 3258, totalDiskSpace: 21800.15 },
              { azName: "华南-东莞一(AZ1)-c6-mgr-1", useRate: 0.4202, allocationRate: 0.52, writeBandwidthUseRate: 0.82, serverNum: 1546, totalDiskSpace: 17600.70 },
              { azName: "华北-北京一(AZ4)-c6-mgr-1", useRate: 0.1943, allocationRate: 0.28, writeBandwidthUseRate: 0.39, serverNum: 4646, totalDiskSpace: 23200.30 },
              { azName: "华东-上海一(AZ3)-c6-mgr-2", useRate: 0.3637, allocationRate: 0.40, writeBandwidthUseRate: 0.51, serverNum: 88, totalDiskSpace: 8400.85 },
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

/** 从 operate 接口构建 azName -> { grossProfitRate } 映射，403 时返回 { forbidden: true } */
function buildOperateMap(operateRes) {
  if (operateRes.status === 403) return { forbidden: true, map: {}, avgRangeList: [] };
  const list = operateRes.data?.list ?? [];
  const map = Object.fromEntries(
    list.map((item) => [item.azName, { grossProfitRate: item.grossProfitRate }])
  );
  return { forbidden: false, map, avgRangeList: operateRes.data?.avgRangeList ?? [] };
}

/**
 * 根据选中的档位计算加权平均值
 * @param {Array} avgRangeList  后端返回的 [{ name, num, val, allocationVal, useRateVal }]
 * @param {boolean[]} visibleTiers  各档位是否选中，下标对应 sizeTiers
 * @param {Array} sizeTiers  档位配置数组，用 label 与 avgRangeList.name 匹配
 * @param {string} valueField  平均值字段，ECS 分配率用 allocationVal，使用率用 useRateVal
 * @returns {number} 加权平均值（原始比率，未乘 100）
 */
export function computeWeightedAvg(avgRangeList, visibleTiers, sizeTiers = SIZE_TIERS, valueField = "val") {
  if (!avgRangeList?.length) return 0;
  let sumWeighted = 0;
  let sumNum = 0;
  for (const item of avgRangeList) {
    const val = item[valueField];
    if (val == null) continue;
    const tierIdx = sizeTiers.findIndex((t) => t.label === item.name);
    if (tierIdx === -1 || !visibleTiers[tierIdx]) continue;
    const num = Number(item.num) || 0;
    sumWeighted += Number(val) * num;
    sumNum += num;
  }
  return sumNum > 0 ? sumWeighted / sumNum : 0;
}

/** 合并 efficiency 与 operate 数据 */
function mergeEfficiencyWithOperate(efficiencyList, operateMap) {
  return efficiencyList.map((item) => {
    const operate = operateMap[item.azName];
    return {
      ...item,
      grossProfitRate: operate?.grossProfitRate ?? null,
    };
  });
}

/** 转换为散点图所需的数据格式 */
function toChartData(mergedList, sizeTiers = SIZE_TIERS, sizeValueField = "serverNum") {
  const toPercent = (v) => (v != null ? v * 100 : null);
  const baseList = mergedList.map((item) => ({
    name: item.azName,
    regionName: item.regionName || "",
    azName: item.azName,
    resourcePoolTotalName: item.resourcePoolTotalName,
    x: toPercent(item.useRate),
    y: toPercent(item.grossProfitRate),
    serverNum: item.serverNum ?? 0,
    totalDiskSpace: item.totalDiskSpace ?? 0,
    _useRate: toPercent(item.useRate),
    _allocationRate: toPercent(item.allocationRate),
    allocationRate: toPercent(item.allocationRate),
    _grossProfitRate: toPercent(item.grossProfitRate),
    grossProfitRate: toPercent(item.grossProfitRate),
    _writeBandwidthUseRate: item.writeBandwidthUseRate != null ? Number(item.writeBandwidthUseRate) * 100 : null,
  }));

  return baseList.map((item) => applyBubbleConfig(item, sizeTiers, sizeValueField));
}

function normalizeFilterParams(filters = {}) {
  const toList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return value.split(",").filter(Boolean);
    return [];
  };
  const normalizeResourceTypeList = (value) => {
    return Array.isArray(value) ? value : [];
  };
  return {
    regionNameList: toList(filters.regionNameList),
    azNameList: toList(filters.azNameList),
    resourceTypeList: normalizeResourceTypeList(filters.resourceTypeList),
  };
}

/** 通用算力数据 Hook */
export function useCommonComputerPower() {
  const data = ref([]);
  const avgRangeList = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const forbidden = ref(false);
  const rawData = ref(null);
  const currentFilters = ref({});
  let fetchDataRequestId = 0;

  function resetState() {
    data.value = [];
    avgRangeList.value = [];
    rawData.value = null;
  }

  const { date } = storeToRefs(useCurrentDate());

  async function fetchData(filters = currentFilters.value) {
    const requestId = ++fetchDataRequestId;
    loading.value = true;
    error.value = null;
    forbidden.value = false;
    const cloudServerName = selectedPool.value;
    currentFilters.value = normalizeFilterParams(filters);
    const params = {
      cloudServerName,
      month: dayjs(date.value).format("YYYYMM"),
      date: date.value,
      regionNameList: currentFilters.value.regionNameList,
      azNameList: currentFilters.value.azNameList,
      resourceTypeList: currentFilters.value.resourceTypeList,
    };

    try {
      // TODO: 替换为真实接口
      const efficiencyRes = await mockFetchEfficiency(params);
      if (requestId !== fetchDataRequestId || selectedPool.value !== cloudServerName) {
        return;
      }
      const parsed = parseEfficiencyResponse(efficiencyRes);
      if (!parsed) {
        resetState();
        return;
      }

      const { list: efficiencyList } = parsed;

      // TODO: 替换为真实接口
      const operateRes = await mockFetchOperate(params);
      if (requestId !== fetchDataRequestId || selectedPool.value !== cloudServerName) {
        return;
      }
      const { forbidden: isForbidden, map: operateMap, avgRangeList: resAvgRangeList } = buildOperateMap(operateRes);
      forbidden.value = isForbidden;
      avgRangeList.value = resAvgRangeList;

      const mergedList = mergeEfficiencyWithOperate(efficiencyList, operateMap);
      rawData.value = { avgRangeList: resAvgRangeList, list: mergedList };
      data.value = toChartData(mergedList, SIZE_TIERS, "serverNum");
    } catch (e) {
      if (requestId !== fetchDataRequestId || selectedPool.value !== cloudServerName) {
        return;
      }
      error.value = e;
      resetState();
    } finally {
      if (requestId === fetchDataRequestId && selectedPool.value === cloudServerName) {
        loading.value = false;
      }
    }
  }

  return {
    data,
    avgRangeList,
    loading,
    error,
    forbidden,
    rawData,
    fetchData,
  };
}

export const testData1 = ref([
  {
    resourcePoolTotalName: '华北-北京四(AZ1)-kc1n',
    regionName: '华北-北京四',
    serverNum: 190,
    totalDiskSpace: 12000.50
  }
]);

export { tierFilter } from "./useBubbleTierFilter";
