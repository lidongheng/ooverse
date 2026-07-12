<template>
  <main :class="['card-page', { 'card-page--compact': compact }]">
    <section class="permission-card">
      <header class="permission-card__header">
        <h1>切换角色</h1>
        <button class="apply-entry" type="button" @click="handlePermissionApply">
          <el-icon><Setting /></el-icon>
          <span>数据权限申请</span>
        </button>
      </header>

      <nav class="permission-tabs" aria-label="权限类型">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          class="permission-tabs__item"
          :class="{ 'permission-tabs__item--active': activeTab === tab.name }"
          type="button"
          @click="handleTabChange(tab.name)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section v-if="activeTab === 'role'" class="role-panel">
        <article
          v-for="role in ownedRoles"
          :key="role.value"
          class="role-row role-row--clickable"
          tabindex="0"
          @click="handleRoleClick(role.value)"
          @keyup.enter="handleRoleClick(role.value)"
        >
          <img class="avatar" :src="role.avatar" :alt="role.label">
          <div class="role-row__main">
            <h2>{{ role.label }}</h2>
            <p>到期时间：{{ role.validEndTime }}</p>
          </div>
          <p class="role-row__approver">审批人：{{ role.userName }} {{ role.account }}</p>
        </article>

        <div class="role-divider" />

        <h2 class="empty-title">未有角色权限(点击头像可直接申请业务角色权限)</h2>
        <article
          v-for="role in unavailableRoles"
          :key="role.value"
          class="role-row role-row--disabled"
        >
          <img class="avatar avatar--muted" :src="role.avatar" :alt="role.label">
          <div class="role-row__main">
            <h2>{{ role.label }}</h2>
          </div>
        </article>
      </section>

      <section v-else class="data-panel">
        <article
          v-for="item in dataPermissions"
          :key="item.code"
          class="data-card"
        >
          <div class="data-card__meta">
            <strong>{{ item.code }}</strong>
            <span>到期时间：{{ item.validEndTime }}</span>
          </div>
          <p>{{ item.regionCodes.join("，") }}</p>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Setting } from "@element-plus/icons-vue";
import {
  cloudServerPermissionList,
  regionPermissionList,
  rolePermissionList,
  roles,
} from "@/config/role";

defineProps({
  compact: Boolean,
});

const emit = defineEmits(["role-change"]);
const router = useRouter();

const tabs = [
  { label: "已有角色权限", name: "role" },
  { label: "已有数据权限", name: "data" },
];

const activeTab = ref("role");

const ownedRoles = computed(() => {
  return rolePermissionList.map((permission) => {
    const role = roles.find((item) => item.value === permission.code);

    return {
      ...role,
      validEndTime: permission.validEndTime,
      userName: permission.userName,
      account: permission.account,
    };
  });
});

const unavailableRoles = computed(() => {
  const ownedRoleCodes = rolePermissionList.map((permission) => permission.code);

  return roles.filter((role) => !ownedRoleCodes.includes(role.value));
});

const dataPermissions = computed(() => {
  const regionCodes = regionPermissionList.map((region) => region.code);

  return cloudServerPermissionList.map((cloudServer) => {
    return {
      ...cloudServer,
      regionCodes,
    };
  });
});

const handleTabChange = (tabName) => {
  activeTab.value = tabName;
};

const handleRoleClick = (roleValue) => {
  emit("role-change", roleValue);
};

const handlePermissionApply = () => {
  router.push("/Unauthorized");
};
</script>

<style scoped lang="less">
.card-page {
  min-height: 100vh;
  padding: 28px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #0f0e18;
}

.permission-card {
  width: min(100%, 960px);
  min-height: 1000px;
  padding: 72px 70px 64px;
  overflow: hidden;
  border-radius: 28px;
  background: #f6e7ff;
  box-shadow:
    inset 0 0 18px rgba(123, 79, 183, 0.26),
    0 0 0 2px rgba(123, 79, 183, 0.12);
  color: #392875;
}

.permission-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 62px;

  h1 {
    margin: 0;
    font-size: 38px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0;
  }
}

.apply-entry {
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  color: #4f4382;
  font-size: 31px;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;

  .el-icon {
    font-size: 36px;
  }
}

.permission-tabs {
  position: relative;
  display: flex;
  gap: 54px;
  margin-bottom: 42px;
  border-bottom: 2px solid rgba(90, 67, 128, 0.18);
}

.permission-tabs__item {
  position: relative;
  height: 68px;
  border: 0;
  padding: 0;
  background: transparent;
  color: rgba(57, 40, 117, 0.56);
  font-size: 31px;
  line-height: 68px;
  font-weight: 500;
  cursor: pointer;
}

.permission-tabs__item--active {
  color: #392875;
  font-weight: 800;

  &::after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -3px;
    height: 5px;
    background: #46327e;
    content: "";
  }
}

.role-panel {
  padding-top: 4px;
}

.role-row {
  display: grid;
  grid-template-columns: 106px minmax(320px, 1fr) 330px;
  column-gap: 28px;
  align-items: center;
  min-height: 126px;
  margin-bottom: 12px;
}

.role-row--clickable {
  border: 0;
  border-radius: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
}

.role-row__main {
  h2 {
    margin: 0 0 22px;
    color: #392875;
    font-size: 31px;
    line-height: 1.1;
    font-weight: 500;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: rgba(57, 40, 117, 0.38);
    font-size: 27px;
    line-height: 1.2;
  }
}

.role-row__approver {
  margin: 44px 0 0;
  color: rgba(57, 40, 117, 0.4);
  font-size: 27px;
  line-height: 1.2;
  white-space: nowrap;
}

.role-divider {
  height: 2px;
  margin: 36px 8px 46px;
  background: rgba(90, 67, 128, 0.14);
}

.empty-title {
  margin: 0 0 30px 8px;
  color: rgba(57, 40, 117, 0.52);
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
}

.role-row--disabled {
  opacity: 0.72;
}

.avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar--muted {
  filter: saturate(0.72);
}

.data-panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 18px 8px 0;
}

.data-card {
  min-height: 182px;
  padding: 34px 32px 28px;
  border: 1px solid rgba(83, 59, 128, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 0 1px rgba(107, 83, 156, 0.04),
    0 10px 28px rgba(111, 80, 145, 0.08);

  p {
    margin: 32px 0 0;
    color: #392875;
    font-size: 31px;
    line-height: 1.36;
    font-weight: 600;
  }
}

.data-card__meta {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 12px;
  align-items: center;
  color: rgba(57, 40, 117, 0.34);
  font-size: 24px;
  line-height: 1.2;

  strong {
    color: #392875;
    font-size: 31px;
    line-height: 1.2;
  }

  span {
    white-space: nowrap;
  }
}

.card-page--compact {
  min-height: 0;
  padding: 0;
  display: block;
  background: transparent;

  .permission-card {
    width: 380px;
    max-width: calc(100vw - 32px);
    max-height: 520px;
    min-height: 0;
    padding: 16px;
    overflow: auto;
    border-radius: 12px;
    background: #fbf5ff;
    box-shadow:
      0 16px 40px rgba(57, 40, 117, 0.18),
      0 0 0 1px rgba(123, 79, 183, 0.12);
  }

  .permission-card__header {
    gap: 12px;
    margin-bottom: 14px;

    h1 {
      font-size: 16px;
      line-height: 22px;
    }
  }

  .apply-entry {
    gap: 5px;
    font-size: 13px;
    line-height: 18px;

    .el-icon {
      font-size: 15px;
    }
  }

  .permission-tabs {
    gap: 20px;
    margin-bottom: 12px;
    border-bottom-width: 1px;
  }

  .permission-tabs__item {
    height: 34px;
    font-size: 14px;
    line-height: 34px;
  }

  .permission-tabs__item--active::after {
    bottom: -2px;
    height: 2px;
  }

  .role-panel {
    padding-top: 0;
  }

  .role-row {
    grid-template-columns: 42px minmax(0, 1fr);
    column-gap: 10px;
    row-gap: 2px;
    min-height: 54px;
    margin-bottom: 8px;
  }

  .role-row__main {
    h2 {
      margin: 0 0 4px;
      font-size: 14px;
      line-height: 18px;
      font-weight: 700;
    }

    p {
      font-size: 12px;
      line-height: 16px;
    }
  }

  .role-row__approver {
    grid-column: 2;
    margin: 0;
    font-size: 12px;
    line-height: 16px;
    white-space: normal;
  }

  .role-divider {
    height: 1px;
    margin: 12px 0 14px;
  }

  .empty-title {
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 18px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    align-self: start;
  }

  .data-panel {
    gap: 10px;
    padding: 0;
  }

  .data-card {
    min-height: 0;
    padding: 12px;
    border-radius: 10px;

    p {
      margin-top: 8px;
      font-size: 13px;
      line-height: 20px;
    }
  }

  .data-card__meta {
    grid-template-columns: 1fr;
    gap: 4px;
    font-size: 12px;
    line-height: 16px;

    strong {
      font-size: 14px;
      line-height: 18px;
    }

    span {
      white-space: normal;
    }
  }
}

@media (max-width: 900px) {
  .card-page {
    padding: 16px;
  }

  .permission-card {
    padding: 44px 34px 48px;
    min-height: 860px;
  }

  .permission-card__header {
    margin-bottom: 42px;
  }

  .apply-entry,
  .permission-tabs__item,
  .data-card p,
  .role-row__main h2 {
    font-size: 24px;
  }

  .role-row {
    grid-template-columns: 84px 1fr;
    row-gap: 6px;
  }

  .role-row__approver {
    grid-column: 2;
    margin-top: 0;
    white-space: normal;
  }

  .data-card__meta {
    grid-template-columns: 1fr;
  }

  .card-page--compact {
    padding: 0;

    .permission-card {
      width: 380px;
      max-height: 520px;
      padding: 16px;
      min-height: 0;
    }
  }
}
</style>
