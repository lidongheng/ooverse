import { reactive, ref } from "vue";

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
export const cxoDataTypePermissionMap = reactive({});
export const rolePermissionList = reactive([]);
export const regionPermissionList = reactive([]);
export const cloudServerPermissionList = reactive([]);
export const selectedRoleValue = ref(sessionStorage.getItem(ROLE_STORAGE_KEY));

function createPermissionItems(detailList) {
  return detailList.map((item) => {
    return {
      label: item.permName,
      value: item.permCode,
      code: item.permCode,
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
  Object.keys(cxoDataTypePermissionMap).forEach((code) => {
    delete cxoDataTypePermissionMap[code];
  });
}

export function initializePermissionConfig(data, roleValue) {
  if (data === null || Array.isArray(data)) {
    // 接口异常时 data 可能为 null，业务上按空权限数据处理。
    roles.splice(0, roles.length);
    clearFrontSalesPermissionState();
    clearCxoPermissionState();
    rolePermissionList.splice(0, rolePermissionList.length);
    return;
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
  clearFrontSalesPermissionState();
  clearCxoPermissionState();

  if (isCxoRole(roleValue)) {
    const dataTypeDimension = data.totalDimenPermConfigList.find(
      (item) => item.permDimenTypeCode === "3",
    );
    const cxoCloudDimension = data.totalDimenPermConfigList.find(
      (item) => item.permDimenTypeCode === "6",
    );

    Object.entries(data.dataTypeCodeMap).forEach(([cloudCode, dataTypeList]) => {
      cxoDataTypePermissionMap[cloudCode] = dataTypeList.map((item) => ({ ...item }));
    });
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
    return;
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
}

export function getRoleTargetPath(roleValue) {
  // 角色入口和切换入口共用同一套跳转规则，避免两处维护时出现路由不一致。
  if (roleValue === "ROLE_CXO") {
    return "/costOperation";
  }

  return "/saleHome";
}

export function isCxoRole(roleValue) {
  return roleValue === "ROLE_CXO";
}

export function hasDataPermission(roleValue) {
  if (isCxoRole(roleValue)) {
    return Object.values(cxoDataTypePermissionMap).some((dataTypeList) => {
      return dataTypeList.length > 0;
    });
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
