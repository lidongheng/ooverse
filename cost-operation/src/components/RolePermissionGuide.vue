<template>
  <div
    v-if="visible"
    class="role-permission-guide-mask"
    aria-hidden="true"
    @click.stop
  ></div>
  <section
    v-if="visible"
    class="role-permission-guide"
    role="status"
    aria-label="申请权限引导"
    @click.stop
  >
    <h3 class="role-permission-guide__title">申请权限</h3>
    <p class="role-permission-guide__description">点击头像可以申请更多权限！</p>
    <div class="role-permission-guide__actions">
      <button
        class="role-permission-guide__cancel"
        type="button"
        @click="closeGuide"
      >
        取消({{ countdown }}s)
      </button>
      <button
        class="role-permission-guide__dismiss"
        type="button"
        @click="dismissGuide"
      >
        不再提醒
      </button>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
});

const GUIDE_COUNTDOWN_SECONDS = 5;
const visible = ref(false);
const countdown = ref(GUIDE_COUNTDOWN_SECONDS);
let countdownTimer;

const getStorageKey = () => {
  return `cost-operation:role-permission-guide-dismissed:${props.pageKey}`;
};

const clearCountdownTimer = () => {
  if (countdownTimer === undefined) {
    return;
  }

  window.clearInterval(countdownTimer);
  countdownTimer = undefined;
};

const closeGuide = () => {
  clearCountdownTimer();
  visible.value = false;
};

const dismissGuide = () => {
  localStorage.setItem(getStorageKey(), 'true');
  closeGuide();
};

const startGuide = () => {
  if (localStorage.getItem(getStorageKey()) === 'true') {
    return;
  }

  visible.value = true;
  countdown.value = GUIDE_COUNTDOWN_SECONDS;
  countdownTimer = window.setInterval(() => {
    countdown.value -= 1;

    if (countdown.value === 0) {
      closeGuide();
    }
  }, 1000);
};

// 供头像点击时主动关闭引导，避免与角色权限卡片同时显示。
defineExpose({ closeGuide });

onMounted(startGuide);
onBeforeUnmount(clearCountdownTimer);
</script>

<style lang="less" scoped>
.role-permission-guide-mask {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: rgba(30, 32, 70, 0.36);
}

.role-permission-guide {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 201;
  width: 280px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(39, 49, 99, 0.18);
  color: #24264f;

  &::before {
    position: absolute;
    top: -8px;
    right: 24px;
    width: 16px;
    height: 16px;
    background: #ffffff;
    content: '';
    transform: rotate(45deg);
  }
}

.role-permission-guide__title {
  position: relative;
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
}

.role-permission-guide__description {
  position: relative;
  margin: 12px 0 20px;
  color: #70728d;
  font-size: 14px;
  line-height: 22px;
}

.role-permission-guide__actions {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-permission-guide__cancel,
.role-permission-guide__dismiss {
  border: 0;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
}

.role-permission-guide__cancel {
  padding: 7px 0;
  background: transparent;
  color: #777991;
}

.role-permission-guide__dismiss {
  padding: 7px 18px;
  border-radius: 4px;
  background: #596de8;
  color: #ffffff;
  font-weight: 600;
}
</style>
