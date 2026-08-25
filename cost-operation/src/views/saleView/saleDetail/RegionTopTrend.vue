<template>
  <div class="container">
    <div class="title-overview">
      <SvgIcon
        icon-name="bottomRank"
        :style="{ width: 22, height: 22, color: 'rgba(98, 98, 168, 1)' }"
      >
      </SvgIcon>
      <span class="text">Region Top10</span>
    </div>
    <div class="info">
      <div class="trend-chart" v-if="hasPermission">
        <CommonChart
          :options="monthOptions"
          :style="{ width: 1568, height: 240 }"
        >
        </CommonChart>
      </div>
      <NoPermissionCard v-else></NoPermissionCard>
    </div>
  </div>
</template>

<script setup>
import CommonChart from '@/components/CommonChart.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import NoPermissionCard from '@/components/component/NoPermissionCard.vue';
import { useRegionTopTrend } from './useRegionTopTrend.js';

const props = defineProps({
  resourceType: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 1000,
  },
  hasY2: {
    type: Boolean,
    default: false,
  },
});

const { hasPermission, monthOptions } = useRegionTopTrend(props);
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  box-sizing: border-box;
  padding: 0px 24px;
  .title-overview {
    padding-top: 16px;
    padding-bottom: 12px;
  }
  .text {
    margin-left: 8px;
    color: rgba(51, 51, 107, 1);
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
  }
}
.info {
  width: 100%;
  box-sizing: border-box;
  height: 246px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 1);
  padding: 12px 20px;
}
</style>
