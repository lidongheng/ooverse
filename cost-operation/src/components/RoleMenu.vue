<template>
  <div ref="roleMenuRef" class="role-card-entry">
    <button
      v-if="selectedRole"
      ref="roleAvatarButtonRef"
      class="role-avatar-button"
      type="button"
      aria-label="切换角色"
      @click.stop="toggleRoleCard"
    >
      <img
        class="role-avatar-image"
        :src="selectedRole.avatar"
        :alt="selectedRole.label"
      >
      <span class="role-avatar-name">{{ selectedRole.label }}</span>
    </button>
    <Teleport to="body">
      <RolePermissionGuide
        v-if="selectedRole && roleGuidePageKey"
        :key="roleGuidePageKey"
        ref="rolePermissionGuideRef"
        :page-key="roleGuidePageKey"
        :get-anchor-element="getRoleAvatarElement"
        @avatar-click="toggleRoleCard"
      />
    </Teleport>
    <div v-if="showRoleCard" class="role-card-popover" @click.stop>
      <RolePermissionCard
        compact
        immediate-role-change
        @role-change="handleRoleSelection"
        @start="handleStart"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import RolePermissionGuide from '@/components/RolePermissionGuide.vue';
import { getPermissionConfig } from "@/api/role";
import {
  canEnterRolePage,
  getCurrentRoleRequestConfig,
  getRoleTargetPath,
  initializePermissionConfig,
  isRoleDisabled,
  ROLE_CODE_ORDER,
  rolePermissionList,
  roles,
  saveSelectedRole,
  selectedRoleValue,
  syncSelectedRoleFromSession,
} from "@/config/role";

const ROLE_GUIDE_PAGE_KEY_MAP = {
  home: 'costOperation',
  saleHome: 'saleHome',
};

const route = useRoute();
const router = useRouter();
const showRoleCard = ref(false);
const roleMenuRef = ref(null);
const roleAvatarButtonRef = ref(null);
const rolePermissionGuideRef = ref(null);
let permissionRequestId = 0;
let pendingPermissionRequest = Promise.resolve();

const roleGuidePageKey = computed(() => {
  return ROLE_GUIDE_PAGE_KEY_MAP[route.name];
});

const selectedRole = computed(() => {
  return roles.find((role) => role.value === selectedRoleValue.value);
});

const getRoleAvatarElement = () => {
  return roleAvatarButtonRef.value;
};

const toggleRoleCard = () => {
  if (rolePermissionGuideRef.value) {
    rolePermissionGuideRef.value.closeGuide();
  }

  showRoleCard.value = !showRoleCard.value;
};

const closeRoleCard = (event) => {
  // 下拉卡片打开后，点击组件外部需要收起，避免遮挡页面主内容。
  if (!showRoleCard.value) {
    return;
  }

  if (roleMenuRef.value?.contains(event.target)) {
    return;
  }

  showRoleCard.value = false;
};

const refreshRolePermission = async (roleValue) => {
  saveSelectedRole(roleValue);
  const requestId = ++permissionRequestId;
  const permissionResponse = await getPermissionConfig(getCurrentRoleRequestConfig());

  if (requestId !== permissionRequestId) {
    return;
  }

  initializePermissionConfig(permissionResponse.data, roleValue);
};

const handleRoleSelection = (roleValue) => {
  pendingPermissionRequest = refreshRolePermission(roleValue);
};

const handleStart = async (roleValue) => {
  await pendingPermissionRequest;
  showRoleCard.value = false;

  if (canEnterRolePage(roleValue)) {
    router.push(getRoleTargetPath(roleValue));
    return;
  }

  router.push("/Unauthorized");
};

const initializeRoleMenuData = async () => {
  syncSelectedRoleFromSession();

  if (selectedRoleValue.value && roles.length > 0) {
    return;
  }

  // 刷新业务页面时不会经过 RoleSelect，需要在 Header 内补齐共享权限数据。
  const requestedRoleValue = selectedRoleValue.value;
  const permissionResponse = await getPermissionConfig(getCurrentRoleRequestConfig());
  initializePermissionConfig(permissionResponse.data, requestedRoleValue);

  if (permissionResponse.data === null) {
    router.replace("/roleSelect");
    return;
  }

  if (!selectedRoleValue.value && rolePermissionList.length > 0) {
    const sortedRuleCodeList = rolePermissionList
      .filter((role) => !isRoleDisabled(role.code))
      .sort((currentRole, nextRole) => {
        return ROLE_CODE_ORDER.indexOf(currentRole.code) - ROLE_CODE_ORDER.indexOf(nextRole.code);
      });
    if (sortedRuleCodeList.length === 0) {
      return;
    }
    pendingPermissionRequest = refreshRolePermission(sortedRuleCodeList[0].code);
    await pendingPermissionRequest;
  }

  if (selectedRoleValue.value && !canEnterRolePage(selectedRoleValue.value)) {
    router.replace("/Unauthorized");
  }
};

onMounted(() => {
  document.addEventListener("click", closeRoleCard);
  initializeRoleMenuData();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeRoleCard);
});
</script>

<style scoped lang="less">
.role-card-entry {
  position: relative;
  flex-shrink: 0;
}

.role-avatar-button {
  height: 36px;
  border: 0;
  padding: 4px 10px 4px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8ea8ff, #5e73dc);
  box-shadow: 0 8px 20px rgba(61, 80, 160, 0.24);
  color: #ffffff;
  cursor: pointer;
}

.role-avatar-image {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.role-avatar-name {
  max-width: 72px;
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-card-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 200;
}
</style>
