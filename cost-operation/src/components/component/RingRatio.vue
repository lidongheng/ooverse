<template>
  <div
    class="ring-ratio"
    :class="[
      { small },
      directionClass,
      colorClass,
    ]"
  >
    <slot name="text">
      <span v-if="label" class="ratio-label">{{ label }}</span>
    </slot>
    <span v-if="hasDirection" class="ratio-direction">
      {{ isUp ? '▲' : '▼' }}
    </span>
    <span class="ratio-value">{{ displayData }}</span>
    <slot name="unit">
      <span class="ratio-unit">{{ unit }}</span>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  upGreen: {
    type: Boolean,
  },
  label: {
    type: String,
  },
  small: {
    type: Boolean,
  },
  unit: {
    type: String,
  },
  data: {
    type: [Number, String],
  },
  ratioFixed: {
    type: Number,
  },
});

const hasDirection = computed(() => {
  if (typeof props.data === 'number') {
    return true;
  }

  return typeof props.data === 'string'
    && props.data.trim() !== ''
    && !Number.isNaN(Number(props.data));
});

const isUp = computed(() => Number(props.data) >= 0);

const directionClass = computed(() => {
  if (!hasDirection.value) {
    return '';
  }

  return isUp.value ? 'is-up' : 'is-down';
});

const colorClass = computed(() => {
  if (!hasDirection.value) {
    return '';
  }

  const isGreen = props.upGreen ? isUp.value : !isUp.value;
  return isGreen ? 'is-green' : 'is-red';
});

const displayData = computed(() => {
  if (!hasDirection.value || props.ratioFixed === undefined) {
    return props.data;
  }

  return Number(props.data).toFixed(props.ratioFixed);
});
</script>

<style lang="less" scoped>
.ring-ratio {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #6262a8;
  font-size: 14px;
  line-height: 20px;

  &.small {
    font-size: 12px;
    line-height: 18px;
  }

  &.is-green {
    color: #1bcc8e;
  }

  &.is-red {
    color: #f05a67;
  }
}

.ratio-direction {
  font-size: 10px;
}
</style>
