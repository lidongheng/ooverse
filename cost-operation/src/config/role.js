import { reactive, ref } from "vue";
import { getPermissionConfig } from '@/api/role';

export const ROLE_STORAGE_KEY = "infraMap:selectedRole";

export const ROLE_CODE_ORDER = [
  "ROLE_CXO",
  "ROLE_FRONT_SALES",
  "ROLE_INTERNAL_CUSTOMER",
  "ROLE_SERVICE_PE",
  "ROLE_OPS_ANALYST",
];

export const DISABLED_ROLE_CODES = [
  "ROLE_INTERNAL_CUSTOMER",
  "ROLE_SERVICE_PE",
  "ROLE_OPS_ANALYST",
];

export const ROLE_ROUTE_CONFIG = {
  ROLE_CXO: {
    defaultPath: '/costOperation',
    paths: [
      '/costOperation',
      '/aiCompute',
      '/generalCompute',
    ],
  },
  ROLE_FRONT_SALES: {
    defaultPath: '/saleHome',
    paths: [
      '/saleHome',
      '/saleDetail',
    ],
  },
};

// 权限图标由前端维护，后续只需要在这里补充对应的 SVG 图标名称。
export const PERMISSION_ICON_NAME_MAP = {
  CLOUD_ECS: '',
  CLOUD_EVS: '',
  CLOUD_OBS: '',
  CLOUD_XPU: '',
  CXO_CLOUD_GENERAL_COMPUTING: '',
  CXO_CLOUD_NPU: '',
  DATA_COST: '',
  DATA_EFFICIENCY: '',
  DATA_OPERATE: '',
  DATA_REVENUE: '',
  REGION_AP_JAKARTA: '',
  REGION_AP_SINGAPORE: '',
  REGION_CN_BEIJING_ONE: '',
  REGION_CN_EAST: '',
  REGION_CN_HONGKONG: '',
  REGION_CN_NORTH: '',
  REGION_CN_SHANGHAI_ONE: '',
  REGION_CN_SHENZHEN: '',
  REGION_CN_SOUTH: '',
  REGION_CN_WEST: '',
  REGION_EU_FRANKFURT: '',
  REGION_US_SILICON_VALLEY: '',
};

// 正式头像提供后，在这里引入 PNG 文件，并将下方 null 替换为对应的变量。
// import roleCxoAvatar from "@/assets/images/role/role-cxo.png";
// import roleFrontSalesAvatar from "@/assets/images/role/role-front-sales.png";
// import roleInternalCustomerAvatar from "@/assets/images/role/role-internal-customer.png";
// import roleServicePeAvatar from "@/assets/images/role/role-service-pe.png";
// import roleOpsAnalystAvatar from "@/assets/images/role/role-ops-analyst.png";
const ROLE_AVATAR_MAP = {
  // ROLE_CXO: roleCxoAvatar,
  ROLE_CXO: null,
  // ROLE_FRONT_SALES: roleFrontSalesAvatar,
  ROLE_FRONT_SALES: null,
  // ROLE_INTERNAL_CUSTOMER: roleInternalCustomerAvatar,
  ROLE_INTERNAL_CUSTOMER: null,
  // ROLE_SERVICE_PE: roleServicePeAvatar,
  ROLE_SERVICE_PE: null,
  // ROLE_OPS_ANALYST: roleOpsAnalystAvatar,
  ROLE_OPS_ANALYST: null,
};

export const roles = reactive([]);
export const allRegionPermissionList = reactive([]);
export const allCloudServerPermissionList = reactive([]);
export const allCxoCloudPermissionList = reactive([]);
export const allDataTypePermissionList = reactive([]);
export const cxoDataTypePermissionMap = reactive({
  CXO_CLOUD_GENERAL_COMPUTING: [],
  CXO_CLOUD_NPU: [],
});
export const rolePermissionList = reactive([]);
export const regionPermissionList = reactive([]);
export const cloudServerPermissionList = reactive([]);
export const selectedRoleValue = ref(sessionStorage.getItem(ROLE_STORAGE_KEY));

const NO_ROLE_REQUEST_KEY = Symbol('NO_ROLE_REQUEST_KEY');
const permissionRequestMap = new Map();
let roleCatalogLoaded = false;
let loadedRoleValue;
let roleOperationVersion = 0;
let activeRoleOperation;

function createPermissionItems(detailList) {
  return detailList.map((item) => {
    return {
      label: item.permName,
      value: item.permCode,
      code: item.permCode,
      approver: item.approver,
      iconName: PERMISSION_ICON_NAME_MAP[item.permCode],
    };
  });
}

function createRegionItemsFromGeoTree(geoTree) {
  return geoTree.flatMap((area) => {
    return area.children.map((region) => {
      return {
        label: region.name,
        value: region.code,
        code: region.code,
        iconName: PERMISSION_ICON_NAME_MAP[region.code],
        areaCode: area.code,
        areaName: area.name,
      };
    });
  });
}

function clearFrontSalesPermissionState() {
  allRegionPermissionList.splice(0, allRegionPermissionList.length);
  allCloudServerPermissionList.splice(0, allCloudServerPermissionList.length);
  regionPermissionList.splice(0, regionPermissionList.length);
  cloudServerPermissionList.splice(0, cloudServerPermissionList.length);
}

function clearCxoPermissionState() {
  allCxoCloudPermissionList.splice(0, allCxoCloudPermissionList.length);
  allDataTypePermissionList.splice(0, allDataTypePermissionList.length);
  cxoDataTypePermissionMap.CXO_CLOUD_GENERAL_COMPUTING.splice(
    0,
    cxoDataTypePermissionMap.CXO_CLOUD_GENERAL_COMPUTING.length,
  );
  cxoDataTypePermissionMap.CXO_CLOUD_NPU.splice(
    0,
    cxoDataTypePermissionMap.CXO_CLOUD_NPU.length,
  );
}

function clearRolePermissionState() {
  clearFrontSalesPermissionState();
  clearCxoPermissionState();
}

function isPermissionDataValid(data) {
  return data !== null && !Array.isArray(data);
}

function initializeRoleCatalog(data) {
  if (data === null || Array.isArray(data)) {
    // 接口异常时 data 可能为 null，业务上按空权限数据处理。
    roles.splice(0, roles.length);
    rolePermissionList.splice(0, rolePermissionList.length);
    return false;
  }

  const roleDimension = data.totalDimenPermConfigList.find(
    (item) => item.permDimenTypeCode === "1",
  );
  const onlyFrontSalesRole = data.ruleCodeList.length === 1
    && data.ruleCodeList[0].code === "ROLE_FRONT_SALES";
  const roleList = roleDimension.detailList.map((role) => {
    return {
      label: role.permName,
      value: role.permCode,
      avatar: ROLE_AVATAR_MAP[role.permCode],
      disabled: DISABLED_ROLE_CODES.includes(role.permCode)
        || (onlyFrontSalesRole && role.permCode === "ROLE_CXO"),
    };
  });

  roles.splice(0, roles.length, ...roleList);
  rolePermissionList.splice(0, rolePermissionList.length, ...data.ruleCodeList);
  return true;
}

export function initializePermissionConfig(data, roleValue) {
  if (!initializeRoleCatalog(data)) {
    clearRolePermissionState();
    return false;
  }

  clearRolePermissionState();

  if (isCxoRole(roleValue)) {
    const dataTypeDimension = data.totalDimenPermConfigList.find(
      (item) => item.permDimenTypeCode === "3",
    );
    const cxoCloudDimension = data.totalDimenPermConfigList.find(
      (item) => item.permDimenTypeCode === "6",
    );

    allDataTypePermissionList.splice(
      0,
      allDataTypePermissionList.length,
      ...createPermissionItems(dataTypeDimension.detailList),
    );
    allCxoCloudPermissionList.splice(
      0,
      allCxoCloudPermissionList.length,
      ...createPermissionItems(cxoCloudDimension.detailList),
    );
    cxoDataTypePermissionMap.CXO_CLOUD_GENERAL_COMPUTING.splice(
      0,
      cxoDataTypePermissionMap.CXO_CLOUD_GENERAL_COMPUTING.length,
      ...data.dataTypeCodeMap.CXO_CLOUD_GENERAL_COMPUTING,
    );
    cxoDataTypePermissionMap.CXO_CLOUD_NPU.splice(
      0,
      cxoDataTypePermissionMap.CXO_CLOUD_NPU.length,
      ...data.dataTypeCodeMap.CXO_CLOUD_NPU,
    );
    return true;
  }

  const cloudServerDimension = data.totalDimenPermConfigList.find(
    (item) => item.permDimenTypeCode === "4",
  );

  allRegionPermissionList.splice(
    0,
    allRegionPermissionList.length,
    ...createRegionItemsFromGeoTree(data.geoTree),
  );
  allCloudServerPermissionList.splice(
    0,
    allCloudServerPermissionList.length,
    ...createPermissionItems(cloudServerDimension.detailList),
  );
  regionPermissionList.splice(0, regionPermissionList.length, ...data.regionCodeList);
  cloudServerPermissionList.splice(
    0,
    cloudServerPermissionList.length,
    ...data.cloudServerNameList,
  );
  return true;
}

export function getRoleTargetPath(roleValue) {
  const routeConfig = ROLE_ROUTE_CONFIG[roleValue];

  if (!routeConfig) {
    return undefined;
  }

  return routeConfig.defaultPath;
}

export function getRouteRole(path) {
  const roleRouteEntry = Object.entries(ROLE_ROUTE_CONFIG).find(([, routeConfig]) => {
    return routeConfig.paths.includes(path);
  });

  if (!roleRouteEntry) {
    return undefined;
  }

  return roleRouteEntry[0];
}

export function isRoleManagedRoute(path) {
  return getRouteRole(path) !== undefined;
}

export function isCxoRole(roleValue) {
  return roleValue === "ROLE_CXO";
}

export function hasDataPermission(roleValue) {
  if (isCxoRole(roleValue)) {
    return cxoDataTypePermissionMap.CXO_CLOUD_GENERAL_COMPUTING.length > 0
      || cxoDataTypePermissionMap.CXO_CLOUD_NPU.length > 0;
  }

  return regionPermissionList.length > 0 || cloudServerPermissionList.length > 0;
}

export function canEnterRolePage(roleValue) {
  return hasDataPermission(roleValue);
}

export function isRoleDisabled(roleValue) {
  return DISABLED_ROLE_CODES.includes(roleValue);
}

export function saveSelectedRole(roleValue) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, roleValue);
  selectedRoleValue.value = roleValue;
}

export function syncSelectedRoleFromSession() {
  selectedRoleValue.value = sessionStorage.getItem(ROLE_STORAGE_KEY);
}

function createRoleRequestConfig(roleValue) {
  if (roleValue === undefined) {
    return undefined;
  }

  return {
    headers: {
      'X-Current-Role': roleValue,
    },
  };
}

function requestPermissionData(roleValue) {
  const requestKey = roleValue === undefined ? NO_ROLE_REQUEST_KEY : roleValue;
  const pendingRequest = permissionRequestMap.get(requestKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const permissionRequest = getPermissionConfig(createRoleRequestConfig(roleValue))
    .then((response) => {
      return response.data;
    })
    .finally(() => {
      if (permissionRequestMap.get(requestKey) === permissionRequest) {
        permissionRequestMap.delete(requestKey);
      }
    });

  permissionRequestMap.set(requestKey, permissionRequest);
  return permissionRequest;
}

function ownsRole(data, roleValue) {
  return data.ruleCodeList.some((role) => role.code === roleValue);
}

async function loadRolePermission(roleValue, options) {
  const force = options.force;
  const clearBeforeLoad = options.clearBeforeLoad;

  if (!force && loadedRoleValue === roleValue) {
    if (activeRoleOperation && activeRoleOperation.roleValue !== roleValue) {
      // 返回已加载角色也代表一次新的角色意图，必须让另一角色的旧响应失效。
      roleOperationVersion += 1;
      activeRoleOperation = undefined;
    }

    if (selectedRoleValue.value !== roleValue) {
      saveSelectedRole(roleValue);
    }
    return true;
  }

  if (activeRoleOperation && activeRoleOperation.roleValue === roleValue) {
    return activeRoleOperation.promise;
  }

  const operationVersion = ++roleOperationVersion;

  if (clearBeforeLoad) {
    // 切换角色后先移除上一角色权限，等待期间不能展示旧角色数据。
    clearRolePermissionState();
    loadedRoleValue = undefined;
  }

  const operationPromise = requestPermissionData(roleValue)
    .then((data) => {
      if (operationVersion !== roleOperationVersion) {
        return false;
      }

      if (!isPermissionDataValid(data)) {
        initializePermissionConfig(data, roleValue);
        roleCatalogLoaded = false;
        loadedRoleValue = undefined;
        return false;
      }

      initializeRoleCatalog(data);
      roleCatalogLoaded = true;

      if (!ownsRole(data, roleValue)) {
        return false;
      }

      initializePermissionConfig(data, roleValue);
      loadedRoleValue = roleValue;
      saveSelectedRole(roleValue);
      return true;
    })
    .finally(() => {
      if (activeRoleOperation && activeRoleOperation.promise === operationPromise) {
        activeRoleOperation = undefined;
      }
    });

  activeRoleOperation = {
    roleValue,
    promise: operationPromise,
  };

  return operationPromise;
}

export async function ensureRoleCatalog() {
  if (roleCatalogLoaded) {
    return true;
  }

  const data = await requestPermissionData(undefined);

  // 目录请求期间角色权限可能已完成初始化，此时不能再应用较慢的无头响应。
  if (roleCatalogLoaded) {
    return true;
  }

  roleCatalogLoaded = initializeRoleCatalog(data);
  return roleCatalogLoaded;
}

export function ensureRolePermission(roleValue) {
  return loadRolePermission(roleValue, {
    force: false,
    clearBeforeLoad: false,
  });
}

export function authorizeRouteRole(roleValue) {
  return loadRolePermission(roleValue, {
    force: false,
    clearBeforeLoad: false,
  });
}

export function changeSelectedRole(roleValue) {
  return loadRolePermission(roleValue, {
    force: false,
    clearBeforeLoad: true,
  });
}

export function restoreSelectedRole(roleValue) {
  return loadRolePermission(roleValue, {
    force: true,
    clearBeforeLoad: false,
  });
}

export function getCurrentRoleRequestConfig() {
  if (!selectedRoleValue.value) {
    return undefined;
  }

  return {
    headers: {
      'X-Current-Role': selectedRoleValue.value,
    },
  };
}
