import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCurrentDate as useCurrentStore } from '@/views/useCurrentDate';
import obsDetailResponse from '@/api/obsDetail.json';
import obsPageResponse from '@/api/obsPage.json';
import obsTrendResponse from '@/api/obsTrend.json';
import xpuDetailResponse from '@/api/xpuDetail.json';
import xpuPageResponse from '@/api/xpuPage.json';
import xpuTrendResponse from '@/api/xpuTrend.json';
import { useSaleFilterStore } from '../saleHome/useSaleFilter';
import {
    ecsBars,
    ecsGenerationMetrics,
    ecsMetrics,
    ecsTableRows,
    resourceTree,
} from './staticData';

// 延迟到响应式数据被消费时再获取 store，避免模块加载早于 app.use(pinia)。
const filterOtherValue = computed(() => useSaleFilterStore().filterOtherValue);
const filterValue = computed(() => useSaleFilterStore().filterValue);

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

// mock 数据会被页面侧赋值和加工，先深拷贝，避免一次请求污染下一次请求。
const cloneResponse = (response) => JSON.parse(JSON.stringify(response));

// 后端样例里部分字段大小写不统一，统一成页面和新入参使用的 regionId / azId。
const normalizeDimensionField = (item) => {
    const nextItem = {
        ...item,
    };

    if (Object.prototype.hasOwnProperty.call(nextItem, 'regionid')) {
        nextItem.regionId = nextItem.regionid;
        delete nextItem.regionid;
    }

    if (Object.prototype.hasOwnProperty.call(nextItem, 'azid')) {
        nextItem.azId = nextItem.azid;
        delete nextItem.azid;
    }

    return nextItem;
};

// 趋势接口主要服务关键信息卡片和图表，保持 data.trend 结构不变，只修字段名。
const normalizeTrendResponse = (response) => {
    const nextResponse = cloneResponse(response);
    nextResponse.data.trend =
        nextResponse.data.trend.map((item) => normalizeDimensionField(item));

    return nextResponse;
};

// detail 接口样例字段已经和页面约定一致，当前只深拷贝，不做字段改名。
const normalizeDetailResponse = (response) => cloneResponse(response);

// XPU 顶部四个待分配量直接来自 xpu/detail，尤其 A1 不再从表格汇总或趋势数据里反推。
const normalizeXpuDetailResponse = (response) => {
    const nextResponse = cloneResponse(response);
    const detail = nextResponse.data;

    nextResponse.data = {
        ...detail,
        totalUnallocatedXpu: detail.totalUnallocatedXpu,
        a3Unallocated: detail.a3Unallocated,
        a2Unallocated: detail.a2Unallocated,
        a1Unallocated: detail.a1Unallocated,
        totalUnallocatedXpuMom: detail.totalUnallocatedXpuMom,
        a3UnallocatedMom: detail.a3UnallocatedMom,
        a2UnallocatedMom: detail.a2UnallocatedMom,
        a1UnallocatedMom: detail.a1UnallocatedMom,
    };

    return nextResponse;
};

// 表格接口样例里的 pagelnfo 是后端返回拼写，这里统一成 pageInfo 给页面使用。
const normalizePageResponse = (response) => {
    const nextResponse = cloneResponse(response);
    nextResponse.data.pageInfo = nextResponse.data.pagelnfo;
    delete nextResponse.data.pagelnfo;
    nextResponse.data.pageInfo.records =
        nextResponse.data.pageInfo.records.map((item) => normalizeDimensionField(item));
    nextResponse.data.summaryVo = normalizeDimensionField(nextResponse.data.summaryVo);

    return nextResponse;
};

// 保留 Promise + 延迟，模拟真实接口的异步时序，方便后续替换成正式 request。
const mockRequest = (response, normalizeResponse) =>
    new Promise((resolve) => {
        window.setTimeout(() => {
            resolve(normalizeResponse(response));
        }, 200);
    });

// mock 函数先接收 _params，页面侧可以按真实接口形态传参，后面替换 request 时不用改调用方。
export const getSalesDetailByObsAPI = (_params) =>
    mockRequest(obsDetailResponse, normalizeDetailResponse);

export const getSalesTableByObsAPI = (_params) =>
    mockRequest(obsPageResponse, normalizePageResponse);

export const getSalesTrendByObsAPI = (_params) =>
    mockRequest(obsTrendResponse, normalizeTrendResponse);

export const getSalesDetailByXpuAPI = (_params) =>
    mockRequest(xpuDetailResponse, normalizeXpuDetailResponse);

export const getSalesTableByXpuAPI = (_params) =>
    mockRequest(xpuPageResponse, normalizePageResponse);

export const getSalesTrendByXpuAPI = (_params) =>
    mockRequest(xpuTrendResponse, normalizeTrendResponse);

const toRawWanValue = (value) => Number.parseFloat(value) * 10000;

// ECS 页面继续消费合并后的接口结构，Mock 数据仍统一在 composable 内转换。
const toEcsTrendList = (items) =>
    items.map((item) => ({
        regionName: item.name,
        totalSellableCapacity: toRawWanValue(item.value),
    }));

const toNamedResourceTree = (items) =>
    items.map((item) => {
        const nextItem = {
            name: item.label,
        };

        if (item.children) {
            nextItem.children = toNamedResourceTree(item.children);
        }

        return nextItem;
    });

const ecsDetailResponse = {
    status: 200,
    message: 'SUCCESS',
    messageEn: 'SUCCESS',
    data: {
        totalSellableCapacityItem: {
            value: ecsMetrics.reduce((total, item) => total + toRawWanValue(item.value), 0),
            compareValue: toRawWanValue(ecsMetrics[0].trend),
        },
        icalcItem: {
            itotalSellableCapacity: toRawWanValue(ecsMetrics[0].value),
            compareValue: toRawWanValue(ecsMetrics[0].trend),
            intelV5: toRawWanValue(ecsMetrics[0].specs[0].value),
            intelV6: toRawWanValue(ecsMetrics[0].specs[1].value),
            intelV7: toRawWanValue(ecsMetrics[0].specs[2].value),
            intelV9: toRawWanValue(ecsMetrics[0].specs[3].value),
            topCalcItems: toEcsTrendList(ecsBars[0].data),
        },
        acalcItem: {
            atotalSellableCapacity: toRawWanValue(ecsMetrics[1].value),
            compareValue: toRawWanValue(ecsMetrics[1].trend),
            axdv6: toRawWanValue(ecsMetrics[1].specs[0].value),
            axdv7: toRawWanValue(ecsMetrics[1].specs[1].value),
            axdv8: toRawWanValue(ecsMetrics[1].specs[2].value),
            axdv9: toRawWanValue(ecsMetrics[1].specs[3].value),
            topCalcItems: toEcsTrendList(ecsBars[1].data),
        },
        kcalcItem: {
            ktotalSellableCapacity: toRawWanValue(ecsMetrics[2].value),
            compareValue: toRawWanValue(ecsMetrics[2].trend),
            kunpengV1: toRawWanValue(ecsMetrics[2].specs[0].value),
            kunpengV2: toRawWanValue(ecsMetrics[2].specs[1].value),
            topCalcItems: toEcsTrendList(ecsBars[2].data),
        },
        operationV5PreviousItem: {
            value: toRawWanValue(ecsGenerationMetrics[0].value),
            compareValue: toRawWanValue(ecsGenerationMetrics[0].trend),
        },
        operationV6ToV8Item: {
            value: toRawWanValue(ecsGenerationMetrics[1].value),
            compareValue: toRawWanValue(ecsGenerationMetrics[1].trend),
        },
        operationV9Item: {
            value: toRawWanValue(ecsGenerationMetrics[2].value),
            compareValue: toRawWanValue(ecsGenerationMetrics[2].trend),
        },
        dirTreeList: toNamedResourceTree(resourceTree),
        operationGenerationList: ecsGenerationMetrics.map((item) => ({
            name: item.title,
        })),
    },
};

const ecsTableResponse = {
    status: 200,
    message: 'SUCCESS',
    messageEn: 'SUCCESS',
    data: {
        pageInfo: {
            totalNum: ecsTableRows.length,
            pageNo: 1,
            pageSize: 50,
            records: ecsTableRows,
        },
        summary: {
            sellableCapacity: ecsTableRows.reduce(
                (total, item) => total + Number(item.stock.replaceAll(',', '')),
                0
            ),
        },
    },
};

export const getSalesDetailByEcsAPI = (_params) =>
    mockRequest(ecsDetailResponse, cloneResponse);

export const getSalesTableByEcsAPI = (_params) =>
    mockRequest(ecsTableResponse, cloneResponse);

// XPU 行内趋势展开后写入这里，避免覆盖顶部详情数据。
export const xpuTrendData = ref([]);

export const tableDataSummary = ref({});
export const directoryTreeList = ref([]);
export const resourceTypeList = ref([]);
export const directoryTreeLoading = ref(false);
export const operationGenerationTreeList = ref([]);
export const operationGenerationCheckedList = ref([]);
export const kaiTypeList = ref([]);

export const showCollapse = ref(true); // ecs算力分布
export const isCollapsed = ref(true);
export const leftCardData = reactive({
  ecs: {},
  obs: {},
  xpu: {}
});

export const keyInfor = reactive({
    ecs: {},
    obs: {},
    xpu: {}
});

export const tableSummary = reactive({
    ecs: {},
    obs: {},
    xpu: {}
});

export const permissionCard = reactive({
    ecs: true,
    obs: true,
    xpu: true
});

export const permissionTable = reactive({
    ecs: true,
    obs: true,
    xpu: true
});

export const ecsTable = ref([]);

export const obsTable = ref([]);

export const xpuTable = ref([]);

export const pageNo = ref(1);

export const pageSize = ref(50);

export const pageInfo = ref({ total: 0 });

export const currentSort = ref({
    prop: "",
    order: ""
});

export const storageMode = ref([]);

export const rangeValue = ref('全部');

export const dimensionalEnum = ref("");

export const generationDirTreeList = computed(() => {
  return filterOtherValue.value.generationDirTreeList ?? [];
});

export const resourceTypeArr = computed(() => {
  return filterOtherValue.value.resourceType ?? [];
});

const areaList = computed(() => {
  return filterValue.value.areaName ?? [];
});

const regionList = computed(() => {
  return filterValue.value.regionName ?? [];
});

const xpuCardModelList = ['A3', 'A2'];

const cardTypeList = computed(() => {
  const selectedCardModelList = filterOtherValue.value.cardTypeList;
  if (!selectedCardModelList) {
    return [...xpuCardModelList];
  }

  // XPU 下钻只允许向后端传递当前支持的 A3、A2 卡型。
  return selectedCardModelList.filter((cardModel) => xpuCardModelList.includes(cardModel));
});

const dimensionalEnumMap = {
  全部: '',
  大区: 'area',
  Region: 'region',
  AZ: 'az',
};

const toArrayValue = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
};

// 行内趋势请求只提交当前范围粒度对应的维度字段。
export const buildDimensionParams = ({ areaName, regionId, azId }) => {
  const params = {
    dimensionalEnum: dimensionalEnumMap[rangeValue.value],
    areaName: [],
    regionId: [],
    azId: [],
  };

  if (rangeValue.value === '大区') {
    params.areaName = toArrayValue(areaName);
  }

  if (rangeValue.value === 'Region') {
    params.regionId = toArrayValue(regionId);
  }

  if (rangeValue.value === 'AZ') {
    params.azId = toArrayValue(azId);
  }

  return params;
};

const applyLevel = (arr = [], pItem = {}, plevel = 0, levelKeyMap = { 0: 'calcType', 1: 'family', 2: 'generation' }) => {
  const _levelKeyMap = levelKeyMap;
  return arr?.map((item) => {
    const key = _levelKeyMap[plevel] ?? plevel.toString();
    const obj = {
      ...pItem.obj,
      [key]: item.name
    };
    const objStr = JSON.stringify(obj);
    let newItem = {
      ...item,
      level: plevel,
      obj: obj,
      objStr: objStr
    };

    if (item.children && item.children.length > 0) {
      newItem.children = applyLevel(item.children, newItem, plevel + 1);
    }
    return newItem;
  });
}

const appendEcsOptional = (params) => {
  params.dirTreeList = resourceTypeList.value?.length ? resourceTypeList.value.map((v) => JSON.parse(v)) : [];
  params.operationGenerationList = operationGenerationCheckedList.value?.length ? operationGenerationCheckedList.value : [];
  params.kaiTypeList = kaiTypeList.value?.length ? kaiTypeList.value : [];
  return params;
};

// ECS
export const useResoureDetailByECS = (active) => {
    const currentStore = useCurrentStore();
    
    // 左侧卡片
    const loadCardData = () => {
      const params = {
        month: currentStore.saleMonth,
        date: currentStore.saleDate,
        areaName: areaList.value,
        regionId: [],
        regionName: regionList.value,
      };
      
      leftCardData.ecs = {};
      permissionCard.ecs = true;
      getSalesDetailByEcsAPI(params).then((res) => {
        if (res.status === 403) {
          permissionCard.ecs = false;
          return;
        }

        if (res.status === 200) {
          leftCardData.ecs = res.data ?? {};
        }
      });
    };

    const loadInfoData = debounce(() => {
        const params = {
          month: currentStore.saleMonth,
          date: currentStore.saleDate,
          areaName: areaList.value,
          regionId: [],
          regionName: regionList.value,
          vcpuTypeList: resourceTypeArr.value,
          generationDirTreeList: generationDirTreeList.value,
          calcTypeList: []
        };
      
        keyInfor.ecs = {};
        getSalesDetailByEcsAPI(params).then((res) => {
          if (res.status === 200) {
            directoryTreeList.value = applyLevel(res.data.dirTreeList);
            operationGenerationTreeList.value = applyLevel(res.data.operationGenerationList, {}, 0, { 0: 'operationGeneration', 1: 'kaiType' });
            keyInfor.ecs = res.data ?? {};
          }
        });
      }, 100);

      const loadTableData = debounce(() => {
        let params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            areaName: areaList.value,
            regionId: [],
            regionName: regionList.value,
            vcpuTypeList: resourceTypeArr.value,
            generationDirTreeList: generationDirTreeList.value,
            dirTreeList: [],
            operationGenerationList: [],
            kaiTypeList: [],
            pageNo: pageNo.value,
            pageSize: pageSize.value,
            sortField: currentSort.value.prop,
            order: currentSort.value.order === 'descending' ? 2 : 1,
            dimensionalEnum: dimensionalEnum.value
        };
        params = appendEcsOptional(params);
        ecsTable.value = [];
        tableSummary.ecs = {};
        permissionTable.ecs = true;
        getSalesTableByEcsAPI(params)
            .then((res) => {
                if (res.status === 403) {
                    permissionTable.ecs = false;
                    return;
                }
                if (res.status === 200 && res.data) {
                    ecsTable.value = res.data.pageInfo?.records ?? [];
                    pageInfo.value.total = res.data.pageInfo?.totalNum ?? 0;
                    tableSummary.ecs = res.data.summary ?? {};
                }
            })
            .catch(() => (pageInfo.value.total = 0));
    }, 100);

    watch(
        [() => currentStore.saleDate, regionList],
        () => {
            loadCardData();
        },
        { immediate: true }
    );
    
    watch(
        [() => currentStore.saleDate, filterValue, filterOtherValue, active],
        () => {
            if (active.value !== 'ECS') {
                return;
            }
            keyInfor.ecs = {};
            loadInfoData();
        },
        { immediate: true }
    );
    
    watch(
        [
            () => currentStore.saleDate,
            filterValue,
            filterOtherValue,
            active,
            pageNo,
            pageSize,
            currentSort,
            resourceTypeList,
            operationGenerationCheckedList,
            kaiTypeList,
            dimensionalEnum
        ],
        ([]) => {
            if (active.value !== 'ECS') {
                return;
            }
            ecsTable.value = [];
            loadTableData();
        },
        { immediate: true }
    );
};

// OBS
export const useResoureDetailByOBS = (active) => {
    const currentStore = useCurrentStore();
    const loadCardData = () => {
      const params = {
        month: currentStore.saleMonth,
        date: currentStore.saleDate,
        areaName: areaList.value,
        regionId: [],
        regionName: regionList.value,
      };
      leftCardData.obs = {};
      permissionCard.obs = true;
      getSalesDetailByObsAPI(params).then((res) => {
        if (res.status === 403) {
          permissionCard.obs = false;
          return;
        }
        if (res.status === 200) {
          leftCardData.obs = res.data ?? {};
        }
      });
    };
    
    const loadInfoData = debounce(() => {
      const params = {
        month: currentStore.saleMonth,
        date: currentStore.saleDate,
        areaName: areaList.value,
        regionId: [],
        regionName: regionList.value,
      };
      keyInfor.obs = {};
      getSalesDetailByObsAPI(params).then((res) => {
        if (res.status === 200) {
          keyInfor.obs = res.data ?? {};
        }
      });
    }, 100);

    const loadTableData = debounce(() => {
        const params = {
          month: currentStore.saleMonth,
          date: currentStore.saleDate,
          areaName: areaList.value,
          regionId: [],
          regionName: regionList.value,
          pageNo: pageNo.value,
          pageSize: pageSize.value,
          sortField: currentSort.value.prop,
          order: currentSort.value.order === 'descending' ? 2 : 1,
          storageMode: storageMode.value,
          dimensionalEnum: dimensionalEnum.value
        };
      
        obsTable.value = [];
        tableSummary.obs = {};
        permissionTable.obs = true;
      
        getSalesTableByObsAPI(params)
          .then((res) => {
            if (res.status === 403) {
              permissionTable.obs = false;
              return;
            }
            if (res.status === 200) {
              obsTable.value = res.data?.pageInfo?.records ?? [];
              pageInfo.value.total = res.data?.pageInfo?.totalNum ?? 0;
              tableSummary.obs = res.data?.summaryVo ?? {};
            }
          })
          .catch(() => (pageInfo.value.total = 0));
      }, 100);

      watch(
        [() => currentStore.saleDate, filterValue],
        ([]) => {
            loadCardData();
        },
        {
            immediate: true,
        }
    );
    watch(
        [() => currentStore.saleDate, filterValue, filterOtherValue, active],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            keyInfor.obs = {};
            loadInfoData();
        },
        {
            immediate: true,
        }
    );
    watch(
        [() => currentStore.saleDate, filterValue, filterOtherValue, dimensionalEnum, active, pageNo, pageSize, currentSort, storageMode],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            obsTable.value = [];
            loadTableData();
        },
        {
            immediate: true,
        }
    );
};

// XPU
export const useResoureDetailByXPU = (active) => {
    const currentStore = useCurrentStore();
    const loadCardData = () => {
      const params = {
        month: currentStore.saleMonth,
        date: currentStore.saleDate,
        areaName: areaList.value,
        regionId: [],
        regionName: regionList.value,
      };
      leftCardData.xpu = {};
      permissionCard.xpu = true;
      getSalesDetailByXpuAPI(params).then((res) => {
        if (res.status === 403) {
          permissionCard.xpu = false;
          return;
        }
        if (res.status === 200) {
          leftCardData.xpu = res.data ?? {};
        }
      });
    };
    
    const loadInfoData = debounce(() => {
      const params = {
        month: currentStore.saleMonth,
        date: currentStore.saleDate,
        areaName: areaList.value,
        regionId: [],
        regionName: regionList.value,
        cardModel: cardTypeList.value,
      };
      keyInfor.xpu = {};
      getSalesDetailByXpuAPI(params).then((res) => {
        if (res.status === 200) {
          keyInfor.xpu = res.data ?? {};
        }
      });
    }, 100);

    const loadTableData = debounce(() => {
        const params = {
          month: currentStore.saleMonth,
          date: currentStore.saleDate,
          areaName: areaList.value,
          regionId: [],
          regionName: regionList.value,
          cardModel: cardTypeList.value,
          pageNo: pageNo.value,
          pageSize: pageSize.value,
          sortField: currentSort.value.prop,
          order: currentSort.value.order === 'descending' ? 2 : 1,
          dimensionalEnum: dimensionalEnum.value
        };
      
        xpuTable.value = [];
        tableSummary.xpu = {};
        permissionTable.xpu = true;
      
        getSalesTableByXpuAPI(params)
          .then((res) => {
            if (res.status === 403) {
              permissionTable.xpu = false;
              return;
            }
            if (res.status === 200) {
              xpuTable.value = res.data?.pageInfo?.records ?? [];
              pageInfo.value.total = res.data?.pageInfo?.totalNum ?? 0;
              tableSummary.xpu = res.data?.summaryVo ?? {};
            }
          })
          .catch(() => (pageInfo.value.total = 0));
      }, 100);

      watch(
        [() => currentStore.saleDate, filterValue],
        ([]) => {
          loadCardData();
        },
        {
          immediate: true,
        }
      );
      
      watch(
        [() => currentStore.saleDate, filterValue, filterOtherValue, active],
        ([]) => {
          if (active.value !== 'XPU') {
            return;
          }
          keyInfor.xpu = {};
          loadInfoData();
        },
        {
          immediate: true,
        }
      );
      
      watch([() => currentStore.saleDate, filterValue, filterOtherValue, dimensionalEnum, active, pageNo, pageSize, currentSort], ([]) => {
        if (active.value !== 'XPU') {
          return;
        }
        xpuTable.value = [];
        loadTableData();
      }, {
        immediate: true,
      });
  };

