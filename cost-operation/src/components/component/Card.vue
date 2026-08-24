<template>
  <div
    class="card"
    :class="{
      small: size === 'small',
    }"
  >
    <div class="title flex-center">
      <span class="flex-center">
        <SvgIcon :icon-name="iconName" :style="iconSize"></SvgIcon>
        <span class="text mgl8">{{ title }}</span>
        <em v-if="!!remark" class="remark">{{ remark }}</em>
      </span>
      <DetailButton
        v-if="hasDetail"
        v-bind="$attrs"
        @click="emit('detailClick')"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import DetailButton from './DetailButton.vue';

const emit = defineEmits(['detailClick']);
const props = defineProps({
  title: {
    type: String,
  },
  size: {
    type: String,
    default: '',
  },
  iconName: {
    type: String,
    default: 'type', // 默认值设为 "type"
  },
  remark: {
    type: String,
  },
});

const hasDetail = computed(() => ['通算', '智算', 'ECS', 'OBS', 'XPU'].includes(props.title));

const iconSize = computed(() => {
  let size = {
    width: 32,
    height: 32,
  };
  switch (props.size) {
    case 'small':
      size = {
        width: 20,
        height: 20,
      };
      break;
    default:
      break;
  }
  return size;
});
</script>

<style lang="less" scoped>
.card {
  .title {
    justify-content: space-between;
    margin-bottom: 12px;
    .text {
      color: rgba(53, 53, 117, 1);
      font-family: Microsoft YaHei;
      font-size: 22px;
      font-weight: 700;
      line-height: 29px;
      letter-spacing: 0px;
      text-align: left;
    }
  }
  .remark {
    font-style: normal;
    margin-left: 8px;
    color: rgb(53, 53, 117);
    font-weight: 700;
    font-size: 14px;
  }
}
&.small {
  .text {
    font-size: 20px;
    line-height: 28px;
  }
  .remark {
    font-style: normal;
    margin-left: 8px;
    color: rgb(53, 53, 117);
    font-weight: 700;
    font-size: 14px;
  }
}
</style>
