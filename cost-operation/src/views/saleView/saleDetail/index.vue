<template>
  <div class="common-page-padding">
    <SaleCommonTitle title="可售资源"
      iconName="sale-detail-1"
      :ecsTime="homeData.ecsTime"
      :obsTime="homeData.obsTime"
      :xpuTime="homeData.xpuTime"
    />
    
    <div class="sale-detail-layout">
      <div class="left-card">
        <LeftOverview2 v-model:active="active" />
      </div>
      
      <div class="right-panel">
        <template v-if="active === 'ECS'">
          <ECSInformation>
            <template #filter>
              <FilterDropdowns
                v-model="filterOtherValue"
                :options="filterOptions"
                :filter-config="filterConfig"
              />
            </template>
          </ECSInformation>
          <div class="{ 'scroll-box-ecs': !isCollapsed }">
            <ECSDaiCi></ECSDaiCi>
            <ECSTable :active="active"></ECSTable>
          </div>
        </template>
        <template v-if="active === 'OBS'">
          <OBSInformation>
            <template #filter>
              <FilterDropdowns
                v-model="filterOtherValue"
                :options="filterOptions"
                :filter-config="filterConfig"
              />
            </template>
          </OBSInformation>
          <div class="scroll-box">
            <OBSTopRegionTrend></OBSTopRegionTrend>
            <OBSTable :active="active"></OBSTable>
          </div>
        </template>
        <template v-if="active === 'XPU'">
          <XPUInformation>
            <template #filter>
              <FilterDropdowns
                v-model="filterOtherValue"
                :options="filterOptions"
                :filter-config="filterConfig"
              />
            </template>
          </XPUInformation>
          <OBSTable></OBSTable>
        </template>
        <template v-if="active === 'network'"></template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue';
import { storeToRefs } from 'pinia';
import SaleCommonTitle from '@/views/saleView/component/SaleCommonTitle.vue';
import LeftOverview2 from '@/views/saleView/saleDetail/LeftOverview2.vue';
import ECSInformation from '@/views/saleView/saleDetail/ECSInformation.vue';
import ECSDaiCi from '@/views/saleView/saleDetail/OBSInfoDaici.vue';
import OBSInformation from '@/views/saleView/saleDetail/OBSInformation.vue';
import XPUInformation from '@/views/saleView/saleDetail/XPUInformation.vue';
import ECSTable from '@/views/saleView/saleDetail/ECSTable.vue';
import OBSTable from '@/views/saleView/saleDetail/OBSTable.vue';
import OBSTopRegionTrend from '@/views/saleView/saleDetail/OBSTopRegionTrend.vue';
import { useRoute } from 'vue-router';
import {
  useResoureDetailByECS,
  useResoureDetailByOBS,
  useResoureDetailByXPU,
  pageNo,
  pageSize,
  currentSort,
  storageMode,
  dimensionalEnum,
  isCollapsed,
} from './useResourceData';
import { useSaleDetailStore, useSaleFilterStore } from '../saleHome/useSaleFilter.js';
import { saleDetailActive } from '@/views/costOpertion/hooks/useAIPage';
import { useSaleHomeData, homeData } from '../saleHome/useSaleHomeData.js';
import FilterDropdowns from '@/components/FilterDropdowns.vue';

const route = useRoute();
const active = ref(route.query.type || 'ECS');
saleDetailActive.value = active.value;

useSaleHomeData();

const { filterOtherValue } = storeToRefs(useSaleFilterStore());
const { filterConfig, filterOptions } = useSaleDetailStore(active);

useResoureDetailByECS(active);
useResoureDetailByOBS(active);
useResoureDetailByXPU(active);

watch(active, () => {
  saleDetailActive.value = active.value;
  pageNo.value = 1;
  pageSize.value = 50;
  filterOtherValue.value = active.value === 'ECS' ? { resourceType: ['32U'] } : {};
  storageMode.value = [];
  currentSort.value = {
    prop: '',
    order: '',
  };
  dimensionalEnum.value = '';
});
</script>

<style lang="less" scoped>
.gap16 {
  gap: 16px;
  margin-top: 12px;
}

.right-ecs {
  overflow-y: auto;
  overflow-x: clip;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-thumb {
  width: 4px;
  background-color: transparent;
}

&:hover {
  ::-webkit-scrollbar-thumb {
    background-color: #adb0b8;
  }
}

.divider-line {
  height: 1px;
  background: rgba(212, 217, 230, 1);
  margin: 16px 24px;
}

.scroll-box-ecs {
  height: 496px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sale-detail-page {
  min-height: 100vh;
  padding: 18px 22px 24px;
  box-sizing: border-box;
  background: #f4f5fb;
}

.sale-detail-layout {
  min-height: calc(100vh - 112px);
  display: flex;
  gap: 18px;
  margin-top: 14px;
}

.left-card {
  width: 220px;
  height: 916px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 2px;
  width: 1296px;
  height: 916px;
  border-radius: 16px;
  box-shadow: 0px 2px 12px 0px rgba(53, 53, 117, 0.15);
  background: rgba(255, 255, 255, 0.5);
}
</style>

