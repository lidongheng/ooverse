<template>
  <div class="information-panel">
    <div class="header-row">
      <div class="section-title">关键信息</div>
      <FilterDropdowns
        v-model="filterOtherValue"
        class="xpu-filter"
        :options="filterOptions"
        :filter-config="filterConfig"
      />
    </div>

    <div class="metric-row">
      <div
        v-for="item in xpuMetrics"
        :key="item.title"
        class="metric-card"
      >
        <div class="metric-title">▣ {{ item.title }}</div>
        <div class="metric-value">
          {{ item.value }}<span>{{ item.unit }} ▲{{ item.trend }}</span>
        </div>
      </div>
    </div>

    <div class="region-top-section">
      <div class="region-top-title">▣ Region Top</div>
      <CommonChart
        :options="regionTopOptions"
        :style="regionTopChartStyle"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import CommonChart from '@/components/CommonChart.vue';
import FilterDropdowns from '@/components/FilterDropdowns.vue';
import { useSaleFilterStore } from '../saleHome/useSaleFilter';
import { keyInfor } from './useResourceData';

const { filterOtherValue } = storeToRefs(useSaleFilterStore());

defineProps({
  filterConfig: {
    type: Array,
    required: true,
  },
  filterOptions: {
    type: Object,
    required: true,
  },
});

// XPU 卡片里的卡数统一用千分位展示，保持和表格数值风格一致。
const formatCardCount = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return Number(value).toLocaleString();
};

// 顶部三个指标卡保留截图文案，数值接入 XPU detail 接口状态。
const xpuMetrics = computed(() => {
  return [
    {
      title: '总待分配量（卡）',
      value: formatCardCount(keyInfor.xpu.totalUnallocatedXpu),
      unit: '纳上月',
      trend: formatCardCount(keyInfor.xpu.totalUnallocatedXpuMom),
    },
    {
      title: 'A3待分配量（卡）',
      value: formatCardCount(keyInfor.xpu.a3Unallocated),
      unit: '纳上月',
      trend: formatCardCount(keyInfor.xpu.a3UnallocatedMom),
    },
    {
      title: 'A2待分配量（卡）',
      value: formatCardCount(keyInfor.xpu.a2Unallocated),
      unit: '纳上月',
      trend: formatCardCount(keyInfor.xpu.a2UnallocatedMom),
    },
  ];
});

const regionTopChartStyle = {
  width: 1630,
  height: 240,
};

const regionTopList = computed(() => {
  if (!Array.isArray(keyInfor.xpu.topList)) {
    return [];
  }

  return keyInfor.xpu.topList.slice(0, 10);
});

// Region Top 使用同一份 detail 响应，筛选刷新后 CommonChart 会同步更新。
const regionTopOptions = computed(() => ({
  color: ['#5b57b7', '#4b9fe5'],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    top: 0,
    right: 12,
    itemWidth: 12,
    itemHeight: 12,
    textStyle: {
      color: '#6262a8',
      fontSize: 12,
    },
    data: ['A3', 'A2'],
  },
  grid: {
    left: 54,
    right: 24,
    top: 36,
    bottom: 48,
  },
  xAxis: {
    type: 'category',
    data: regionTopList.value.map((item) => item.regionName),
    axisTick: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: '#e8eaf3',
      },
    },
    axisLabel: {
      interval: 0,
      color: '#77799e',
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value',
    name: '卡',
    nameTextStyle: {
      color: '#77799e',
      align: 'right',
    },
    axisLabel: {
      color: '#77799e',
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#eef0f7',
      },
    },
  },
  series: [
    {
      name: 'A3',
      type: 'bar',
      stack: 'xpu',
      barMaxWidth: 46,
      data: regionTopList.value.map((item) => Number(item.a3Unallocated)),
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontSize: 12,
      },
    },
    {
      name: 'A2',
      type: 'bar',
      stack: 'xpu',
      barMaxWidth: 46,
      data: regionTopList.value.map((item) => Number(item.a2Unallocated)),
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontSize: 12,
      },
    },
  ],
}));
</script>

<style scoped lang="less">
.information-panel {
  min-width: 0;
  padding: 18px 20px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.header-row {
  display: flex;
  align-items: center;
}

.header-row {
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title,
.metric-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.xpu-filter {
  flex-shrink: 0;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  min-height: 92px;
  padding: 8px 16px 8px 0;
  border-right: 1px solid #eef0f8;
}

.metric-card:last-child {
  border-right: 0;
}

.metric-value {
  margin-top: 16px;
  color: #333376;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.metric-value span {
  margin-left: 8px;
  color: #77799e;
  font-size: 13px;
  font-weight: 400;
}

.region-top-section {
  margin-top: 18px;
}

.region-top-title {
  margin-bottom: 4px;
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

</style>
