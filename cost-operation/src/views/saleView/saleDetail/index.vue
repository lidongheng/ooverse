<template>
  <div class="sale-detail-page">
    <CommonTitle title="可售资源" iconName="menu" />

    <div class="sale-detail-layout">
      <div class="left-card">
        <LeftOverview v-model:active="active" />
      </div>

      <div class="right-panel">
        <template v-if="active === 'ECS'">
          <ECSInformation />
          <ECSTable active="ECS" />
        </template>
        <template v-if="active === 'OBS'">
          <OBSInformation />
          <OBSTable active="OBS" />
        </template>
        <template v-if="active === 'XPU'">
          <XPUInformation />
          <OBSTable active="XPU" />
        </template>
        <template v-if="active === 'network'">
          <NetworkInformation />
          <OBSTable active="network" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CommonTitle from '@/components/home/CommonTitle.vue';
import LeftOverview from './LeftOverview.vue';
import ECSInformation from './ECSInformation.vue';
import ECSTable from './ECSTable.vue';
import OBSInformation from './OBSInformation.vue';
import OBSTable from './OBSTable.vue';
import XPUInformation from './XPUInformation.vue';
import NetworkInformation from './NetworkInformation.vue';

const route = useRoute();
const active = ref('');

watch(
  () => route.query.type,
  (value) => {
    active.value = value || 'ECS';
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
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
  flex-shrink: 0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(420px, 1fr);
  gap: 16px;
}
</style>
