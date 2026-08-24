<template>
<div class="home-common-card">
  <div class="label">{{ options.label }}</div>
  <div class="value">
    <span>{{ options.value }}{{ options.unit }}</span>
  </div>
  <div class="target flex-center" v-if="options.target">
    <span>目标</span>
    <span class="bold target-value">{{ options.target || '--' }}%</span>
  </div>
  <RingRatio :small="true" :unit="options.ratioUnit" :data="options.ratioValue"></RingRatio>

  <el-progress
    class="right-process"
    type="dashboard"
    :width="changeValueByScale(71)"
    :stroke-width="changeValueByScale(8)"
    :percentage="options.value"
    color="#1bcc8e"
  >
    <template #default>
      <SvgIcon :icon-name="options.iconName" :style="{ width: 20, height: 20 }" />
    </template>
  </el-progress>
</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RingRatio from './RingRatio.vue';
import { changeValueByScale } from '@/composables/autoLayout';
import { formatRateValue } from '@/utils';
import SvgIcon from '@/components/SvgIcon.vue';

const { t, locale } = useI18n();
const state = ref();
const props = defineProps({
  options: {
    type: Object,
  },
});
</script>

<style lang="less" scoped>
.home-common-card {
  position: relative;

  .label {
    color: rgba(53, 53, 117, 1);
    font-family: Microsoft YaHei;
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
  }

  .value {
    margin-top: 4px;
    color: rgba(53, 53, 117, 1);
    font-family: Arial;
    font-size: 28px;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 0px;
    text-align: left;
    .unit {
      color: rgba(53, 53, 117, 1);
      font-family: Microsoft YaHei;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0px;
      text-align: left;
    }
  }

  .target {
    color: rgba(98, 98, 168, 1);
    font-family: Microsoft YaHei;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    margin-bottom: 4px;
    margin-top: 16px;
    .target-value {
        font-size: 14px;
        margin-left: 5px;
    }
  }
  .right-process {
    position: absolute;
    bottom: 15px;
    right: 16px;
  }
}
</style>