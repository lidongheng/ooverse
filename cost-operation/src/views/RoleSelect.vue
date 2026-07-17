<template>
  <main v-if="showRoleSelector" class="role-select-page">
    <RolePermissionCard
      immediate-role-change
      return-to="/roleSelect?fromUnauthorized=1"
      @role-change="handleRoleSelection"
      @start="handleStart"
    />
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPermissionConfig } from "@/api/role";
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import {
  canEnterRolePage,
  getCurrentRoleRequestConfig,
  getRoleTargetPath,
  initializePermissionConfig,
  saveSelectedRole,
  selectedRoleValue,
} from "@/config/role";

const route = useRoute();
const router = useRouter();
const showRoleSelector = ref(false);
let permissionRequestId = 0;
let pendingPermissionRequest = Promise.resolve();

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

  if (canEnterRolePage(roleValue)) {
    router.push(getRoleTargetPath(roleValue));
    return;
  }

  router.push({
    path: '/Unauthorized',
    query: {
      returnTo: '/roleSelect?fromUnauthorized=1',
    },
  });
};

onMounted(async () => {
  const permissionResponse = await getPermissionConfig();
  initializePermissionConfig(permissionResponse.data);

  if (permissionResponse.data === null || Array.isArray(permissionResponse.data)) {
    showRoleSelector.value = true;
    return;
  }

  const ownedRoleCodes = permissionResponse.data.ruleCodeList.map((role) => role.code);

  if (route.query.fromUnauthorized === '1') {
    // 从申请页返回时只展示角色选择，不再执行无权限自动跳转。
    if (ownedRoleCodes.includes(selectedRoleValue.value)) {
      pendingPermissionRequest = refreshRolePermission(selectedRoleValue.value);
      await pendingPermissionRequest;
    }

    showRoleSelector.value = true;
    return;
  }

  if (ownedRoleCodes.includes("ROLE_CXO")) {
    // 默认选中角色1后，按角色头重新获取对应的数据权限。
    pendingPermissionRequest = refreshRolePermission("ROLE_CXO");
    await pendingPermissionRequest;
    showRoleSelector.value = true;
    return;
  }

  if (ownedRoleCodes.length === 1 && ownedRoleCodes[0] === "ROLE_FRONT_SALES") {
    pendingPermissionRequest = refreshRolePermission("ROLE_FRONT_SALES");
    await pendingPermissionRequest;

    if (canEnterRolePage("ROLE_FRONT_SALES")) {
      router.replace(getRoleTargetPath("ROLE_FRONT_SALES"));
      return;
    }

    router.replace({
      path: '/Unauthorized',
      query: {
        returnTo: '/roleSelect?fromUnauthorized=1',
      },
    });
    return;
  }

  showRoleSelector.value = true;
});
</script>

<style scoped lang="less">
.role-select-page {
  min-height: 100vh;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #eef0f8;
}

@media (max-width: 720px) {
  .role-select-page {
    padding: 16px;
    align-items: flex-start;
  }
}
</style>
