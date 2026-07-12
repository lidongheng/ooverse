<template>
  <div class="container">
    <header class="header flex-center">
      <span class="title">主指标下钻</span>
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <CategoryNav />
      </section>
      <section class="main-right">
        <div class="chart-area">
          <ProfitLossTrend
            ref="chartRef"
            @bubble-click="onBubbleClick"
            @visible-change="onVisibleChange"
          />
        </div>
        <ResourcePoolTable
          ref="tableRef"
          :data="chartData"
        />
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import CategoryNav from "@/components/CategoryNav.vue";
import ProfitLossTrend from "./profitLossTrend.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";

const chartRef = ref(null);
const tableRef = ref(null);
const tierFilter = ref(null);

const allData = computed(() => chartRef.value?.data ?? []);
const chartData = computed(() =>
  tierFilter.value ? allData.value.filter(tierFilter.value) : allData.value
);

function onVisibleChange(filterFn) {
  tierFilter.value = filterFn;
}

function onBubbleClick(detail) {
  const azName = detail.azName || detail.name;
  tableRef.value?.scrollToByName(azName);
}
</script>

<style scoped lang="less">
.flex-center {
  display: flex;
  align-items: center;
}

.container {
  width: 1872px;
  border-radius: 16px;
  background-color: rgba(221, 227, 246, 0.4);
  box-shadow: 0 4px 4px 0 rgba(33, 48, 92, 0.2);
  padding: 24px 24px 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    column-gap: 8px;
    .title {
      font-size: 22px;
      font-weight: bold;
      line-height: 29px;
      color: #353575;
    }
  }

  .main {
    flex: 1;
    min-height: 0;
    gap: 24px;
    align-items: stretch;

    .main-left {
      flex-shrink: 0;
      width: 30px;
      min-width: 30px;
    }

    .main-right {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .chart-area {
        flex-shrink: 0;
        height: 380px;
      }
    }
  }
}
</style>
