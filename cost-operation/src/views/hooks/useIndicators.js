import { useCurrentDate } from "../useCurrentDate";
import { ref, computed, reactive, watch } from 'vue';
import dayjs from "dayjs";
import { processingUnauthorizedData } from '@/utils';
import { useSetInterval } from './useSetInterval';
import {
  getCardCostAPI,
  getCardIndicatorAPI,
  getCardRecurringRevenueAPI,
  getTotalCostAPI,
  getTotalTurnoverAPI,
} from '@/api/infraMock';

const oneLevelCloudServerNames = new Set(["BMS", "DCC", "DSS"]);

export const homoIndicatiorsData = reactive({
  totalCost: {
    cost: '**',
    momValue: '**',
    trend: [],
  },
  total: {
    cost: '**',
    momValue: '**',
    trend: [],
  },
  service: {},
  assetOnlineRate: {},
  universal_harddisk_rate: {},
});

export const getAxisData = (monthNumber) => {
  const currentStore = useCurrentDate();
  let data = [...currentStore.monthsArray];
  switch (monthNumber) {
    case 6:
      data = [...currentStore.monthsArray];
      break;
    case 12:
      data = [...currentStore.monthsArray];
      break;
    default:
      break;
  }
  return data;
}

const useHomeIndicatiorsDataData = () => {
  const currentStore = useCurrentDate();
  const loadAllData = () => {
    getTotalTurnoverAPI({ month: currentStore.month, date: currentStore.date }).then((res) => {
      if (res.status === 403) {
        processingUnauthorizedData(homoIndicatiorsData.totalCost, '**');
        return;
      }
      if (!res.data) {
        processingUnauthorizedData(homoIndicatiorsData.totalCost, '--');
        return;
      }
    });
    getTotalCostAPI({ month: currentStore.month, date: currentStore.date }).then((res) => {
      if (res.status === 403) {
        processingUnauthorizedData(homoIndicatiorsData.total, '**');
        return;
      }
      if (!res.data) {
        processingUnauthorizedData(homoIndicatiorsData.total, '--');
        return;
      }
      homoIndicatiorsData.total = res.data;
    })
  };
  loadAllData();
  return {
    homoIndicatiorsData,
  }
};

export const homeCardData = reactive({
  cost: {
    commonComputing: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    intelligentComputing: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    externalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    internalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
  },
  eff: {
    commonComputing: {},
    intelligentComputing: {},
    externalCustomer: {},
    internalCustomer: {},
  },
  recurringRevenue: {
    commonComputing: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    intelligentComputing: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    externalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    internalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
  },
  operate: {
    commonComputing: {},
    intelligentComputing: {},
    externalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
    internalCustomer: {
      value: '**',
      mom: '**',
      compareValue: '**',
      trends: [],
    },
  },
  eFlops: {
    curValue: '**',
    compareLastMonval: '**',
  },
});

function createUnavailableCardValue() {
  return {
    value: '--',
    curValue: '--',
    mom: '--',
    compareValue: '--',
    compareLastMonval: '--',
    trends: [],
  };
}

function setHomeCardDataUnavailable() {
  [
    homeCardData.recurringRevenue.commonComputing,
    homeCardData.recurringRevenue.intelligentComputing,
    homeCardData.recurringRevenue.externalCustomer,
    homeCardData.recurringRevenue.internalCustomer,
    homeCardData.cost.commonComputing,
    homeCardData.cost.intelligentComputing,
    homeCardData.cost.externalCustomer,
    homeCardData.cost.internalCustomer,
  ].forEach((item) => {
    processingUnauthorizedData(item, '--');
  });

  homeCardData.eff.commonComputing = createUnavailableCardValue();
  homeCardData.eff.intelligentComputing = createUnavailableCardValue();
  homeCardData.eff.externalCustomer = createUnavailableCardValue();
  homeCardData.eff.internalCustomer = createUnavailableCardValue();
  homeCardData.operate.commonComputing = createUnavailableCardValue();
  homeCardData.operate.intelligentComputing = createUnavailableCardValue();
  homeCardData.operate.externalCustomer = createUnavailableCardValue();
  homeCardData.operate.internalCustomer = createUnavailableCardValue();
  homeCardData.eFlops = createUnavailableCardValue();
}

function hasUndevelopedCloudServerFilter(filters = {}) {
  if (oneLevelCloudServerNames.has(filters.cloudServerName)) {
    return true;
  }
  if (!Array.isArray(filters.resourceTypeList)) {
    return false;
  }
  return filters.resourceTypeList.some((item) => {
    return oneLevelCloudServerNames.has(item?.cloudServerName) && !item?.resourceType;
  });
}

function normalizeFilterParams(filters = {}) {
  const toList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return value.split(",").filter(Boolean);
    return [];
  };
  const normalizeLeftResourceTypeList = (value) => {
    if (!Array.isArray(value)) return [];
    // 左侧卡片接口单选 BMS/DCC/DSS 时只用 cloudServerName 表达云服务，resourceTypeList 传空数组。
    if (value.length !== 1) return value;
    const [item] = value;
    if (oneLevelCloudServerNames.has(item?.cloudServerName) && !item?.resourceType) {
      return [];
    }
    return value;
  };
  return {
    regionNameList: toList(filters.regionNameList),
    azNameList: toList(filters.azNameList),
    resourceTypeList: normalizeLeftResourceTypeList(filters.leftResourceTypeList ?? filters.resourceTypeList),
    cloudServerName: typeof filters.cloudServerName === "string" ? filters.cloudServerName : "",
  };
}

function buildCommonComputeParams(currentStore, filters = {}) {
  const normalizedFilters = normalizeFilterParams(filters);
  return {
    cloudServerName: normalizedFilters.cloudServerName,
    month: dayjs(currentStore.date).format("YYYYMM"),
    date: currentStore.date,
    regionNameList: normalizedFilters.regionNameList,
    azNameList: normalizedFilters.azNameList,
    resourceTypeList: normalizedFilters.resourceTypeList,
  };
}

export const fetchHomeCardData = (filters = {}) => {
  const currentStore = useCurrentDate();
  // BMS/DCC/DSS 的卡片数据后端还未开发；命中这些筛选时不请求接口，页面展示 --。
  if (hasUndevelopedCloudServerFilter(filters)) {
    setHomeCardDataUnavailable();
    return;
  }
  const params = buildCommonComputeParams(currentStore, filters);
  getCardRecurringRevenueAPI(params).then(
    (res) => {
      if (res.status === 403) {
        processingUnauthorizedData(homeCardData.recurringRevenue.commonComputing, '**');
        processingUnauthorizedData(homeCardData.recurringRevenue.intelligentComputing, '**');
        processingUnauthorizedData(homeCardData.recurringRevenue.externalCustomer, '**');
        processingUnauthorizedData(homeCardData.recurringRevenue.internalCustomer, '**');
        return;
      }
      if (!res.data) {
        processingUnauthorizedData(homeCardData.recurringRevenue.commonComputing, '--');
        processingUnauthorizedData(homeCardData.recurringRevenue.intelligentComputing, '--');
        processingUnauthorizedData(homeCardData.recurringRevenue.externalCustomer, '--');
        processingUnauthorizedData(homeCardData.recurringRevenue.internalCustomer, '--');
        return;
      }
      homeCardData.recurringRevenue.commonComputing = res.data.commonComputing?.[0];
      homeCardData.recurringRevenue.intelligentComputing = res.data.intelligentComputing?.[0];
      homeCardData.recurringRevenue.externalCustomer = res.data.externalCustomer?.[0];
      homeCardData.recurringRevenue.internalCustomer = res.data.internalCustomer?.[0];
    }
  );
  getCardCostAPI(params).then((res) => {
    if (res.status === 403) {
      processingUnauthorizedData(homeCardData.cost.commonComputing, '**');
      processingUnauthorizedData(homeCardData.cost.intelligentComputing, '**');
      processingUnauthorizedData(homeCardData.cost.externalCustomer, '**');
      processingUnauthorizedData(homeCardData.cost.internalCustomer, '**');
      return;
    }
    if (!res.data) {
      processingUnauthorizedData(homeCardData.cost.commonComputing, '--');
      processingUnauthorizedData(homeCardData.cost.intelligentComputing, '--');
      processingUnauthorizedData(homeCardData.cost.externalCustomer, '--');
      processingUnauthorizedData(homeCardData.cost.internalCustomer, '--');
      return;
    }
    homeCardData.cost.commonComputing = res.data.commonComputing?.[0];
    homeCardData.cost.intelligentComputing = res.data.intelligentComputing?.[0];
    homeCardData.cost.externalCustomer = res.data.externalCustomer?.[0];
    homeCardData.cost.internalCustomer = res.data.internalCustomer?.[0];
  });
  getCardIndicatorAPI(params).then((res) => {
    if (!res.data.indicator) {
      return;
    }
    const {
      asset_gyy_servers_num_trends_app,
      general_computing_server_num_all,
      dfa_card_num_all,
      ecs_out_customer_allocate_num,
      ecs_in_customer_allocate_num,
      pool_total_asset_online_rate,
      universal_harddisk_rate,
      pool_cpu_use_rate_all,
      pool_npu_use_rate_all,
      ascend_card_count_inner,
      ascend_card_count_outer,
      hashrate_all_total,
    } = res.data.indicator ?? {};
    homoIndicatiorsData.service = asset_gyy_servers_num_trends_app ?? {};
    homoIndicatiorsData.assetOnlineRate = pool_total_asset_online_rate ?? {};
    homoIndicatiorsData.universal_harddisk_rate = universal_harddisk_rate ?? {};
    
    homeCardData.eff.commonComputing = general_computing_server_num_all ?? {};
    homeCardData.eff.intelligentComputing = dfa_card_num_all ?? {};
    homeCardData.eff.externalCustomer = ecs_out_customer_allocate_num ?? {};
    homeCardData.eff.internalCustomer = ecs_in_customer_allocate_num ?? {};
    homeCardData.operate.commonComputing = pool_cpu_use_rate_all ?? {};
    homeCardData.operate.intelligentComputing = pool_npu_use_rate_all ?? {};

    homeCardData.operate.externalCustomer = ascend_card_count_outer ?? {};
    homeCardData.operate.internalCustomer = ascend_card_count_inner ?? {};

    homeCardData.eFlops = hashrate_all_total ?? {};
  });
}

export const useHomeCardData = () => {
  const loadAllData = () => {
    fetchHomeCardData();
  };
  loadAllData();
}

export const fetchHomeData = () => {
  const currentStore = useCurrentDate();
  useHomeIndicatiorsDataData();
  useHomeCardData();

  watch(
    () => currentStore.date,
    () => {
      useHomeIndicatiorsDataData();
      useHomeCardData();
    }
  );
  useSetInterval(() => {
    useHomeIndicatiorsDataData();
    useHomeCardData();
  });

};
