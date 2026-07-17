<template>
  <main class="no-data-auth">
    <section class="no-data-auth__content">
      <header class="page-title">
        <h1>您没有当前页面的数据权限</h1>
        <el-tooltip :content="permissionTooltip" placement="right">
          <el-icon class="page-title__icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </header>

      <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="handleStatusChange">
        <el-tab-pane label="未拥有" name="waiting" />
        <el-tab-pane label="已拥有" name="owned" />
        <el-tab-pane label="审批中" name="approving" />
      </el-tabs>

      <section v-if="activeStatus === 'owned'" class="owned-auth">
        <div class="owned-section">
          <h2 class="owned-section__title">云服务</h2>
          <div class="owned-list">
            <button
              v-for="cloudServer in ownedCloudServers"
              :key="cloudServer.code"
              class="owned-card"
              type="button"
            >
              <span class="owned-card__name">
                <FourGridIcon />
                {{ isCxoRoleSelected ? cloudServer.name : cloudServer.code }}
              </span>
              <span class="owned-card__meta" />
            </button>
          </div>
        </div>

        <div class="owned-section">
          <h2 class="owned-section__title">{{ secondaryPermissionLabel }}</h2>
          <div class="owned-list owned-list--region">
            <button
              v-for="permission in ownedSecondaryPermissions"
              :key="permission.code"
              class="owned-card"
              type="button"
            >
              <span class="owned-card__name">
                <FourGridIcon />
                {{ permission.name }}
              </span>
              <span class="owned-card__meta" />
            </button>
          </div>
        </div>

      </section>

      <section v-else-if="activeStatus === 'approving'" class="approving-table">
        <el-table :data="approvingRows" class="approving-table__inner">
          <el-table-column prop="index" label="序号" min-width="90" sortable />
          <el-table-column prop="user" label="申请人" min-width="160" sortable />
          <el-table-column prop="order" label="工单号" min-width="220" sortable />
          <el-table-column prop="title" label="工单标题" min-width="260" sortable />
          <el-table-column prop="status" label="状态" min-width="160" sortable />
          <el-table-column prop="approver" label="当前处理人" min-width="220" sortable />
        </el-table>
      </section>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        class="apply-form"
        label-position="top"
      >
        <el-form-item prop="cloudServerCodes" required>
          <template #label>
            <span class="form-item-title">
              <span>云服务</span>
              <span class="form-item-title__meta">审批人：{{ cloudServerApprover }}</span>
            </span>
          </template>
          <div class="service-grid">
            <button
              v-for="cloudServer in unownedCloudServers"
              :key="cloudServer.code"
              class="resource-card"
              :class="{ 'resource-card--active': form.cloudServerCodes.includes(cloudServer.code) }"
              type="button"
              @click="toggleCloudServer(cloudServer.code)"
            >
              <span class="resource-card__name">
                <span class="resource-card__checkbox" aria-hidden="true" />
                <FourGridIcon />
                {{ isCxoRoleSelected ? cloudServer.name : cloudServer.code }}
              </span>
              <span class="resource-card__meta" />
            </button>
          </div>
        </el-form-item>

        <el-form-item
          :label="secondaryPermissionLabel"
          :prop="secondaryPermissionField"
          required
        >
          <div v-if="isCxoRoleSelected" class="service-grid">
            <button
              v-for="dataType in unownedDataTypes"
              :key="dataType.code"
              class="resource-card"
              :class="{ 'resource-card--active': form.dataTypeCodes.includes(dataType.code) }"
              type="button"
              @click="toggleDataType(dataType.code)"
            >
              <span class="resource-card__name">
                <span class="resource-card__checkbox" aria-hidden="true" />
                <FourGridIcon />
                {{ dataType.name }}
              </span>
              <span class="resource-card__meta" />
            </button>
          </div>
          <section v-if="!isCxoRoleSelected" class="region-panel">
            <div class="region-toolbar">
              <label class="region-toolbar__label">大区</label>
              <el-select v-model="areaFilter" class="region-toolbar__select" @change="handleAreaChange">
                <el-option label="全部" value="all" />
                <el-option
                  v-for="area in areaOptions"
                  :key="area"
                  :label="area"
                  :value="area"
                />
              </el-select>
              <el-input
                v-model="keyword"
                class="region-toolbar__search"
                placeholder="请输入Region名称"
                clearable
                @input="handleKeywordChange"
              >
                <template #suffix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-scrollbar class="region-scroll">
              <button
                class="region-select-all"
                type="button"
                @click="toggleAllRegions"
              >
                <span
                  class="resource-card__checkbox"
                  :class="{
                    'resource-card__checkbox--checked': isAllRegionsChecked,
                    'resource-card__checkbox--indeterminate': isAllRegionsIndeterminate,
                  }"
                  aria-hidden="true"
                />
                全部Region
              </button>
              <div
                v-for="group in visibleRegionGroups"
                :key="group.code"
                class="region-group"
              >
                <div class="region-group__title">
                  <button
                    class="region-group__arrow"
                    :class="{ 'region-group__arrow--open': openedGroups.includes(group.code) }"
                    type="button"
                    @click="toggleGroup(group.code)"
                  >
                    ›
                  </button>
                  <button
                    class="region-group__checkbox-button"
                    type="button"
                    @click="toggleRegionGroup(group)"
                  >
                    <span
                      class="resource-card__checkbox"
                      :class="{
                        'resource-card__checkbox--checked': isRegionGroupChecked(group),
                        'resource-card__checkbox--indeterminate': isRegionGroupIndeterminate(group),
                      }"
                      aria-hidden="true"
                    />
                  </button>
                  {{ group.name }}
                </div>
                <div
                  v-if="openedGroups.includes(group.code)"
                  class="region-grid"
                >
                  <button
                    v-for="region in group.children"
                    :key="region.code"
                    class="resource-card resource-card--region"
                    :class="{ 'resource-card--active': form.regionCodes.includes(region.code) }"
                    type="button"
                    @click="toggleRegion(region.code)"
                  >
                    <span class="resource-card__name">
                      <span class="resource-card__checkbox" aria-hidden="true" />
                      <FourGridIcon />
                      {{ region.name }}
                    </span>
                    <span class="resource-card__meta" />
                  </button>
                </div>
              </div>
            </el-scrollbar>
          </section>
        </el-form-item>

        <el-form-item label="申请原因" prop="reason" required>
          <div class="reason-input">
            <el-input
              v-model="form.reason"
              maxlength="200"
              placeholder="请输入申请原因"
            />
            <span class="reason-input__count">{{ form.reason.length }} / 200</span>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button class="quick-apply-button" :loading="submitLoading" @click="handleSubmit">
            快捷申请
          </el-button>
          <el-button class="back-button" @click="handleBack">
            返回
          </el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>

<script setup>
import { computed, h, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { QuestionFilled, Search } from "@element-plus/icons-vue";
import {
  createNoDataAuth,
  getNoDataAuthList,
  getNoDataAuthOptions,
} from "@/api/noDataAuth";
import {
  getCurrentRoleRequestConfig,
  isCxoRole,
  selectedRoleValue,
} from '@/config/role';

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
const areaFilter = ref("all");
const formRef = ref();
const keyword = ref("");
const openedGroups = ref([]);
const unownedCloudServers = ref([]);
const unownedRegionGroups = ref([]);
const ownedCloudServers = ref([]);
const ownedRegions = ref([]);
const ownedDataTypes = ref([]);
const unownedDataTypes = ref([]);
const approvingRows = ref([]);
const submitLoading = ref(false);

const form = reactive({
  cloudServerCodes: [],
  regionCodes: [],
  dataTypeCodes: [],
  reason: "",
});

const rules = {
  cloudServerCodes: [{ required: true, message: "请选择云服务", trigger: "change" }],
  regionCodes: [{ required: true, message: "请选择Region", trigger: "change" }],
  dataTypeCodes: [{ required: true, message: "请选择数据类型", trigger: "change" }],
  reason: [{ required: true, message: "请输入申请原因", trigger: "blur" }],
};

const areaOptions = computed(() => unownedRegionGroups.value.map((group) => group.name));
const allRegionCodes = computed(() =>
  unownedRegionGroups.value.flatMap((group) => group.children.map((region) => region.code))
);
const cloudServerApprover = computed(() => ownedCloudServers.value[0]?.userName);
const isCxoRoleSelected = computed(() => isCxoRole(selectedRoleValue.value));
const secondaryPermissionLabel = computed(() => {
  return isCxoRoleSelected.value ? '数据类型' : 'Region';
});
const secondaryPermissionField = computed(() => {
  return isCxoRoleSelected.value ? 'dataTypeCodes' : 'regionCodes';
});
const permissionTooltip = computed(() => {
  return `可选择云服务和 ${secondaryPermissionLabel.value} 后发起权限申请`;
});
const ownedSecondaryPermissions = computed(() => {
  return isCxoRoleSelected.value ? ownedDataTypes.value : ownedRegions.value;
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
    if (areaFilter.value === "all") {
      return true;
    }

    return group.name === areaFilter.value;
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

const createRegionNameMap = (regionGroups) => {
  return new Map(
    regionGroups.flatMap((group) => {
      return group.children.map((region) => [region.code, region.name]);
    })
  );
};

const initializeDefaultSelection = () => {
  if (isCxoRoleSelected.value) {
    const selectedCxoCloudCodeSet = new Set(parseQueryCodes(route.query.cxoCloudCodes));
    const selectedDataTypeCodeSet = new Set(parseQueryCodes(route.query.dataTypeCodes));

    form.cloudServerCodes = unownedCloudServers.value
      .map((cloudServer) => cloudServer.code)
      .filter((code) => selectedCxoCloudCodeSet.has(code));
    form.dataTypeCodes = unownedDataTypes.value
      .map((dataType) => dataType.code)
      .filter((code) => selectedDataTypeCodeSet.has(code));
    form.regionCodes = [];
    return;
  }

  const selectedRegionCodeSet = new Set(parseQueryCodes(route.query.regionCodes));

  // 从权限卡片跳转过来时，用 regionCode 与申请页可申请 Region 做匹配。
  form.regionCodes = allRegionCodes.value.filter((code) => selectedRegionCodeSet.has(code));
  form.cloudServerCodes = unownedCloudServers.value.map((cloudServer) => cloudServer.code);
};

const loadOptions = async () => {
  const response = await getNoDataAuthOptions(getCurrentRoleRequestConfig());
  const optionData = response.data;

  if (optionData === null || Array.isArray(optionData)) {
    // 后端业务状态异常时 HTTP 仍为 200，页面按空权限数据展示。
    unownedCloudServers.value = [];
    unownedRegionGroups.value = [];
    ownedCloudServers.value = [];
    ownedRegions.value = [];
    ownedDataTypes.value = [];
    unownedDataTypes.value = [];
    openedGroups.value = [];
    return;
  }

  const cloudServerDimensionCode = isCxoRoleSelected.value ? '6' : '4';
  const cloudServerDimension = optionData.totalDimenPermConfigList.find(
    (dimension) => dimension.permDimenTypeCode === cloudServerDimensionCode
  );

  if (isCxoRoleSelected.value) {
    const dataTypeDimension = optionData.totalDimenPermConfigList.find(
      (dimension) => dimension.permDimenTypeCode === '3'
    );
    const ownedCxoCloudCodeSet = new Set(
      Object.entries(optionData.dataTypeCodeMap)
        .filter(([, dataTypeList]) => dataTypeList.length > 0)
        .map(([cloudCode]) => cloudCode)
    );
    const ownedDataTypeCodeSet = new Set(
      Object.values(optionData.dataTypeCodeMap)
        .flatMap((dataTypeList) => dataTypeList.map((dataType) => dataType.code))
    );

    ownedCloudServers.value = cloudServerDimension.detailList
      .filter((item) => ownedCxoCloudCodeSet.has(item.permCode))
      .map((item) => ({
        code: item.permCode,
        name: item.permName,
        userName: optionData.dataTypeCodeMap[item.permCode][0].userName,
      }));
    unownedCloudServers.value = cloudServerDimension.detailList
      .filter((item) => !ownedCxoCloudCodeSet.has(item.permCode))
      .map((item) => ({ code: item.permCode, name: item.permName }));
    ownedDataTypes.value = dataTypeDimension.detailList
      .filter((item) => ownedDataTypeCodeSet.has(item.permCode))
      .map((item) => ({ code: item.permCode, name: item.permName }));
    unownedDataTypes.value = dataTypeDimension.detailList
      .filter((item) => !ownedDataTypeCodeSet.has(item.permCode))
      .map((item) => ({ code: item.permCode, name: item.permName }));
    unownedRegionGroups.value = [];
    ownedRegions.value = [];
    openedGroups.value = [];
    initializeDefaultSelection();
    return;
  }

  ownedDataTypes.value = [];
  unownedDataTypes.value = [];
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
  validateField("cloudServerCodes");
};

const toggleRegion = (code) => {
  form.regionCodes = toggleById(form.regionCodes, code);
  validateField("regionCodes");
};

const toggleDataType = (code) => {
  form.dataTypeCodes = toggleById(form.dataTypeCodes, code);
  validateField("dataTypeCodes");
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

const handleAreaChange = () => {
  openedGroups.value = visibleRegionGroups.value.map((group) => group.code);
};

const handleKeywordChange = () => {
  openedGroups.value = visibleRegionGroups.value.map((group) => group.code);
};

const resetForm = () => {
  form.cloudServerCodes = [];
  form.regionCodes = [];
  form.dataTypeCodes = [];
  form.reason = "";
  formRef.value.clearValidate();
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitLoading.value = true;

  try {
    const payload = {
      userId: "12345678",
      tenant: "",
      description: form.reason,
      dataRoleList: [
        ...form.cloudServerCodes,
        ...(isCxoRoleSelected.value ? form.dataTypeCodes : form.regionCodes),
      ].map((dataRoleId) => ({
        dataRoleId,
        validityPeriod: "2027-10-31",
      })),
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

const handleBack = () => {
  router.back();
};

watch(selectedRoleValue, async () => {
  // 角色首次确定或切换后，需要按最新角色重新获取页面权限数据。
  await Promise.all([loadOptions(), loadApprovingRows()]);
}, { immediate: true });
</script>

<style lang="less" scoped>
.no-data-auth {
  min-height: 100vh;
  padding: 56px 96px;
  overflow-x: hidden;
  background: #f7f8fc;
}

.no-data-auth__content {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
}

.page-title h1 {
  margin: 0;
  color: #2f3555;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.page-title__icon {
  color: #59607d;
  cursor: help;
}

.status-tabs {
  margin-bottom: 12px;
}

.apply-form {
  padding-bottom: 28px;
}

.form-item-title {
  display: inline-flex;
  align-items: center;
  gap: 18px;
}

.form-item-title__meta {
  color: #8a90a8;
  font-size: 14px;
  font-weight: 500;
}

.owned-auth {
  padding-bottom: 28px;
}

.owned-section + .owned-section {
  margin-top: 26px;
}

.approving-table {
  padding-top: 18px;
}

.approving-table__inner {
  width: 100%;
  background: transparent;
}

.approving-table :deep(.el-table__header th) {
  color: #515873;
  background: #f3f5fb;
  font-size: 16px;
  font-weight: 700;
}

.approving-table :deep(.el-table__header .cell) {
  line-height: 32px;
}

.approving-table :deep(.el-table__header th.el-table__cell) {
  padding: 2px 0;
}

.approving-table :deep(.el-table__cell) {
  border-bottom: 0;
}

.approving-table :deep(.el-table__empty-block) {
  min-height: 120px;
}

.approving-table :deep(.el-table__empty-text) {
  color: #7e849b;
  font-size: 16px;
}

.approving-table :deep(.el-table::before) {
  display: none;
}

.owned-section__title {
  margin: 0 0 14px;
  color: #2f3555;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.owned-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.owned-list--region {
  max-height: 364px;
  padding-right: 8px;
  overflow-y: auto;
}

.owned-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 0 18px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  color: #3c4264;
  background: #fff;
  cursor: pointer;
}

.owned-card__name {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.owned-card__meta {
  color: #8a90a8;
  font-size: 14px;
  white-space: nowrap;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  width: 100%;
}

.resource-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  color: #3c4264;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.resource-card:hover,
.resource-card--active {
  border-color: #4865d9;
  color: #3150cc;
  box-shadow: 0 0 0 1px rgba(72, 101, 217, 0.16);
}

.resource-card__name {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-weight: 600;
  white-space: nowrap;
}

.four-grid-icon {
  display: inline-grid;
  grid-template-columns: repeat(2, 6px);
  gap: 1px;
  color: #4865d9;
}

.four-grid-icon :deep(span) {
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: currentColor;
}

.resource-card__checkbox {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid #b8bfd6;
  border-radius: 2px;
  background: #fff;
}

.resource-card--active .resource-card__checkbox {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card__checkbox--checked {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card--active .resource-card__checkbox::after,
.resource-card__checkbox--checked::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  content: "";
  transform: translate(-50%, -58%) rotate(45deg);
}

.resource-card__checkbox--indeterminate {
  border-color: #4865d9;
  background: #4865d9;
}

.resource-card__checkbox--indeterminate::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 2px;
  background: #fff;
  content: "";
  transform: translate(-50%, -50%);
}

.resource-card__meta {
  color: #8a90a8;
  font-size: 13px;
  white-space: nowrap;
}

.region-panel {
  width: 100%;
  padding: 18px 0 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.region-toolbar {
  display: grid;
  grid-template-columns: auto 160px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 0 18px 16px;
}

.region-toolbar__label {
  color: #4a506e;
  font-weight: 600;
}

.region-toolbar__select {
  width: 160px;
}

.region-toolbar__search {
  min-width: 0;
  width: 100%;
}

.region-scroll {
  height: 360px;
  padding: 0 18px;
}

.region-select-all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  padding: 0;
  border: 0;
  color: #4a506e;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}

.region-group + .region-group {
  margin-top: 12px;
}

.region-select-all + .region-group {
  margin-top: 12px;
}

.region-group__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0;
  color: #4a506e;
  font-weight: 600;
}

.region-group__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  color: #6e7490;
  background: transparent;
  cursor: pointer;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.region-group__arrow--open {
  transform: rotate(90deg);
}

.region-group__checkbox-button {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 22px;
  padding: 10px 0 12px 28px;
}

.resource-card--region {
  justify-content: flex-start;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
}

.reason-input {
  position: relative;
  width: 100%;
}

.reason-input :deep(.el-input__wrapper) {
  padding-right: 72px;
}

.reason-input__count {
  position: absolute;
  top: 50%;
  right: 12px;
  color: #909399;
  font-size: 12px;
  line-height: 1;
  transform: translateY(-50%);
}

.quick-apply-button {
  width: 96px;
  height: 34px;
  border-color: #4865d9;
  color: #fff;
  background: #4865d9;
}

.quick-apply-button:hover,
.quick-apply-button:focus {
  border-color: #4865d9;
  color: #fff;
  background: #4865d9;
}

.back-button {
  width: 96px;
  height: 34px;
  border-color: #d4d8e8;
  color: #4a5270;
  background: #fff;
}

:deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  min-width: 96px;
  height: 34px;
  padding: 0 20px !important;
  box-sizing: border-box;
  justify-content: center;
  color: #4f5570;
  background: #f1f3fa;
  font-weight: 600;
  line-height: 34px;
  text-align: center;
}

:deep(.el-tabs__item:first-child),
:deep(.el-tabs__item:last-child) {
  padding: 0 20px !important;
}

:deep(.el-tabs__item.is-active) {
  color: #fff;
  background: #4865d9;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-form-item__label) {
  color: #2f3555;
  font-size: 18px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .no-data-auth {
    padding: 40px 24px;
  }

  .owned-card {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
  }

  .owned-card__meta {
    white-space: normal;
  }

  .service-grid,
  .region-grid {
    grid-template-columns: 1fr;
  }

  .resource-card {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-height: 64px;
  }

  .resource-card__meta {
    white-space: normal;
  }
}
</style>
