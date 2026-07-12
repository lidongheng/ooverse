<template>
  <svg
    class="scg-icon"
    aria-hidden="true"
    :style="{
      width: props.useStyle ? changeValueByScale(props.style.width ?? 16) : null,
      minWidth: props.useStyle ? changeValueByScale(props.style.width ?? 16) : null,
      height: props.useStyle ? changeValueByScale(props.style.height ?? 16) : null,
      minHeight: props.useStyle ? changeValueByScale(props.style.height ?? 16) : null,
      color: props.style.color,
    }"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup>
import { changeValueByScale } from '@/composables/autoLayout';
import { computed } from 'vue';

const props = defineProps({
  iconName: {
    required: true,
    type: String,
  },
  style: {
    type: Object,
    default: () => ({
      width: 16,
      height: 16,
    }),
  },
  useStyle: {
    type: Boolean,
    default: true,
  },
});
const iconName = computed(() => `#icon-${props.iconName}`);

</script>

<style scoped lang="less">
.svg-icon {
  vertical-align: -2.4px;
  fill: currentColor;
  overflow: hidden;
}
</style>
