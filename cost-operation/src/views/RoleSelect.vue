<template>
  <main v-if="showRoleSelector" class="role-select-page">
    <RolePermissionCard @start="handleStart" />
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getPermissionConfig } from "@/api/role";
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import {
  canEnterRolePage,
  getRoleTargetPath,
  initializePermissionConfig,
  saveSelectedRole,
} from "@/config/role";

const router = useRouter();
const showRoleSelector = ref(false);

const handleStart = (roleValue) => {
  saveSelectedRole(roleValue);
  router.push(getRoleTargetPath(roleValue));
};

onMounted(async () => {
  const permissionResponse = await getPermissionConfig();
  initializePermissionConfig(permissionResponse.data);

  if (permissionResponse.data === null || Array.isArray(permissionResponse.data)) {
    showRoleSelector.value = true;
    return;
  }

  const ownedRoleCodes = permissionResponse.data.ruleCodeList.map((role) => role.code);

  if (ownedRoleCodes.includes("ROLE_CXO")) {
    // CXO 暂不做数据权限控制，进入首页时停留在角色选择页并默认选中角色1。
    saveSelectedRole("ROLE_CXO");
    showRoleSelector.value = true;
    return;
  }

  if (ownedRoleCodes.length === 1 && ownedRoleCodes[0] === "ROLE_FRONT_SALES") {
    saveSelectedRole("ROLE_FRONT_SALES");

    if (canEnterRolePage("ROLE_FRONT_SALES")) {
      router.replace(getRoleTargetPath("ROLE_FRONT_SALES"));
      return;
    }

    router.replace("/Unauthorized");
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
