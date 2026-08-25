<template>
  <div class="flex-column">
    <Card title="XPU" iconName="sale-xpu" @detailClick="jumpDetailPage('XPU')">
      <div class="card-gap">
        <CommonLineCard
          :forbidden="!homeData.xpuPermission"
          :options="{
            label: '待分配量',
            unit: '卡',
            ratioUnit: '',
            value: formatterValue(
              xpuIndicator.allocatedVolume?.value,
              undefined,
              0,
            ),
            ratioValue: formatterValue(
              xpuIndicator.allocatedVolume?.compareValue,
              undefined,
              0,
            ),
            chartData: xpuIndicator.allocatedVolume?.trends,
            changeFn: (v) => {
              return formatterValue(v, undefined, 0);
            },
            upGreen: false,
            ratioLabel: '较上月',
            chartRight: true,
          }"
        />
        <CommonLineCard
          :forbidden="!homeData.xpuPermission"
          :options="{
            label: 'A3待分配量',
            unit: '卡',
            ratioUnit: '',
            value: formatterValue(
              xpuIndicator.a3AllocatedVolume?.value,
              undefined,
              0,
            ),
            ratioValue: formatterValue(
              xpuIndicator.a3AllocatedVolume?.compareValue,
              undefined,
              0,
            ),
            chartData: xpuIndicator.a3AllocatedVolume?.trends,
            changeFn: (v) => {
              return formatterValue(v, undefined, 0);
            },
            upGreen: false,
            ratioLabel: '较上月',
          }"
        />
        <CommonLineCard
          :forbidden="!homeData.xpuPermission"
          :options="{
            label: 'A2待分配量',
            unit: '卡',
            ratioUnit: '',
            value: formatterValue(
              xpuIndicator.a2AllocatedVolume?.value,
              undefined,
              0,
            ),
            ratioValue: formatterValue(
              xpuIndicator.a2AllocatedVolume?.compareValue,
              undefined,
              0,
            ),
            chartData: xpuIndicator.a2AllocatedVolume?.trends,
            changeFn: (v) => {
              return formatterValue(v, undefined, 0);
            },
            upGreen: false,
            ratioLabel: '较上月',
          }"
        />
      </div>
    </Card>
  </div>
</template>

<script setup>
import { formatterValue } from '@/utils';
import Card from '@/components/component/Card.vue';
import CommonLineCard from '@/components/component/CommonLineCard.vue';
import { useRouter } from 'vue-router';
import { homeData } from './useSaleHomeData.js';
import { computed } from 'vue';

const xpuIndicator = computed(() => homeData.value.xpuIndicator ?? {});
const networkIndicator = computed(() => homeData.value.networkIndicator ?? {});

const props = defineProps({});
const router = useRouter();
const jumpDetailPage = (type) => {
  router.push({
    path: '/saleDetail',
    query: {
      type,
    },
  });
};
</script>

<style lang="less" scoped>
.flex-column {
  height: calc((100% - 12px) / 2);
  min-height: 0;
  display: flex;
  flex-direction: column;

  > .card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.card-gap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .home-common-card {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding: 16px 16px 16px 20px;
    box-sizing: border-box;
    border-radius: 16px;
    box-shadow: 0 2px 12px 0 rgba(53, 53, 117, 0.15);
    background: rgba(255, 255, 255, 0.75);

    &:first-child {
      grid-column: 1 / -1;
    }
  }
}
</style>
