<template>
  <div class="left-overview">
    <button
      v-for="item in resourceMenus"
      :key="item.value"
      type="button"
      :class="['overview-button', { active: active === item.value }]"
      @click="changeActive(item.value)"
    >
      <span class="button-icon">{{ item.icon }}</span>
      <span class="button-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { resourceMenus } from './staticData';

defineProps({
  active: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:active']);

function changeActive(value) {
  emit('update:active', value);
}
</script>

<style lang="less" scoped>
.left-overview {
  width: 220px;
  height: 100%;
  padding: 18px 18px 0;
  box-sizing: border-box;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfbff 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-button {
  position: relative;
  width: 100%;
  height: 52px;
  padding: 0 18px;
  border: 1px solid #e3e5f4;
  border-radius: 8px;
  background: #f9faff;
  color: #48487f;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 7px 18px rgba(69, 73, 130, 0.08);
}

.overview-button.active {
  border-color: #49449b;
  background: linear-gradient(180deg, #5b55bb 0%, #2f2b84 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(55, 50, 143, 0.24);
}

.overview-button.active::after {
  position: absolute;
  right: -12px;
  top: 50%;
  width: 22px;
  height: 22px;
  background: #2f2b84;
  border-radius: 4px;
  content: '';
  transform: translateY(-50%) rotate(45deg);
}

.button-icon,
.button-label {
  position: relative;
  z-index: 1;
}

.button-icon {
  width: 18px;
  text-align: center;
  font-size: 16px;
}
</style>
