<template>
  <section :class="['role-permission-card', { 'role-permission-card--compact': compact }]">
    <header class="card-header">
      <h1>请选择你的角色</h1>
    </header>

    <div class="role-list">
      <button
        v-for="role in roles"
        :key="role.value"
        :class="[
          'role-option',
          {
            'role-option--active': selectedRole === role.value,
            'role-option--disabled': role.disabled
          }
        ]"
        :disabled="role.disabled"
        type="button"
        @click="handleRoleClick(role)"
      >
        <span class="role-avatar-wrap">
          <img class="role-avatar" :src="role.avatar" :alt="role.label">
          <span v-if="selectedRole === role.value" class="role-check">
            <el-icon><Check /></el-icon>
          </span>
        </span>
        <span class="role-label">{{ role.label }}</span>
      </button>
    </div>

    <section v-if="isCxoRoleSelected" class="permission-section">
      <h2>数据权限</h2>
      <p class="section-label">云服务</p>

      <div class="permission-block permission-block--owned">
        <p class="permission-summary">已拥有云服务权限数量：{{ ownedCxoClouds.length }}个</p>
        <div v-if="ownedCxoClouds.length > 0" class="cloud-list">
          <article
            v-for="cloudServer in ownedCxoClouds"
            :key="cloudServer.value"
            class="cloud-card cloud-card--active"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="cloudServer.iconName" />
            <strong>{{ cloudServer.label }}</strong>
          </article>
        </div>
      </div>

      <div v-if="unavailableCxoClouds.length > 0" class="permission-block">
        <div class="permission-status">
          <p>未拥有云服务权限数量：{{ unavailableCxoClouds.length }}个</p>
          <p>已选择数量：{{ selectedCxoCloudCodes.length }}个</p>
        </div>
        <div class="cloud-list">
          <label
            v-for="cloudServer in unavailableCxoClouds"
            :key="cloudServer.value"
            class="cloud-card cloud-card--selectable"
            :class="{ 'cloud-card--selected': selectedCxoCloudCodes.includes(cloudServer.value) }"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="cloudServer.iconName" />
            <strong>{{ cloudServer.label }}</strong>
            <input
              v-model="selectedCxoCloudCodes"
              type="checkbox"
              :value="cloudServer.value"
          >
          </label>
        </div>
      </div>

      <p class="section-label section-label--data-type">数据类型</p>
      <div class="permission-block permission-block--owned">
        <p class="permission-summary">已拥有数据类型权限数量：{{ ownedDataTypes.length }}个</p>
        <div v-if="ownedDataTypes.length > 0" class="data-type-grid">
          <article
            v-for="dataType in ownedDataTypes"
            :key="dataType.value"
            class="data-type-card data-type-card--owned"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="dataType.iconName" />
            <strong>{{ dataType.label }}</strong>
          </article>
        </div>
      </div>

      <div v-if="unavailableDataTypes.length > 0" class="permission-block">
        <div class="permission-status">
          <p>未拥有数据类型权限数量：{{ unavailableDataTypes.length }}个</p>
          <p>已选择数量：{{ selectedDataTypeCodes.length }}个</p>
        </div>
        <div class="data-type-grid">
          <label
            v-for="dataType in unavailableDataTypes"
            :key="dataType.value"
            class="data-type-card data-type-card--selectable"
            :class="{ 'data-type-card--selected': selectedDataTypeCodes.includes(dataType.value) }"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="dataType.iconName" />
            <strong>{{ dataType.label }}</strong>
            <input
              v-model="selectedDataTypeCodes"
              type="checkbox"
              :value="dataType.value"
            >
          </label>
        </div>
      </div>
    </section>

    <section v-else-if="showPermissionSection" class="permission-section">
      <h2>数据权限</h2>
      <p class="section-label">云服务</p>
      <div class="cloud-list">
        <article
          v-for="cloudServer in allCloudServerPermissionList"
          :key="cloudServer.value"
          :class="[
            'cloud-card',
            { 'cloud-card--active': ownedCloudServerCodes.includes(cloudServer.value) }
          ]"
        >
          <SvgIcon class="permission-svg-icon" :icon-name="cloudServer.iconName" />
          <strong>{{ cloudServer.label }}</strong>
        </article>
      </div>

      <div class="region-block region-block--owned">
        <p class="region-summary">已拥有Region权限数量：{{ ownedRegions.length }}个</p>
        <div v-if="ownedRegions.length > 0" class="region-grid">
          <span
            v-for="region in ownedRegions"
            :key="region.value"
            class="region-item region-item--owned"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="region.iconName" />
            {{ region.label }}
          </span>
        </div>
        <p v-else class="empty-message">你没有当前页面的数据权限，请勾选下方Region申请数据权限。</p>
      </div>

      <div v-if="unavailableRegions.length > 0" class="region-block region-block--unavailable">
        <div class="region-status">
          <p>未拥有Region权限数量：{{ unavailableRegions.length }}个</p>
          <p>已选择Region数量：{{ selectedRegionCodes.length }}个</p>
        </div>
        <div class="region-grid">
          <label
            v-for="region in unavailableRegions"
            :key="region.value"
            class="region-item region-item--selectable"
            :class="{ 'region-item--selected': selectedRegionCodes.includes(region.value) }"
          >
            <SvgIcon class="permission-svg-icon" :icon-name="region.iconName" />
            <input
              v-model="selectedRegionCodes"
              type="checkbox"
              :value="region.value"
            >
            <span>{{ region.label }}</span>
          </label>
        </div>
      </div>
    </section>

    <footer class="action-row">
      <button
        v-if="showApplyButton"
        class="secondary-button"
        type="button"
        @click="handlePermissionApply"
      >
        数据权限申请
      </button>
      <button
        v-if="showStartButton"
        class="primary-button"
        type="button"
        @click="handleStart"
      >
        立即体验
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Check } from "@element-plus/icons-vue";
import SvgIcon from '@/components/SvgIcon.vue';
import {
  allCxoCloudPermissionList,
  allCloudServerPermissionList,
  allDataTypePermissionList,
  allRegionPermissionList,
  canEnterRolePage,
  cloudServerPermissionList,
  cxoDataTypePermissionMap,
  isCxoRole,
  regionPermissionList,
  roles,
  selectedRoleValue,
} from "@/config/role";

const props = defineProps({
  compact: Boolean,
  immediateRoleChange: Boolean,
  returnTo: String,
  returnRole: String,
});

const emit = defineEmits(["role-change", "start"]);
const router = useRouter();
const selectedRole = ref("");
const selectedRegionCodes = ref([]);
const selectedCxoCloudCodes = ref([]);
const selectedDataTypeCodes = ref([]);

const ownedRegionCodes = computed(() => {
  return regionPermissionList.map((region) => region.code);
});

const ownedCloudServerCodes = computed(() => {
  return cloudServerPermissionList.map((cloudServer) => cloudServer.code);
});

const ownedRegions = computed(() => {
  return allRegionPermissionList.filter((region) => {
    return ownedRegionCodes.value.includes(region.value);
  });
});

const unavailableRegions = computed(() => {
  return allRegionPermissionList.filter((region) => {
    return !ownedRegionCodes.value.includes(region.value);
  });
});

const isCxoRoleSelected = computed(() => isCxoRole(selectedRole.value));

const ownedCxoClouds = computed(() => {
  return allCxoCloudPermissionList.filter((cloudServer) => {
    return cxoDataTypePermissionMap[cloudServer.value].length > 0;
  });
});

const unavailableCxoClouds = computed(() => {
  return allCxoCloudPermissionList.filter((cloudServer) => {
    return cxoDataTypePermissionMap[cloudServer.value].length === 0;
  });
});

const ownedDataTypeCodes = computed(() => {
  return Array.from(new Set(
    Object.values(cxoDataTypePermissionMap).flatMap((dataTypeList) => {
      return dataTypeList.map((dataType) => dataType.code);
    }),
  ));
});

const ownedDataTypes = computed(() => {
  return allDataTypePermissionList.filter((dataType) => {
    return ownedDataTypeCodes.value.includes(dataType.value);
  });
});

const unavailableDataTypes = computed(() => {
  return allDataTypePermissionList.filter((dataType) => {
    return !ownedDataTypeCodes.value.includes(dataType.value);
  });
});

const showPermissionSection = computed(() => {
  return Boolean(selectedRole.value);
});

const showApplyButton = computed(() => {
  if (isCxoRoleSelected.value) {
    return selectedCxoCloudCodes.value.length > 0 || selectedDataTypeCodes.value.length > 0;
  }

  return showPermissionSection.value && selectedRegionCodes.value.length > 0;
});

const showStartButton = computed(() => {
  return Boolean(selectedRole.value) && canEnterRolePage(selectedRole.value);
});

const syncSelectedRole = () => {
  const currentRole = roles.find((role) => role.value === selectedRoleValue.value);
  if (currentRole && !currentRole.disabled) {
    selectedRole.value = currentRole.value;
    return;
  }

  const firstEnabledRole = roles.find((role) => !role.disabled);
  if (firstEnabledRole) {
    selectedRole.value = firstEnabledRole.value;
  }
};

const handleRoleClick = (role) => {
  if (role.disabled) {
    return;
  }

  selectedRole.value = role.value;
  selectedRegionCodes.value = [];
  selectedCxoCloudCodes.value = [];
  selectedDataTypeCodes.value = [];

  if (props.immediateRoleChange) {
    emit("role-change", role.value);
  }
};

const handleStart = () => {
  emit("start", selectedRole.value);
};

const getReturnQuery = () => {
  const returnQuery = {};

  if (props.returnTo) {
    returnQuery.returnTo = props.returnTo;
  }

  if (props.returnRole) {
    returnQuery.returnRole = props.returnRole;
  }

  return returnQuery;
};

const handlePermissionApply = () => {
  if (isCxoRoleSelected.value) {
    router.push({
      path: "/Unauthorized",
      query: {
        ...getReturnQuery(),
        cxoCloudCodes: selectedCxoCloudCodes.value.join(","),
        dataTypeCodes: selectedDataTypeCodes.value.join(","),
      },
    });
    return;
  }

  router.push({
    path: "/Unauthorized",
    query: {
      ...getReturnQuery(),
      regionCodes: selectedRegionCodes.value.join(","),
    },
  });
};

watch(
  [() => roles.length, selectedRoleValue],
  () => {
    syncSelectedRole();
  },
  { immediate: true },
);
</script>

<style scoped lang="less">
.role-permission-card {
  width: min(100%, 960px);
  max-height: calc(100vh - 64px);
  padding: 34px 42px 30px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 46px rgba(69, 65, 112, 0.16);
  color: #25225c;
  box-sizing: border-box;
}

.card-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;

  h1 {
    margin: 0;
    font-size: 22px;
    line-height: 30px;
    font-weight: 800;
    letter-spacing: 0;
  }
}

.role-list {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px 42px;
  margin-bottom: 30px;
}

.role-option {
  width: 76px;
  border: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #28245f;
  font: inherit;
  cursor: pointer;
}

.role-option--disabled {
  color: rgba(40, 36, 95, 0.32);
  cursor: not-allowed;

  .role-avatar-wrap {
    opacity: 0.38;
  }
}

.role-avatar-wrap {
  position: relative;
  width: 54px;
  height: 54px;
  padding: 3px;
  border: 2px solid transparent;
  border-radius: 50%;
  box-sizing: border-box;
}

.role-option--active .role-avatar-wrap {
  border-color: #3f5cff;
  box-shadow: 0 8px 18px rgba(63, 92, 255, 0.22);
}

.role-avatar {
  width: 44px;
  height: 44px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.role-check {
  position: absolute;
  right: -1px;
  bottom: 1px;
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3f5cff;
  color: #ffffff;
  box-sizing: border-box;

  .el-icon {
    font-size: 12px;
  }
}

.role-label {
  max-width: 100%;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-section {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  h2 {
    flex-shrink: 0;
    margin: 0 0 12px;
    font-size: 18px;
    line-height: 26px;
    font-weight: 800;
    letter-spacing: 0;
  }
}

.section-label {
  flex-shrink: 0;
  margin: 0 0 10px;
  color: rgba(37, 34, 92, 0.66);
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}

.section-label--data-type {
  margin-top: 4px;
}

.permission-block {
  flex-shrink: 0;
}

.permission-block--owned {
  margin-bottom: 14px;
}

.permission-summary,
.permission-status {
  margin: 0 0 10px;
  color: rgba(37, 34, 92, 0.72);
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
}

.permission-status {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  p {
    margin: 0;
  }
}

.cloud-list {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 22px;
}

.cloud-card {
  height: 52px;
  padding: 0 22px;
  border: 1px solid rgba(58, 50, 115, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.62);
  color: #28245f;
  box-sizing: border-box;

  strong {
    font-size: 15px;
    line-height: 20px;
    font-weight: 800;
  }
}

.cloud-card--active {
  border-color: rgba(63, 92, 255, 0.36);
  background: rgba(247, 248, 255, 0.96);
}

.cloud-card--selectable,
.data-type-card--selectable {
  cursor: pointer;

  input {
    width: 15px;
    height: 15px;
    margin: 0 0 0 auto;
    accent-color: #3f5cff;
  }
}

.cloud-card--selected,
.data-type-card--selected {
  border-color: #3f5cff;
  background: #f2f4ff;
  color: #253bc2;
}

.permission-svg-icon {
  flex-shrink: 0;
  color: #40329c;
  fill: currentColor;
}

.data-type-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-bottom: 14px;
}

.data-type-card {
  min-width: 0;
  height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(58, 50, 115, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.62);
  color: #28245f;
  box-sizing: border-box;
}

.data-type-card--owned {
  border-color: rgba(63, 92, 255, 0.28);
  background: rgba(247, 248, 255, 0.96);
}

.region-block {
  min-height: 0;
  margin-top: 16px;
}

.region-block--owned {
  flex-shrink: 0;
}

.region-block--unavailable {
  flex: 1;
}

.region-summary,
.region-status,
.empty-message {
  margin: 0 0 12px;
  color: rgba(37, 34, 92, 0.72);
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
}

.empty-message {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(37, 34, 92, 0.32);
  font-weight: 600;
  text-align: center;
}

.region-status {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  p {
    margin: 0;
  }
}

.region-grid {
  max-height: 69px;
  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px 16px;
}

.region-item {
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: #353072;
  background: rgba(246, 244, 255, 0.78);
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  box-sizing: border-box;
}

.region-item--selectable {
  gap: 6px;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
  color: #a8abb2;

  input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: #3f5cff;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.region-item--selected {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.region-item--owned {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-row {
  flex-shrink: 0;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.primary-button,
.secondary-button {
  min-width: 96px;
  height: 34px;
  border-radius: 5px;
  padding: 0 18px;
  font-size: 14px;
  line-height: 32px;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2f4fd4;
  background: #253bc2;
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(37, 59, 194, 0.2);
}

.secondary-button {
  border: 1px solid rgba(47, 79, 212, 0.32);
  background: #ffffff;
  color: #253bc2;
}

.role-permission-card--compact {
  width: 520px;
  max-width: calc(100vw - 32px);
  max-height: 620px;
  padding: 20px;
  border-radius: 8px;

  .card-header {
    margin-bottom: 18px;

    h1 {
      font-size: 18px;
      line-height: 24px;
    }
  }

  .role-list {
    gap: 14px 22px;
    margin-bottom: 22px;
  }

  .role-option {
    width: 64px;
  }

  .role-avatar-wrap {
    width: 46px;
    height: 46px;
  }

  .role-avatar {
    width: 36px;
    height: 36px;
  }

  .role-label,
  .cloud-card strong,
  .region-item {
    font-size: 12px;
  }

  .cloud-card {
    height: 42px;
    padding: 0 12px;
  }

  .data-type-card {
    height: 40px;
    padding: 0 12px;
  }

  .region-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: 106px;
    gap: 8px;
  }
}

@media (max-width: 720px) {
  .role-permission-card {
    padding: 24px 18px;
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .role-list {
    gap: 18px 20px;
  }

  .cloud-list,
  .data-type-grid,
  .region-grid {
    grid-template-columns: 1fr;
  }

  .region-status,
  .action-row {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>
