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
      <div
        v-if="showRoleCard"
        class="role-card-popover"
        :style="roleCardPopoverStyle"
        @click.stop
      >
        <RolePermissionCard
          compact
          immediate-role-change
          :return-to="permissionReturnTo"
          :return-role="permissionReturnRole"
          @role-change="handleRoleSelection"
          @start="handleStart"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import RolePermissionGuide from '@/components/RolePermissionGuide.vue';
import {
  canEnterRolePage,
  changeSelectedRole,
  ensureRolePermission,
  getRouteRole,
  getRoleTargetPath,
  roles,
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
const permissionReturnTo = ref('');
const permissionReturnRole = ref('');
const roleCardPopoverStyle = ref({});
let pendingPermissionRequest = Promise.resolve(true);

const roleGuidePageKey = computed(() => {
  return ROLE_GUIDE_PAGE_KEY_MAP[route.name];
});

const selectedRole = computed(() => {
  return roles.find((role) => role.value === selectedRoleValue.value);
});

const getRoleAvatarElement = () => {
  return roleAvatarButtonRef.value;
};

const updateRoleCardPosition = () => {
  if (!showRoleCard.value || !roleAvatarButtonRef.value) {
    return;
  }

  const avatarRect = roleAvatarButtonRef.value.getBoundingClientRect();
  roleCardPopoverStyle.value = {
    top: `${avatarRect.bottom + 10}px`,
    right: `${window.innerWidth - avatarRect.right}px`,
  };
};

const toggleRoleCard = () => {
  if (rolePermissionGuideRef.value) {
    rolePermissionGuideRef.value.closeGuide();
  }

  if (!showRoleCard.value) {
    // 打开角色卡片时保留原业务上下文，申请页返回后恢复原角色和页面。
    permissionReturnTo.value = route.fullPath;
    permissionReturnRole.value = selectedRoleValue.value;
  }

  showRoleCard.value = !showRoleCard.value;

  if (showRoleCard.value) {
    updateRoleCardPosition();
  }
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

const handleRoleSelection = (roleValue) => {
  pendingPermissionRequest = changeSelectedRole(roleValue).catch(() => false);
};

const handleStart = async (roleValue) => {
  const permissionReady = await pendingPermissionRequest;

  if (!permissionReady) {
    return;
  }

  showRoleCard.value = false;

  if (canEnterRolePage(roleValue)) {
    router.push(getRoleTargetPath(roleValue));
    return;
  }

  router.push({
    path: '/Unauthorized',
    query: {
      returnTo: permissionReturnTo.value,
      returnRole: permissionReturnRole.value,
    },
  });
};

const initializeRoleMenuData = async () => {
  syncSelectedRoleFromSession();
  const routeRole = getRouteRole(route.path);

  if (!routeRole) {
    return;
  }

  // 路由守卫通常已完成初始化；直接进入页面时 ensure 会补齐且复用同角色请求。
  const permissionReady = await ensureRolePermission(routeRole);

  if (!permissionReady) {
    router.replace("/roleSelect");
    return;
  }

  if (!canEnterRolePage(routeRole)) {
    router.replace({
      path: '/Unauthorized',
      query: {
        returnTo: '/roleSelect?fromUnauthorized=1',
      },
    });
  }
};

onMounted(() => {
  document.addEventListener("click", closeRoleCard);
  window.addEventListener('resize', updateRoleCardPosition);
  window.addEventListener('scroll', updateRoleCardPosition, true);
  initializeRoleMenuData().catch(() => {
    router.replace('/roleSelect');
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeRoleCard);
  window.removeEventListener('resize', updateRoleCardPosition);
  window.removeEventListener('scroll', updateRoleCardPosition, true);
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
  position: fixed;
  z-index: 200;
}
</style>
