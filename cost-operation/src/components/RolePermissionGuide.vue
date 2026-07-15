<template>
  <template v-if="visible && positionReady">
    <button
      class="role-permission-guide__avatar-proxy"
      type="button"
      aria-label="切换角色"
      :style="avatarProxyStyle"
      @click.stop="handleAvatarClick"
    ></button>
    <div
      v-for="(maskStyle, index) in maskStyleList"
      :key="index"
      class="role-permission-guide-mask"
      aria-hidden="true"
      :style="maskStyle"
      @click.stop
    ></div>
    <section
      class="role-permission-guide"
      role="status"
      aria-label="申请权限引导"
      :style="guideStyle"
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
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
  getAnchorElement: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['avatarClick']);

const GUIDE_COUNTDOWN_SECONDS = 5;
const GUIDE_WIDTH = 280;
const GUIDE_GAP = 12;
const VIEWPORT_GAP = 12;
const ARROW_EDGE_GAP = 20;
const visible = ref(false);
const positionReady = ref(false);
const countdown = ref(GUIDE_COUNTDOWN_SECONDS);
const anchorRect = ref();
const guidePosition = ref();
let countdownTimer;
let anchorResizeObserver;

const avatarProxyStyle = computed(() => {
  return {
    top: `${anchorRect.value.top}px`,
    left: `${anchorRect.value.left}px`,
    width: `${anchorRect.value.width}px`,
    height: `${anchorRect.value.height}px`,
  };
});

const maskStyleList = computed(() => {
  return [
    {
      top: '0px',
      right: '0px',
      left: '0px',
      height: `${anchorRect.value.top}px`,
    },
    {
      top: `${anchorRect.value.bottom}px`,
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
    {
      top: `${anchorRect.value.top}px`,
      left: '0px',
      width: `${anchorRect.value.left}px`,
      height: `${anchorRect.value.height}px`,
    },
    {
      top: `${anchorRect.value.top}px`,
      right: '0px',
      left: `${anchorRect.value.right}px`,
      height: `${anchorRect.value.height}px`,
    },
  ];
});

const guideStyle = computed(() => {
  return {
    top: `${guidePosition.value.top}px`,
    left: `${guidePosition.value.left}px`,
    width: `${guidePosition.value.width}px`,
    '--role-guide-arrow-left': `${guidePosition.value.arrowLeft}px`,
  };
});

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

const clearPositionTracking = () => {
  window.removeEventListener('resize', updateGuidePosition);
  window.removeEventListener('scroll', updateGuidePosition, true);

  if (anchorResizeObserver === undefined) {
    return;
  }

  anchorResizeObserver.disconnect();
  anchorResizeObserver = undefined;
};

const closeGuide = () => {
  clearCountdownTimer();
  clearPositionTracking();
  visible.value = false;
  positionReady.value = false;
};

const dismissGuide = () => {
  localStorage.setItem(getStorageKey(), 'true');
  closeGuide();
};

const updateGuidePosition = () => {
  const anchorElement = props.getAnchorElement();
  if (!anchorElement) {
    return;
  }

  const nextAnchorRect = anchorElement.getBoundingClientRect();
  const guideWidth = Math.min(GUIDE_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
  const minimumGuideLeft = VIEWPORT_GAP;
  const maximumGuideLeft = window.innerWidth - guideWidth - VIEWPORT_GAP;
  const alignedGuideLeft = nextAnchorRect.right - guideWidth;
  const nextGuideLeft = Math.min(
    Math.max(alignedGuideLeft, minimumGuideLeft),
    maximumGuideLeft,
  );
  const anchorCenter = nextAnchorRect.left + nextAnchorRect.width / 2;
  const nextArrowLeft = Math.min(
    Math.max(anchorCenter - nextGuideLeft, ARROW_EDGE_GAP),
    guideWidth - ARROW_EDGE_GAP,
  );

  anchorRect.value = nextAnchorRect;
  guidePosition.value = {
    top: nextAnchorRect.bottom + GUIDE_GAP,
    left: nextGuideLeft,
    width: guideWidth,
    arrowLeft: nextArrowLeft,
  };
  positionReady.value = true;
};

const startPositionTracking = () => {
  const anchorElement = props.getAnchorElement();
  if (!anchorElement) {
    return;
  }

  window.addEventListener('resize', updateGuidePosition);
  window.addEventListener('scroll', updateGuidePosition, true);
  anchorResizeObserver = new ResizeObserver(updateGuidePosition);
  anchorResizeObserver.observe(anchorElement);
};

const handleAvatarClick = () => {
  closeGuide();
  emit('avatarClick');
};

const startGuide = async () => {
  if (localStorage.getItem(getStorageKey()) === 'true') {
    return;
  }

  await nextTick();
  if (!props.getAnchorElement()) {
    return;
  }

  visible.value = true;
  countdown.value = GUIDE_COUNTDOWN_SECONDS;
  updateGuidePosition();
  startPositionTracking();
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
onBeforeUnmount(closeGuide);
</script>

<style lang="less" scoped>
.role-permission-guide-mask {
  position: fixed;
  z-index: 2147483645;
  background: rgba(30, 32, 70, 0.36);
}

.role-permission-guide__avatar-proxy {
  position: fixed;
  z-index: 2147483646;
  border: 0;
  padding: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}

.role-permission-guide {
  position: fixed;
  z-index: 2147483647;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(39, 49, 99, 0.18);
  color: #24264f;

  &::before {
    position: absolute;
    top: -8px;
    left: var(--role-guide-arrow-left);
    width: 16px;
    height: 16px;
    background: #ffffff;
    content: '';
    transform: translateX(-50%) rotate(45deg);
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
