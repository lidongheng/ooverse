import { computed, ref, watch } from "vue";
import {
  azNameList,
  cloudServerResourceTreeList,
  directoryTreeList,
  regionNameList,
} from "./useDirectoryTree";
import {
  clearBubbleTierFilter,
  setBubbleTierFilter,
  tierFilter,
} from "./useBubbleTierFilter";
import { selectedPool } from "./ResourcesLifecycle";

export { tierFilter };

export const filterValue = ref(null);
// null 表示后端筛选参数尚未就绪。
// 通算页进入时，目录树接口会先返回云服务/Region/AZ/资源类型选项，
// 随后这里才能生成“默认全选”的后端参数。
// 如果初始值直接用空数组对象，气泡图和左侧卡片会先用空条件请求一次，
// 等选项加载完成后再用全选条件请求一次，造成首屏重复请求。
export const backendFilters = ref(null);
export const filterConfig = ref([]);
export const filterResetKey = ref(0);
export const visibleTiers = ref([]);
const hasUserChangedFilter = ref(false);
const emptyResourceTypeCloudServerNames = new Set(["BMS", "DCC", "DSS"]);

function getFilterConfigByKey(key) {
  return filterConfig.value.find((filter) => filter.key === key);
}

function getRangeColumns() {
  return getFilterConfigByKey("range")?.columns ?? [];
}

const resolvedFilterConfig = computed(() => ({
  region: {
    visible: true,
    searchable: true,
    ...(getRangeColumns()[0] ?? {}),
  },
  az: {
    visible: true,
    searchable: false,
    ...(getRangeColumns()[1] ?? {}),
  },
  resourceType: {
    visible: true,
    variant: "tree",
    submitMode: "tree",
    confirmable: true,
    ...(getFilterConfigByKey("resourceType") ?? {}),
  },
}));

const showRegionFilter = computed(() => resolvedFilterConfig.value.region.visible);
const showAzFilter = computed(() => resolvedFilterConfig.value.az.visible);
const showResourceTypeFilter = computed(() => resolvedFilterConfig.value.resourceType.visible);
const isResourceTypeOnlySubmit = computed(
  () => resolvedFilterConfig.value.resourceType.submitMode === "resourceTypeOnly"
);

function createSubmitOption(key, rawValue) {
  const value = String(rawValue);
  const obj = { [key]: value };
  const objStr = JSON.stringify(obj);
  return {
    label: value,
    value: objStr,
    name: value,
    obj,
    objStr,
  };
}

export const resourceTree = computed(() => directoryTreeList.value);

export const filterOptions = computed(() => ({
  regionNameList: regionNameList.value.map((name) => createSubmitOption("regionName", name)),
  azNameList: azNameList.value.map((name) => createSubmitOption("azName", name)),
  resourceTree: cloudServerResourceTreeList.value,
}));

function isFilterOptionsReady(options) {
  // resourceTree 来自目录树接口的一次性返回，是构造资源粒度默认全选项的基础。
  // 等它有值后再生成 backendFilters，避免消费者拿到空筛选条件提前请求。
  return (options.resourceTree ?? []).length > 0;
}

function createEmptyBackendFilters() {
  return {
    cloudServerName: "",
    regionNameList: [],
    azNameList: [],
    resourceTypeList: [],
    leftResourceTypeList: [],
  };
}

function walkTree(tree, visitor) {
  (tree ?? []).forEach((item) => {
    visitor(item);
    if ((item.children ?? []).length > 0) {
      walkTree(item.children, visitor);
    }
  });
}

function parseOptionObj(item) {
  if (item?.obj) return item.obj;
  if (!item?.objStr) return null;
  try {
    return JSON.parse(item.objStr);
  } catch {
    return null;
  }
}

function getNodeSubmitValue(item, key) {
  if (item?.[key]) return item[key];
  const obj = parseOptionObj(item);
  if (obj?.[key]) return obj[key];
  return "";
}

function collectSubmitOptions(tree, key) {
  const optionMap = new Map();
  walkTree(tree, (item) => {
    const submitValue = getNodeSubmitValue(item, key);
    if (submitValue && !optionMap.has(submitValue)) {
      optionMap.set(submitValue, createSubmitOption(key, submitValue));
    }
  });
  return Array.from(optionMap.values());
}

function isResourceTypeItem(item) {
  return Boolean(parseOptionObj(item)?.resourceType);
}

function flattenResourceSeries(tree) {
  return (tree ?? [])
    .flatMap((cloudServer) => cloudServer.children ?? [])
    .filter((item) => !isResourceTypeItem(item));
}

function flattenDirectResourceTypes(tree) {
  return (tree ?? [])
    .flatMap((cloudServer) => cloudServer.children ?? [])
    .filter(isResourceTypeItem);
}

function flattenResourceTypeOnlyCloudServers(tree) {
  return (tree ?? []).filter((cloudServer) => {
    return (cloudServer.children ?? []).some(isResourceTypeItem);
  });
}

function flattenResourceFamilies(tree) {
  return flattenResourceSeries(tree).flatMap((series) => series.children ?? []);
}

function flattenResourceGenerations(tree) {
  return flattenResourceFamilies(tree).flatMap((family) => family.children ?? []);
}

function isOneLevelResourceTree(tree) {
  return (tree ?? []).length > 0 && (tree ?? []).every((item) => !(item.children ?? []).length);
}

function flattenResourceTypes(tree) {
  return [
    ...flattenDirectResourceTypes(tree),
    ...flattenResourceGenerations(tree).flatMap((generation) => generation.children ?? []),
  ];
}

function getFilterOptionValue(item) {
  return item?.objStr ?? item?.value ?? item?.name ?? item?.label ?? "";
}

function createDefaultFilterValue(options) {
  const tree = options.resourceTree ?? [];
  const cloudServerOptions = isResourceTypeOnlySubmit.value ? flattenResourceTypeOnlyCloudServers(tree) : tree;
  const resourceTypeOptions = isResourceTypeOnlySubmit.value ? flattenDirectResourceTypes(tree) : flattenResourceTypes(tree);
  return {
    regionNameList: showRegionFilter.value ? (options.regionNameList ?? []).map(getFilterOptionValue) : [],
    azNameList: showAzFilter.value ? (options.azNameList ?? []).map(getFilterOptionValue) : [],
    cloudServerType: showResourceTypeFilter.value ? cloudServerOptions.map(getFilterOptionValue) : [],
    resourceSeries: showResourceTypeFilter.value && !isResourceTypeOnlySubmit.value ? flattenResourceSeries(tree).map(getFilterOptionValue) : [],
    resourceFamily: showResourceTypeFilter.value && !isResourceTypeOnlySubmit.value ? flattenResourceFamilies(tree).map(getFilterOptionValue) : [],
    resourceVer: showResourceTypeFilter.value && !isResourceTypeOnlySubmit.value ? flattenResourceGenerations(tree).map(getFilterOptionValue) : [],
    resourceType: showResourceTypeFilter.value ? resourceTypeOptions.map(getFilterOptionValue) : [],
  };
}

function keepValidValues(values, optionItems) {
  if (!Array.isArray(values)) return [];
  const validValues = new Set(optionItems.map(getFilterOptionValue));
  return values.filter((item) => validValues.has(item));
}

function reconcileFilterValue(value, options) {
  if (!value) return createDefaultFilterValue(options);
  const tree = options.resourceTree ?? [];
  const cloudServerOptions = isResourceTypeOnlySubmit.value ? flattenResourceTypeOnlyCloudServers(tree) : tree;
  const resourceTypeOptions = isResourceTypeOnlySubmit.value ? flattenDirectResourceTypes(tree) : flattenResourceTypes(tree);
  return {
    regionNameList: keepValidValues(value.regionNameList, options.regionNameList ?? []),
    azNameList: keepValidValues(value.azNameList, options.azNameList ?? []),
    cloudServerType: keepValidValues(value.cloudServerType, cloudServerOptions),
    resourceSeries: isResourceTypeOnlySubmit.value ? [] : keepValidValues(value.resourceSeries, flattenResourceSeries(tree)),
    resourceFamily: isResourceTypeOnlySubmit.value ? [] : keepValidValues(value.resourceFamily, flattenResourceFamilies(tree)),
    resourceVer: isResourceTypeOnlySubmit.value ? [] : keepValidValues(value.resourceVer, flattenResourceGenerations(tree)),
    resourceType: keepValidValues(value.resourceType, resourceTypeOptions),
  };
}

function getResourceTreeSignature(tree) {
  return [
    ...(tree ?? []).map(getFilterOptionValue),
    ...flattenResourceTypes(tree).map(getFilterOptionValue),
  ].join("|");
}

function fillNewFilterGroups(value, options, oldOptions) {
  const nextValue = { ...(value ?? {}) };
  const defaultValue = createDefaultFilterValue(options);
  if (
    showRegionFilter.value
    && (oldOptions.regionNameList ?? []).length === 0
    && (options.regionNameList ?? []).length > 0
  ) {
    nextValue.regionNameList = defaultValue.regionNameList;
  }
  if (
    showAzFilter.value
    && (oldOptions.azNameList ?? []).length === 0
    && (options.azNameList ?? []).length > 0
  ) {
    nextValue.azNameList = defaultValue.azNameList;
  }
  const resourceTreeChanged =
    getResourceTreeSignature(oldOptions.resourceTree ?? []) !== getResourceTreeSignature(options.resourceTree ?? []);
  if (showResourceTypeFilter.value && resourceTreeChanged) {
    nextValue.cloudServerType = defaultValue.cloudServerType;
    nextValue.resourceSeries = defaultValue.resourceSeries;
    nextValue.resourceFamily = defaultValue.resourceFamily;
    nextValue.resourceVer = defaultValue.resourceVer;
    nextValue.resourceType = defaultValue.resourceType;
  }
  return nextValue;
}

function fillDefaultResourceFilterGroups(value, options) {
  const defaultValue = createDefaultFilterValue(options);
  return {
    ...(value ?? {}),
    cloudServerType: defaultValue.cloudServerType,
    resourceSeries: defaultValue.resourceSeries,
    resourceFamily: defaultValue.resourceFamily,
    resourceVer: defaultValue.resourceVer,
    resourceType: defaultValue.resourceType,
  };
}

function getSubmitValue(item, keys) {
  const obj = parseOptionObj(item);
  for (const key of keys) {
    if (obj?.[key]) return obj[key];
  }
  return "";
}

function mapSelectedSubmitValues(selectedValues, optionItems, keys) {
  const selectedSet = new Set(selectedValues ?? []);
  return optionItems
    .filter((item) => selectedSet.has(getFilterOptionValue(item)))
    .map((item) => getSubmitValue(item, keys))
    .filter(Boolean);
}

function isNoneOrAllSelected(selectedValues, optionItems) {
  const selectedLength = selectedValues?.length ?? 0;
  const optionLength = optionItems?.length ?? 0;
  return selectedLength === 0 || selectedLength === optionLength;
}

function isSameSelection(selectedValues, optionItems) {
  const selectedLength = selectedValues?.length ?? 0;
  const optionLength = optionItems?.length ?? 0;
  if (selectedLength !== optionLength) return false;
  if (optionLength === 0) return false;
  const optionValueSet = new Set(optionItems.map(getFilterOptionValue));
  return (selectedValues ?? []).every((item) => optionValueSet.has(item));
}

function buildPartialSubmitValues(selectedValues, optionItems, keys) {
  // 后端约定：全不选和全选都表示“不按该维度过滤”，统一提交空数组。
  // 只有部分选择时，才把 UI 选中的项转换成后端需要的字段值。
  if (isNoneOrAllSelected(selectedValues, optionItems)) {
    return [];
  }
  return mapSelectedSubmitValues(selectedValues, optionItems, keys);
}

function flattenResourceTypesWithSeries(tree) {
  return (tree ?? []).flatMap((cloudServer) => {
    const children = cloudServer.children ?? [];
    const directTypes = children
      .filter(isResourceTypeItem)
      .map((item) => ({
        item,
        resourceSeries: "",
      }));
    const nestedTypes = children
      .filter((item) => !isResourceTypeItem(item))
      .flatMap((series) => {
        const resourceSeries = getSubmitValue(series, ["resourceSeries", "level0"]);
        return (series.children ?? []).flatMap((family) =>
          (family.children ?? []).flatMap((generation) =>
            (generation.children ?? []).map((type) => ({
              item: type,
              resourceSeries,
            }))
          )
        );
      });
    return [...directTypes, ...nestedTypes];
  });
}

function buildResourceTypeList(selectedValues, tree, submitMode) {
  const selectedSet = new Set(selectedValues ?? []);
  const oneLevelTree = isOneLevelResourceTree(tree);
  return flattenResourceTypesWithSeries(tree)
    .filter(({ item }) => selectedSet.has(getFilterOptionValue(item)))
    .map(({ item, resourceSeries }) => {
      const obj = parseOptionObj(item);
      if (submitMode === "resourceTypeOnly" || oneLevelTree || !resourceSeries) {
        return {
          cloudServerName: obj?.cloudServerName,
          resourceType: obj?.resourceType,
        };
      }
      return {
        cloudServerName: obj?.cloudServerName,
        resourceSeries,
        resourceFamily: obj?.resourceFamily,
        resourceVer: obj?.resourceVer,
        resourceType: obj?.resourceType,
      };
    })
    .filter((item) => item.resourceType);
}

function getCloudServerName(item) {
  return parseOptionObj(item)?.cloudServerName ?? "";
}

function findCurrentPoolCloudServer(tree) {
  return (tree ?? []).find((item) => getCloudServerName(item) === selectedPool.value);
}

function isOnlyCurrentPoolSelected(value, tree) {
  const currentPoolCloudServer = findCurrentPoolCloudServer(tree);
  if (!currentPoolCloudServer) return false;
  const selectedCloudServerValues = value.cloudServerType ?? [];
  if (selectedCloudServerValues.length !== 1) return false;
  return selectedCloudServerValues[0] === getFilterOptionValue(currentPoolCloudServer);
}

function isCurrentPoolResourceFullySelected(value, tree) {
  const currentPoolCloudServer = findCurrentPoolCloudServer(tree);
  if (!currentPoolCloudServer) return false;
  const currentPoolResourceTypes = isResourceTypeOnlySubmit.value
    ? flattenDirectResourceTypes([currentPoolCloudServer])
    : flattenResourceTypes([currentPoolCloudServer]);
  return isSameSelection(value.resourceType, currentPoolResourceTypes);
}

function shouldSubmitEmptyResourceTypeList(value, tree, resourceTypeOptions) {
  // 资源类型全不选表示不按资源过滤；但资源类型全选不一定等于资源粒度全选，
  // 因为 BMS/DCC/DSS 是单层云服务，需要同时判断云服务列是否也全选。
  if ((value.resourceType?.length ?? 0) === 0) {
    return true;
  }

  if (isResourceGranularityAllSelected(value, tree, resourceTypeOptions)) {
    return true;
  }

  // 左侧已经选中了具体 selectedPool；此时资源粒度只勾选该云服务及其全部子项，
  // 和“不按资源粒度继续收窄”含义一致，需要给后端传空数组。
  return isOnlyCurrentPoolSelected(value, tree) && isCurrentPoolResourceFullySelected(value, tree);
}

function getCloudServerOptions(tree) {
  if (isResourceTypeOnlySubmit.value) {
    return flattenResourceTypeOnlyCloudServers(tree);
  }
  return tree ?? [];
}

function isResourceGranularityAllSelected(value, tree, resourceTypeOptions) {
  const cloudServerOptions = getCloudServerOptions(tree);
  return isSameSelection(value.cloudServerType, cloudServerOptions)
    && isSameSelection(value.resourceType, resourceTypeOptions);
}

function isFilterGroupAllSelected(value, optionItems) {
  if ((optionItems ?? []).length === 0) {
    return true;
  }
  return isSameSelection(value, optionItems);
}

function isRangeGranularityAllSelected(value, options) {
  const regionAllSelected = !showRegionFilter.value
    || isFilterGroupAllSelected(value.regionNameList, options.regionNameList ?? []);
  const azAllSelected = !showAzFilter.value
    || isFilterGroupAllSelected(value.azNameList, options.azNameList ?? []);
  return regionAllSelected && azAllSelected;
}

function buildBackendCloudServerName(value, tree) {
  // 首屏默认全选不是用户主动筛选，左侧相关接口按后端约定传空字符串。
  if (!hasUserChangedFilter.value) {
    return "";
  }

  const selectedCloudServerValues = new Set(value.cloudServerType ?? []);
  const selectedCloudServerNames = (tree ?? [])
    .filter((item) => selectedCloudServerValues.has(getFilterOptionValue(item)))
    .map(getCloudServerName)
    .filter(Boolean);

  if (selectedCloudServerNames.length === 1) {
    return selectedCloudServerNames[0];
  }

  // 云服务选中 0 个或 2 个及以上时，不把左侧 selectedPool 带给汇总类接口。
  return "";
}

function buildOneLevelCloudServerResourceTypeList(value, tree) {
  // BMS/DCC/DSS 没有 resourceType 子层，用户主动选择后用 cloudServerName 对象表达资源粒度。
  if (!hasUserChangedFilter.value) {
    return [];
  }

  const selectedCloudServerValues = new Set(value.cloudServerType ?? []);
  return (tree ?? [])
    .filter((item) => selectedCloudServerValues.has(getFilterOptionValue(item)))
    .map(getCloudServerName)
    .filter((cloudServerName) => emptyResourceTypeCloudServerNames.has(cloudServerName))
    .map((cloudServerName) => ({ cloudServerName }));
}

function buildLeftResourceTypeList(value, tree) {
  // 左侧汇总类接口需要拿到用户真实勾选的资源类型，不能复用气泡图“全选传空数组”的规则。
  // BMS/DCC/DSS 只有云服务自身这一层，左侧不把它们放进 resourceTypeList。
  if (!hasUserChangedFilter.value) {
    return [];
  }
  return buildResourceTypeList(
    value.resourceType,
    tree,
    resolvedFilterConfig.value.resourceType.submitMode
  );
}

function buildBackendFilterValue(value, options) {
  const tree = options.resourceTree ?? [];
  const resourceTypeOptions = showResourceTypeFilter.value
    ? flattenResourceTypes(tree)
    : [];
  const isAllResourceGranularitySelected = isResourceGranularityAllSelected(value, tree, resourceTypeOptions);
  const shouldSubmitEmptyResourceTypes = shouldSubmitEmptyResourceTypeList(value, tree, resourceTypeOptions);
  const oneLevelResourceTypeList = buildOneLevelCloudServerResourceTypeList(value, tree);
  const leftResourceTypeList = buildLeftResourceTypeList(value, tree);
  // 用户手动把范围粒度和资源粒度都恢复成全选时，参数语义必须和首屏默认全选一致。
  if (isRangeGranularityAllSelected(value, options) && isAllResourceGranularitySelected) {
    return createEmptyBackendFilters();
  }
  let resourceTypeList = [];
  if (showResourceTypeFilter.value) {
    // 资源粒度全选表示不按资源过滤；气泡图也需要传空数组，不能再展开 BMS/DCC/DSS。
    if (isAllResourceGranularitySelected) {
      resourceTypeList = [];
    } else if (oneLevelResourceTypeList.length > 0) {
      resourceTypeList = oneLevelResourceTypeList;
    } else if (!shouldSubmitEmptyResourceTypes) {
      resourceTypeList = buildResourceTypeList(
        value.resourceType,
        tree,
        resolvedFilterConfig.value.resourceType.submitMode
      );
    }
  }
  // 未展示的筛选项提交空数组，避免隐藏项的旧选中值继续影响请求。
  return {
    cloudServerName: buildBackendCloudServerName(value, tree),
    regionNameList: showRegionFilter.value
      ? buildPartialSubmitValues(value.regionNameList, options.regionNameList ?? [], ["regionName"])
      : [],
    azNameList: showAzFilter.value
      ? buildPartialSubmitValues(value.azNameList, options.azNameList ?? [], ["azName"])
      : [],
    resourceTypeList,
    leftResourceTypeList,
  };
}

export function onFilterChange(value) {
  // 选项未就绪时忽略 UI 触发，统一等 filterOptions watch 生成默认全选参数。
  if (!isFilterOptionsReady(filterOptions.value)) return;
  hasUserChangedFilter.value = true;
  filterValue.value = reconcileFilterValue(value, filterOptions.value);
  backendFilters.value = buildBackendFilterValue(filterValue.value, filterOptions.value);
  clearBubbleTierFilter();
}

export function resetGeneralComputeFilter() {
  // 资源池/时间切换会重置筛选；如果目录树选项还没准备好，不生成空参数。
  if (!isFilterOptionsReady(filterOptions.value)) return;
  hasUserChangedFilter.value = false;
  filterValue.value = createDefaultFilterValue(filterOptions.value);
  backendFilters.value = buildBackendFilterValue(filterValue.value, filterOptions.value);
  filterResetKey.value += 1;
  clearBubbleTierFilter();
}

export function setGeneralComputeFilterConfig(config) {
  filterConfig.value = config;
}

export function setVisibleTierFilter(config) {
  visibleTiers.value = [...(config.tiers ?? [])];
  return setBubbleTierFilter(config);
}

watch(
  filterOptions,
  (options, oldOptions) => {
    // 首屏目录树加载前 filterOptions 会先计算出空数组。
    // 这里直接返回，让 backendFilters 保持 null，所有请求监听都会跳过。
    if (!isFilterOptionsReady(options)) {
      return;
    }
    let nextValue;
    if (!hasUserChangedFilter.value) {
      nextValue = createDefaultFilterValue(options);
    } else if (oldOptions) {
      nextValue = fillNewFilterGroups(filterValue.value, options, oldOptions);
    } else {
      nextValue = createDefaultFilterValue(options);
    }
    filterValue.value = reconcileFilterValue(nextValue, options);
    backendFilters.value = buildBackendFilterValue(filterValue.value, options);
  },
  { deep: true, immediate: true }
);

watch(
  () => resolvedFilterConfig.value.resourceType,
  (config, oldConfig) => {
    if (!oldConfig) return;
    const resourceConfigChanged =
      config.variant !== oldConfig.variant || config.submitMode !== oldConfig.submitMode;
    if (!resourceConfigChanged) return;
    let nextValue;
    if (hasUserChangedFilter.value) {
      nextValue = fillDefaultResourceFilterGroups(filterValue.value, filterOptions.value);
    } else {
      nextValue = createDefaultFilterValue(filterOptions.value);
    }
    filterValue.value = reconcileFilterValue(nextValue, filterOptions.value);
    backendFilters.value = buildBackendFilterValue(filterValue.value, filterOptions.value);
  },
  { deep: true }
);
