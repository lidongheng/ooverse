import { computed, reactive, ref, watch } from 'vue';
import { useCurrentDate } from '@/views/useCurrentDate';
import obsDetailResponse from '@/api/obsDetail.json';
import obsPageResponse from '@/api/obsPage.json';
import obsTrendResponse from '@/api/obsTrend.json';
import xpuDetailResponse from '@/api/xpuDetail.json';
import xpuPageResponse from '@/api/xpuPage.json';
import xpuTrendResponse from '@/api/xpuTrend.json';

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

// XPU 行内趋势图点击后再写入这里，避免页面初始就展示未按行筛选的趋势数据。
export const xpuTrendData = ref([]);

// 下方这些状态被 saleDetail 多个组件共享：信息卡、图表、表格都从这里取数。
export const tableDataSummary = ref({});
export const directoryTreeList = ref([]);
export const resourceTypeList = ref([]);
export const directoryTreeLoading = ref(false);
// 顶部公共筛选值，主要包含大区和 Region。
export const filterValue = ref({});
// 资源类型自己的筛选值，XPU 卡类型、OBS 存储类型等放这里。
export const filterOtherValue = ref({});
export const leftCardData = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});
export const keyInfor = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});
export const tableSummary = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});

export const permissionCard = reactive({

    ecs: true,

    obs: true,

    xpu: true,

});

export const permissionTable = reactive({

    ecs: true,

    obs: true,

    xpu: true,

});

export const ecsTable = ref([]);
export const obsTable = ref([]);

export const xpuTable = ref([]);

export const pageNo = ref(1);

export const pageSize = ref(50);

export const pageInfo = ref({ total: 0 });
export const currentSort = ref({
    prop: '',
    order: '',
});

export const storageMode = ref([]);
// OBS/XPU 资源详情的范围粒度由表格按钮控制，同时会参与 detail / page / trend 请求参数。
export const rangeValue = ref('全部');

// ECS 目录树会把代次、族、类型逐级写进 obj，表格请求可以直接拿 obj 作为筛选条件。
export const
    generationDirTreeList =
        computed(() =>
            filterOtherValue.value.generationDirTreeList ?? []); // 资源代次
export const resourceTypeArr =
    computed(() =>
        filterOtherValue.value.resourceType ?? []); // 资源规格
const areaList = computed(() => filterValue.value.areaName ?? []); // 大区
const regionList = computed(() => filterValue.value.regionName ?? []); // region
const azIdList = computed(() => filterValue.value.azId ?? []); // AZ
const cardTypeList = computed(() =>
    filterOtherValue.value.cardTypeList ?? []); // 卡类型

const dimensionalEnumMap = {
    全部: '',
    大区: 'area',
    Region: 'region',
    AZ: 'az',
};

// 筛选组件和表格行传进来的值可能是数组或单值，统一成接口要求的数组结构。
const toArrayValue = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === undefined ||
        value === null ||
        value === '') {
        return [];
    }

    return [value];
};

export const buildDimensionParams = ({
    areaName,
    regionId,
    azId,
}) => {
    const params = {
        dimensionalEnum: dimensionalEnumMap[rangeValue.value],
        areaName: [],
        regionId: [],
        azId: [],
    };

    // dimensionalEnum 控制后端聚合粒度；下面三个数组必须互斥，只允许当前粒度对应字段有值。
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

// 页面公共筛选用于 detail/page 请求；行内趋势图会用当前行数据单独调用 buildDimensionParams。
const buildCurrentDimensionParams = () =>
    buildDimensionParams({
        areaName: areaList.value,
        regionId: regionList.value,
        azId: azIdList.value,
    });

// 目录树递归时记录层级和路径对象，后面展开/选中节点时可以还原完整筛选条件。
const applyLevel = (arr = [],
    pitem = {}, plevel = 0) => {
    const levelKeyMap = {
        0: 'calcType',
        1: 'family',
        2: 'generation',
    };
    return arr?.map((item) => {
        const key =
            levelKeyMap[plevel] ??
            plevel.toString();
        const obj = {
            ...pitem.obj,
            [key]: item.name,
        };
        const objStr = JSON.stringify(obj);
        let newltem = {
            ...item,
            level: plevel,
            obj: obj,
            objStr: objStr,
        };

        if (item.children &&
            item.children.length > 0) {
            newltem.children =

                applyLevel(item.children, newltem, plevel + 1);
        }
        return newltem;
    });
};

// OBS
export const useResoureDetailByOBS = (active) => {
    const currentStore = useCurrentDate();
    // 左侧资源卡片不依赖 active，日期或区域变化就刷新。
    const loadCardData = () => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            ...buildCurrentDimensionParams(),
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
    // 顶部关键信息和图表只在 OBS 页面激活时刷新，避免其它资源页重复请求。
    const loadInfoData = debounce(() => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            ...buildCurrentDimensionParams(),
        };
        keyInfor.obs = {};

        getSalesDetailByObsAPI(params).then((res) => {
            if (res.status === 200) {
                keyInfor.obs = res.data ??
                    {};
            }
        });
    }, 100);
    // 资源详情表格受分页、排序、存储类型影响，刷新前先清掉旧数据和权限状态。
    const loadTableData =
        debounce(() => {
            const params = {
                month:
                    currentStore.saleMonth,
                date: currentStore.saleDate,
                ...buildCurrentDimensionParams(),
                pageNo: pageNo.value,
                pageSize: pageSize.value,
                sortField:
                    currentSort.value.prop,
                order:
                    currentSort.value.order ===
                        'descending' ? 2 : 1,
                storageMode:
                    storageMode.value,
            };
            obsTable.value = [];
            tableSummary.obs = {};
            permissionTable.obs = true;

            getSalesTableByObsAPI(params
            )
                .then((res) => {
                    if (res.status === 403) {
                        permissionTable.obs =
                            false;
                        return;
                    }
                    if (res.status === 200) {
                        obsTable.value =
                            res.data?.pageInfo?.records ??
                            [];
                        pageInfo.value.total =
                            res.data?.pageInfo?.totalNum ??
                            0;

                        tableSummary.obs =
                            res.data?.summaryVo ?? {};
                    }
                })
                .catch(() =>
                    (pageInfo.value.total = 0));
        }, 100);

    watch(
        [() => currentStore.saleDate,
            filterValue, rangeValue],
        ([]) => {
            // 左侧卡片也要响应范围粒度，否则切换“全部/大区/Region/AZ”后卡片会停留旧口径。
            loadCardData();
        },
        {
            immediate: true,
        }
    );
    // filterOtherValue 会影响 OBS 的统计信息，放在这里统一触发关键信息刷新。
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            rangeValue, active],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            // OBS detail 同时驱动指标卡和 Region Top10，粒度变化时需要重新取 detail mock。
            loadInfoData();
        },
        {
            immediate: true,
        }
    );
    // 表格 watch 比信息区多了分页、排序、storageMode，因为这些只影响表格。
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            rangeValue, active, pageNo, pageSize,
            currentSort, storageMode],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            // OBS 表格请求参数也带 dimensionalEnum，和上方 detail 的粒度口径保持一致。
            loadTableData();
        }
    );
};

// XPU
export const useResoureDetailByXPU = (active) => {
    const currentStore = useCurrentDate();
    // XPU 左侧资源卡片同样不依赖当前 tab，只跟公共筛选和日期走。
    const loadCardData = () => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            ...buildCurrentDimensionParams(),
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
    // XPU 关键信息会受到卡类型筛选影响，所以请求参数里带 cardModel。
    const loadInfoData = debounce(() => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            ...buildCurrentDimensionParams(),
            cardModel: cardTypeList.value,
        };
        keyInfor.xpu = {};
        getSalesDetailByXpuAPI(params).then((res) => {
            if (res.status === 200) {
                keyInfor.xpu = res.data ?? {};
            }
        });
    }, 100);
    // XPU 表格和趋势入口共用 pageInfo，切换到 XPU 时会覆盖 OBS 的表格分页总数。
    const loadTableData = debounce(() => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            ...buildCurrentDimensionParams(),
            cardModel: cardTypeList.value,
            pageNo: pageNo.value,
            pageSize: pageSize.value,
            sortField: currentSort.value.prop,
            order:
                currentSort.value.order ===
                    'descending' ? 2 : 1,
        };
        xpuTable.value = [];
        tableSummary.xpu = {};
        permissionTable.xpu = true;

        getSalesTableByXpuAPI(params)
            .then((res) => {
                if (res.status === 403) {
                    permissionTable.xpu =
                        false;
                    return;
                }
                if (res.status === 200) {
                    xpuTable.value =
                        res.data?.pageInfo?.records ?? [];
                    pageInfo.value.total =
                        res.data?.pageInfo?.totalNum ?? 0;
                    tableSummary.xpu = res.data?.summaryVo ?? {};
                }
            })
            .catch(() =>
                (pageInfo.value.total = 0));
    }, 100);

    watch(
        [() => currentStore.saleDate,
            filterValue, rangeValue],
        ([]) => {
            // XPU 左侧卡片同样按当前粒度展示，避免和右侧详情口径不一致。
            loadCardData();
        },
        {
            immediate: true,
        }
    );
    // 卡类型筛选写在 filterOtherValue，XPU 顶部信息卡和图表都通过它联动。
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            rangeValue, active],
        ([]) => {
            if (active.value !== 'XPU') {
                return;
            }
            // XPU detail 返回总量/A3/A2/A1 四个指标，粒度和卡类型变化时都需要刷新。
            loadInfoData();
        },
        {
            immediate: true,
        }
    );
    // XPU 表格暂时没有 storageMode，但保留分页和排序监听。
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            rangeValue, active, pageNo, pageSize,
            currentSort],
        ([]) => {
            if (active.value !== 'XPU') {
                return;
            }
            // 表格数据和行内趋势入口共用这套筛选口径，先刷新表格再由行点击取 trend。
            loadTableData();
        }
    );
};
