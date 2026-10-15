import { computed, h, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { QuestionFilled, Search } from '@element-plus/icons-vue';
import {
  createNoDataAuth,
  getNoDataAuthList,
  getNoDataAuthOptions,
} from "@/api/noDataAuth";
import {
  allCxoCloudPermissionList,
  allDataTypePermissionList,
  cxoDataTypePermissionMap,
  ensureRolePermission,
  getCurrentRoleRequestConfig,
  isCxoRole,
  isRolePermissionAuthorized,
  restoreSelectedRole,
  ROLE_CODE_ORDER,
  selectedRoleValue,
} from '@/config/role';


export function useNoDataAuth() {
  const FourGridIcon = {
    name: "FourGridIcon",
    render() {
      return h(
        "span",
        {
          class: "four-grid-icon",
          "aria-hidden": "true",
        },
        [h("span"), h("span"), h("span"), h("span")]
      );
    },
  };

  const activeStatus = ref("waiting");
  const route = useRoute();
  const router = useRouter();
  const regionScopeFilter = ref('all');
  const areaFilter = ref("all");
  const formRef = ref();
  const keyword = ref("");
  const openedGroups = ref([]);
  const unownedCloudServers = ref([]);
  const unownedRegionGroups = ref([]);
  const ownedCloudServers = ref([]);
  const ownedRegions = ref([]);
  const ownedCxoTableRows = ref([]);
  const approvingRows = ref([]);
  const submitLoading = ref(false);
  const backLoading = ref(false);
  const SAFE_ROLE_SELECT_PATH = '/roleSelect?fromUnauthorized=1';
  let optionRequestId = 0;

  const form = reactive({
    cloudServerCodes: [],
    regionCodes: [],
    cxoPermissionMap: {
      CXO_CLOUD_GENERAL_COMPUTING: [],
      CXO_CLOUD_NPU: [],
    },
    reason: "",
  });

  const regionScopeOptions = computed(() => {
    const optionMap = new Map();

    // 区域选项按后端 geoTree 的首次出现顺序去重。
    unownedRegionGroups.value.forEach((group) => {
      if (!optionMap.has(group.regionScopeCode)) {
        optionMap.set(group.regionScopeCode, {
          code: group.regionScopeCode,
          name: group.regionScopeName,
        });
      }
    });

    return Array.from(optionMap.values());
  });
  const areaOptions = computed(() => {
    return unownedRegionGroups.value
      .filter((group) => {
        if (regionScopeFilter.value === 'all') {
          return true;
        }

        return group.regionScopeCode === regionScopeFilter.value;
      })
      .map((group) => {
        return {
          code: group.code,
          name: group.name,
        };
      });
  });
  const allRegionCodes = computed(() =>
    unownedRegionGroups.value.flatMap((group) => group.children.map((region) => region.code))
  );
  const cloudServerApprover = computed(() => ownedCloudServers.value[0]?.userName);
  const isCxoRoleSelected = computed(() => isCxoRole(selectedRoleValue.value));
  const validatePermissionSelection = (_rule, _value, callback) => {
    const hasSelectedPermission = form.cloudServerCodes.length > 0 || form.regionCodes.length > 0;

    if (hasSelectedPermission) {
      callback();
      return;
    }

    callback(new Error('请选择云服务或 Region'));
  };
  const rules = computed(() => {
    if (isCxoRoleSelected.value) {
      return {
        reason: [{ required: true, message: "请输入申请原因", trigger: "blur" }],
      };
    }

    return {
      regionCodes: [{ validator: validatePermissionSelection, trigger: 'change' }],
      reason: [{ required: true, message: "请输入申请原因", trigger: "blur" }],
    };
  });
  const secondaryPermissionLabel = computed(() => {
    return 'Region';
  });
  const permissionTooltip = computed(() => {
    if (isCxoRoleSelected.value) {
      return '可按云服务选择数据类型后发起权限申请';
    }

    return '可选择云服务或 Region 后发起权限申请';
  });
  const ownedSecondaryPermissions = computed(() => {
    return ownedRegions.value;
  });
  const ownedRegionGroups = computed(() => {
    const ownedCodes = new Set(ownedRegions.value.map((region) => region.code));

    // 已拥有权限仍按接口 geoTree 的父节点分组，卡片名称沿用现有映射结果。
    return unownedRegionGroups.value
      .map((group) => ({
        code: group.code,
        name: group.name,
        children: group.children.filter((region) => ownedCodes.has(region.code)),
      }))
      .filter((group) => group.children.length > 0);
  });
  const selectedRegionNames = computed(() => {
    const selectedCodes = new Set(form.regionCodes);

    return unownedRegionGroups.value.flatMap((group) => group.children
      .filter((region) => selectedCodes.has(region.code))
      .map((region) => region.name));
  });
  const statusMessage = computed(() => {
    if (activeStatus.value === 'owned') {
      return isCxoRoleSelected.value ? '您已拥有的数据权限！' : '您已拥有的数据权限Region！';
    }

    if (activeStatus.value === 'approving') {
      return '您的数据权限申请正在审批中。';
    }

    return '当前页面您没有数据权限，请根据需求申请数据权限！';
  });
  const cxoApplicationGroups = computed(() => {
    return allCxoCloudPermissionList.map((cloudServer) => {
      return {
        ...cloudServer,
        dataTypes: allDataTypePermissionList,
      };
    });
  });
  const isAllRegionsChecked = computed(() =>
    allRegionCodes.value.length > 0
    && allRegionCodes.value.every((code) => form.regionCodes.includes(code))
  );
  const isAllRegionsIndeterminate = computed(() => {
    const selectedCount = allRegionCodes.value.filter((code) => form.regionCodes.includes(code)).length;

    return selectedCount > 0 && selectedCount < allRegionCodes.value.length;
  });

  const visibleRegionGroups = computed(() => {
    const groups = unownedRegionGroups.value.filter((group) => {
      if (
        regionScopeFilter.value !== 'all'
        && group.regionScopeCode !== regionScopeFilter.value
      ) {
        return false;
      }

      if (areaFilter.value !== 'all' && group.code !== areaFilter.value) {
        return false;
      }

      return true;
    });

    if (!keyword.value) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        children: group.children.filter((region) => region.name.includes(keyword.value)),
      }))
      .filter((group) => group.children.length > 0);
  });

  const parseQueryCodes = (value) => {
    if (Array.isArray(value)) {
      return value.flatMap((item) => parseQueryCodes(item));
    }

    if (!value) {
      return [];
    }

    return String(value).split(",").filter(Boolean);
  };

  const parseCxoPermissionMap = (value) => {
    if (value === undefined) {
      return {
        CXO_CLOUD_GENERAL_COMPUTING: [],
        CXO_CLOUD_NPU: [],
      };
    }

    const permissionMap = JSON.parse(value);
    return {
      CXO_CLOUD_GENERAL_COMPUTING: permissionMap.CXO_CLOUD_GENERAL_COMPUTING,
      CXO_CLOUD_NPU: permissionMap.CXO_CLOUD_NPU,
    };
  };

  const createRegionNameMap = (regionGroups) => {
    return new Map(
      regionGroups.flatMap((group) => {
        return group.children.map((region) => [region.code, region.name]);
      })
    );
  };

  const getCxoOwnedSpanMethod = ({ row, columnIndex }) => {
    if (columnIndex !== 0) {
      return {
        rowspan: 1,
        colspan: 1,
      };
    }

    return {
      rowspan: row.cloudRowSpan,
      colspan: row.cloudRowSpan > 0 ? 1 : 0,
    };
  };

  const createCxoOwnedTableRows = (cloudServerList, dataTypeList, dataTypePermissionMap) => {
    return cloudServerList.flatMap((cloudServer) => {
      const ownedDataTypeCodeSet = new Set(
        dataTypePermissionMap[cloudServer.value].map((dataType) => dataType.code)
      );
      const ownedDataTypes = dataTypeList.filter((dataType) => {
        return ownedDataTypeCodeSet.has(dataType.value);
      });

      if (ownedDataTypes.length === 0) {
        return [];
      }

      return ownedDataTypes.map((dataType, index) => {
        return {
          cloudServerCode: cloudServer.code,
          cloudServerName: cloudServer.label,
          dataTypeCode: dataType.code,
          dataTypeName: dataType.label,
          cloudRowSpan: index === 0 ? ownedDataTypes.length : 0,
        };
      });
    });
  };

  const initializeDefaultSelection = () => {
    if (isCxoRoleSelected.value) {
      const selectedPermissionMap = parseCxoPermissionMap(route.query.cxoPermissionMap);
      const allDataTypeCodes = allDataTypePermissionList.map((dataType) => dataType.code);

      form.cxoPermissionMap.CXO_CLOUD_GENERAL_COMPUTING = allDataTypeCodes.filter((code) => {
        return selectedPermissionMap.CXO_CLOUD_GENERAL_COMPUTING.includes(code);
      });
      form.cxoPermissionMap.CXO_CLOUD_NPU = allDataTypeCodes.filter((code) => {
        return selectedPermissionMap.CXO_CLOUD_NPU.includes(code);
      });
      form.cloudServerCodes = [];
      form.regionCodes = [];
      return;
    }

    form.cxoPermissionMap.CXO_CLOUD_GENERAL_COMPUTING = [];
    form.cxoPermissionMap.CXO_CLOUD_NPU = [];
    const selectedRegionCodeSet = new Set(parseQueryCodes(route.query.regionCodes));

    // 从权限卡片跳转过来时，用 regionCode 与申请页可申请 Region 做匹配。
    form.regionCodes = allRegionCodes.value.filter((code) => selectedRegionCodeSet.has(code));
    form.cloudServerCodes = unownedCloudServers.value.map((cloudServer) => cloudServer.code);
  };

  const loadOptions = async () => {
    const requestId = ++optionRequestId;
    const requestedRoleValue = selectedRoleValue.value;
    const isCxoRequest = isCxoRole(requestedRoleValue);
    const requestConfig = getCurrentRoleRequestConfig();
    const optionRequest = getNoDataAuthOptions(requestConfig);
    let permissionRequest;

    if (isCxoRequest) {
      permissionRequest = ensureRolePermission(requestedRoleValue);
    }

    const response = await optionRequest;
    const optionData = response.data;

    if (requestId !== optionRequestId) {
      return;
    }

    if (optionData === null || Array.isArray(optionData)) {
      // 后端业务状态异常时 HTTP 仍为 200，页面按空权限数据展示。
      unownedCloudServers.value = [];
      unownedRegionGroups.value = [];
      ownedCloudServers.value = [];
      ownedRegions.value = [];
      ownedCxoTableRows.value = [];
      openedGroups.value = [];
      return;
    }

    if (isCxoRequest) {
      const permissionStatus = await permissionRequest;

      if (requestId !== optionRequestId) {
        return;
      }

      if (!isRolePermissionAuthorized(permissionStatus)) {
        ownedCxoTableRows.value = [];
        return;
      }

      ownedCxoTableRows.value = createCxoOwnedTableRows(
        allCxoCloudPermissionList,
        allDataTypePermissionList,
        cxoDataTypePermissionMap
      );
      unownedCloudServers.value = [];
      unownedRegionGroups.value = [];
      ownedCloudServers.value = [];
      ownedRegions.value = [];
      openedGroups.value = [];
      initializeDefaultSelection();
      return;
    }

    ownedCxoTableRows.value = [];
    const cloudServerDimension = optionData.totalDimenPermConfigList.find(
      (dimension) => dimension.permDimenTypeCode === '4'
    );
    // geoTree 父节点只作为展开分组标题，Region 卡片展示子节点完整名称。
    const regionNameMap = createRegionNameMap(optionData.geoTree);

    unownedCloudServers.value = cloudServerDimension.detailList.map((item) => ({
      code: item.permCode,
      name: item.permName,
    }));
    unownedRegionGroups.value = optionData.geoTree;
    ownedCloudServers.value = optionData.cloudServerNameList;
    ownedRegions.value = optionData.regionCodeList.map((region) => ({
      ...region,
      name: regionNameMap.get(region.code),
    }));
    openedGroups.value = optionData.geoTree.map((group) => group.code);
    initializeDefaultSelection();
  };

  const loadApprovingRows = async () => {
    const response = await getNoDataAuthList({
      account: "12345678",
      status: "approving",
    }, getCurrentRoleRequestConfig());

    approvingRows.value = response.data.map((row, index) => ({
      index: index + 1,
      ...row,
    }));
  };

  const toggleById = (list, id) => {
    if (list.includes(id)) {
      return list.filter((currentId) => currentId !== id);
    }

    return [...list, id];
  };

  const validateField = (field) => {
    // validateField 校验失败会返回 rejected promise，这里保留表单提示但避免开发 overlay 报错。
    formRef.value.validateField(field).catch(() => {});
  };

  const toggleCloudServer = (code) => {
    form.cloudServerCodes = toggleById(form.cloudServerCodes, code);
    validateField('regionCodes');
  };

  const toggleRegion = (code) => {
    form.regionCodes = toggleById(form.regionCodes, code);
    validateField("regionCodes");
  };

  const isCxoApplicationGroupAllSelected = (group) => {
    return group.dataTypes.length > 0
      && group.dataTypes.every((dataType) => {
        return form.cxoPermissionMap[group.value].includes(dataType.value);
      });
  };

  const isCxoApplicationGroupIndeterminate = (group) => {
    const selectedCount = group.dataTypes.filter((dataType) => {
      return form.cxoPermissionMap[group.value].includes(dataType.value);
    }).length;

    return selectedCount > 0 && selectedCount < group.dataTypes.length;
  };

  const toggleCxoApplicationGroup = (group) => {
    if (isCxoApplicationGroupAllSelected(group)) {
      form.cxoPermissionMap[group.value] = [];
      return;
    }

    form.cxoPermissionMap[group.value] = group.dataTypes.map((dataType) => {
      return dataType.value;
    });
  };

  const toggleCxoDataType = (cloudServerCode, dataTypeCode) => {
    form.cxoPermissionMap[cloudServerCode] = toggleById(
      form.cxoPermissionMap[cloudServerCode],
      dataTypeCode,
    );
  };

  const getRegionGroupCodes = (group) => group.children.map((region) => region.code);

  const isRegionGroupChecked = (group) => {
    const groupCodes = getRegionGroupCodes(group);

    return groupCodes.length > 0 && groupCodes.every((code) => form.regionCodes.includes(code));
  };

  const isRegionGroupIndeterminate = (group) => {
    const groupCodes = getRegionGroupCodes(group);
    const selectedCount = groupCodes.filter((code) => form.regionCodes.includes(code)).length;

    return selectedCount > 0 && selectedCount < groupCodes.length;
  };

  const toggleAllRegions = () => {
    const selectedRegionCodes = new Set(form.regionCodes);

    if (isAllRegionsChecked.value) {
      allRegionCodes.value.forEach((code) => selectedRegionCodes.delete(code));
    } else {
      allRegionCodes.value.forEach((code) => selectedRegionCodes.add(code));
    }

    form.regionCodes = Array.from(selectedRegionCodes);
    validateField("regionCodes");
  };

  const toggleRegionGroup = (group) => {
    const selectedRegionCodes = new Set(form.regionCodes);
    const groupCodes = getRegionGroupCodes(group);

    if (isRegionGroupChecked(group)) {
      groupCodes.forEach((code) => selectedRegionCodes.delete(code));
    } else {
      groupCodes.forEach((code) => selectedRegionCodes.add(code));
    }

    form.regionCodes = Array.from(selectedRegionCodes);
    validateField("regionCodes");
  };

  const toggleGroup = (id) => {
    openedGroups.value = toggleById(openedGroups.value, id);
  };

  const handleRegionScopeChange = () => {
    areaFilter.value = 'all';
    openedGroups.value = visibleRegionGroups.value.map((group) => group.code);
  };

  const handleAreaChange = () => {
    openedGroups.value = visibleRegionGroups.value.map((group) => group.code);
  };

  const handleKeywordChange = () => {
    openedGroups.value = visibleRegionGroups.value.map((group) => group.code);
  };

  const resetForm = () => {
    form.cloudServerCodes = [];
    form.regionCodes = [];
    form.cxoPermissionMap.CXO_CLOUD_GENERAL_COMPUTING = [];
    form.cxoPermissionMap.CXO_CLOUD_NPU = [];
    form.reason = "";
    formRef.value.clearValidate();
  };

  const createCxoDataRoleList = () => {
    return allCxoCloudPermissionList.flatMap((cloudServer) => {
      return allDataTypePermissionList
        .filter((dataType) => {
          return form.cxoPermissionMap[cloudServer.value].includes(dataType.value);
        })
        .map((dataType) => {
          return {
            cloudServerCode: cloudServer.value,
            dataTypeCode: dataType.value,
            validityPeriod: '2027-10-31',
          };
        });
    });
  };

  const handleSubmit = async () => {
    if (isCxoRoleSelected.value) {
      const hasSelectedPermission = Object.values(form.cxoPermissionMap)
        .some((dataTypeCodes) => dataTypeCodes.length > 0);

      if (!hasSelectedPermission) {
        ElMessage.warning('请至少选择一个云服务下的数据类型');
        return;
      }
    }

    try {
      await formRef.value.validate();
    } catch {
      return;
    }

    submitLoading.value = true;

    try {
      let dataRoleList;
      if (isCxoRoleSelected.value) {
        dataRoleList = createCxoDataRoleList();
      } else {
        dataRoleList = [
          ...form.cloudServerCodes,
          ...form.regionCodes,
        ].map((dataRoleId) => ({
          dataRoleId,
          validityPeriod: '2027-10-31',
        }));
      }

      const payload = {
        userId: "12345678",
        tenant: "",
        description: form.reason,
        dataRoleList,
      };

      await createNoDataAuth(payload, getCurrentRoleRequestConfig());
      ElMessage.success("快捷申请已提交，后续跳转页面待接入");
      await loadApprovingRows();

      resetForm();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleStatusChange = async (status) => {
    if (status === "approving") {
      await loadApprovingRows();
    }
  };

  const getSafeReturnContext = () => {
    const returnTo = route.query.returnTo;
    const returnRole = route.query.returnRole;

    if (typeof returnTo !== 'string' || !returnTo.startsWith('/')) {
      return { returnTo: SAFE_ROLE_SELECT_PATH };
    }

    const resolvedRoute = router.resolve(returnTo);
    if (resolvedRoute.matched.length === 0 || resolvedRoute.path === '/Unauthorized') {
      return { returnTo: SAFE_ROLE_SELECT_PATH };
    }

    if (returnRole === undefined) {
      return { returnTo: resolvedRoute.fullPath };
    }

    if (typeof returnRole !== 'string' || !ROLE_CODE_ORDER.includes(returnRole)) {
      return { returnTo: SAFE_ROLE_SELECT_PATH };
    }

    return {
      returnTo: resolvedRoute.fullPath,
      returnRole,
    };
  };

  const handleBack = async () => {
    if (backLoading.value) {
      return;
    }

    backLoading.value = true;
    const returnContext = getSafeReturnContext();

    try {
      if (returnContext.returnRole) {
        const permissionStatus = await restoreSelectedRole(returnContext.returnRole);

        if (!isRolePermissionAuthorized(permissionStatus)) {
          throw new Error('恢复原角色权限失败');
        }
      }

      await router.replace(returnContext.returnTo);
    } catch {
      ElMessage.error('恢复原角色失败，请稍后重试');
    } finally {
      backLoading.value = false;
    }
  };

  watch(selectedRoleValue, async () => {
    if (backLoading.value) {
      return;
    }

    // 角色首次确定或切换后，需要按最新角色重新获取页面权限数据。
    await Promise.all([loadOptions(), loadApprovingRows()]);
  }, { immediate: true });
  return {
    FourGridIcon,
    QuestionFilled,
    Search,
    activeStatus,
    statusMessage,
    permissionTooltip,
    handleStatusChange,
    isCxoRoleSelected,
    ownedCxoTableRows,
    getCxoOwnedSpanMethod,
    backLoading,
    handleBack,
    ownedCloudServers,
    secondaryPermissionLabel,
    ownedSecondaryPermissions,
    ownedRegionGroups,
    approvingRows,
    formRef,
    form,
    rules,
    cxoApplicationGroups,
    isCxoApplicationGroupAllSelected,
    isCxoApplicationGroupIndeterminate,
    toggleCxoApplicationGroup,
    toggleCxoDataType,
    cloudServerApprover,
    unownedCloudServers,
    toggleCloudServer,
    regionScopeFilter,
    handleRegionScopeChange,
    regionScopeOptions,
    areaFilter,
    handleAreaChange,
    areaOptions,
    keyword,
    handleKeywordChange,
    isAllRegionsChecked,
    isAllRegionsIndeterminate,
    toggleAllRegions,
    visibleRegionGroups,
    selectedRegionNames,
    openedGroups,
    toggleGroup,
    toggleRegionGroup,
    isRegionGroupChecked,
    isRegionGroupIndeterminate,
    toggleRegion,
    submitLoading,
    handleSubmit,
  };
}
