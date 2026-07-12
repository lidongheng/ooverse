<template>
  <div>
    <p>
      <span>通用Server</span><span>{{ toWan(homeCardData.eff.commonComputing.curValue) }}</span><span>万台</span>
    </p>
    <p>
      <span>外部Customer</span><span>{{ toWan(filterInforData?.externalServerNumTotal) }}</span><span>万台</span>
    </p>
    <p>
      <span>External Customer</span><span>{{ toWan(filterInforData?.internalServerNumTotal) }}</span><span>万台</span>
    </p>
    <p>
      <span>盈</span><span>{{ toBillion(operateData?.value) }}</span><span>亿元</span>
    </p>
    <p>
      <span>环比上升</span><span>{{ toBillion(operateData?.compareValue) }}</span><span>亿元</span>
    </p>
    <p>
      <span>eFlop</span><span>{{ toBillion(homeCardData.recurringRevenue.commonComputing.value) }}</span><span>亿元</span>
    </p>
    <p>
      <span>cost</span><span>{{ toBillion(homeCardData.cost.commonComputing.value) }}</span><span>亿元</span>
    </p>
    <p>
      <span>resource pool</span><span>{{ poolData[0].poolNum }}</span><span>个</span>
    </p>
    <p>
      <span>盈</span><span>{{ poolData[0].gainResourcePoolNum }}</span><span>个</span>
    </p>
    <p>
      <span>亏</span><span>{{ poolData[0].lossResourcePoolNum }}</span><span>个</span>
    </p>
    <p>表格</p>
    <div v-for="item in lifecycleTableData" :key="item.resourceName">
      <div
        :class="{
          node: true,
          pointer: isEnableClick(item.resourceName),
          selected: selectedPool === item.resourceName,
        }"
        @click="onClick(item.resourceName)"
      >
        <span>{{ CLOUD_SERVICE_DISPLAY_NAME[item.resourceName] }}</span>
        <span>{{ item.diskSpaceUseRate }}</span>
        <span>{{ item.grossProfitRate }}</span>
        <span>{{ item.poolNum }}</span>
        <span>{{ item.resourceName === 'DSS' ? '--' : item.gainResourcePoolNum }}</span>
        <span>{{ item.resourceName === 'DSS' ? '--' : item.lossResourcePoolNum }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { toWan, toBillion } from '@/utils';
import { fetchHomeCardData, homeCardData } from './hooks/useIndicators';
import { CLOUD_SERVICE_DISPLAY_NAME, filterInforData, loadResourcePoolCustomerInfo } from './useDirectoryTree';
import { useResourcePool, selectedPool } from './ResourcesLifecycle';
import { backendFilters, resetGeneralComputeFilter } from './useGeneralComputeFilter';

const { poolData, operateData, fetchResourcePoolData } = useResourcePool();
const enabledPoolNames = ['ECS', 'OBS', 'EVS'];
const lifecycleTableData = computed(() =>
  poolData.value.filter((item) => enabledPoolNames.includes(item.resourceName))
);
const isEnableClick = (name) => enabledPoolNames.includes(name);

const onClick = (name) => {
  if (isEnableClick(name)) {
    selectedPool.value = name;
    resetGeneralComputeFilter();
  }
}

watch(
  backendFilters,
  (filters) => {
    // 左侧所有卡片和表格也共用同一份后端筛选参数。
    // filters 为 null 时不请求，保证首屏只在“默认全选”生成后拉取一次。
    if (!filters) return;
    fetchHomeCardData(filters);
    fetchResourcePoolData(filters);
    loadResourcePoolCustomerInfo(filters);
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
.node {
  display: grid;
  grid-template-columns: 48px repeat(5, 1fr);
  align-items: center;
  min-height: 28px;
  padding: 0 8px;
  color: #353575;
  border-radius: 4px;

  &.pointer {
    cursor: pointer;
  }

  &.selected {
    color: #fff;
    background: #353575;
  }
}
</style>
