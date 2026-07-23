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
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import {
  canEnterRolePage,
  changeSelectedRole,
  ensureRoleCatalog,
  ensureRolePermission,
  getRoleTargetPath,
  isRolePermissionAuthorized,
  refreshRoleCatalog,
  restoreSelectedRole,
  ROLE_PERMISSION_STATUS,
  rolePermissionList,
  selectedRoleValue,
} from "@/config/role";

const route = useRoute();
const router = useRouter();
const showRoleSelector = ref(false);
let pendingPermissionRequest = Promise.resolve(ROLE_PERMISSION_STATUS.AUTHORIZED);

const getInitialRoleValue = (ownedRoleCodes) => {
  if (ownedRoleCodes.includes(selectedRoleValue.value)) {
    return selectedRoleValue.value;
  }

  if (ownedRoleCodes.includes('ROLE_CXO')) {
    return 'ROLE_CXO';
  }

  if (ownedRoleCodes.length === 1 && ownedRoleCodes[0] === 'ROLE_FRONT_SALES') {
    return 'ROLE_FRONT_SALES';
  }

  return undefined;
};

const handleRoleSelection = (roleValue) => {
  pendingPermissionRequest = changeSelectedRole(roleValue);
};

const handleStart = async (roleValue) => {
  const permissionStatus = await pendingPermissionRequest;

  if (!isRolePermissionAuthorized(permissionStatus)) {
    return;
  }

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
  try {
    if (route.query.fromRoleGuard === '1') {
      // 4A登录回跳后先获取角色目录，再按确定的角色重新获取数据权限。
      const catalogReady = await refreshRoleCatalog();

      if (!catalogReady) {
        showRoleSelector.value = true;
        return;
      }

      const ownedRoleCodes = rolePermissionList.map((role) => role.code);
      const initialRoleValue = getInitialRoleValue(ownedRoleCodes);

      if (initialRoleValue !== undefined) {
        pendingPermissionRequest = restoreSelectedRole(initialRoleValue);
        await pendingPermissionRequest;
      }

      showRoleSelector.value = true;
      return;
    }

    const catalogReady = await ensureRoleCatalog();

    if (!catalogReady) {
      showRoleSelector.value = true;
      return;
    }

    const ownedRoleCodes = rolePermissionList.map((role) => role.code);

    if (route.query.fromUnauthorized === '1') {
      // 从申请页返回时只展示角色选择，不执行自动跳转。
      if (ownedRoleCodes.includes(selectedRoleValue.value)) {
        pendingPermissionRequest = ensureRolePermission(selectedRoleValue.value);
        await pendingPermissionRequest;
      }

      showRoleSelector.value = true;
      return;
    }

    if (ownedRoleCodes.includes("ROLE_CXO")) {
      // 默认选中角色1后，按角色头重新获取对应的数据权限。
      pendingPermissionRequest = changeSelectedRole("ROLE_CXO");
      await pendingPermissionRequest;
      showRoleSelector.value = true;
      return;
    }

    if (ownedRoleCodes.length === 1 && ownedRoleCodes[0] === "ROLE_FRONT_SALES") {
      pendingPermissionRequest = changeSelectedRole("ROLE_FRONT_SALES");
      const permissionStatus = await pendingPermissionRequest;

      if (!isRolePermissionAuthorized(permissionStatus)) {
        showRoleSelector.value = true;
        return;
      }

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
  } catch {
    showRoleSelector.value = true;
  }
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
