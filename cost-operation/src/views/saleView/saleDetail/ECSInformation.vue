<template>
  <div class="information-panel">
    <div class="panel-row header-row">
      <div class="section-title">算力类型</div>
      <div class="header-actions">
        <button
          type="button"
          class="distribution-button"
          @click="toggleDistribution"
        >
          {{ distributionButtonText }}
        </button>
        <div class="filters">
          <el-select model-value="全部" size="small">
            <el-option label="全部" value="全部" />
          </el-select>
          <el-select model-value="全部" size="small">
            <el-option label="全部" value="全部" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="metric-grid">
      <div
        v-for="item in ecsMetrics"
        :key="item.title"
        class="metric-card"
      >
        <div class="metric-title">
          <span class="title-icon">✦</span>
          {{ item.title }}
        </div>
        <div class="metric-body">
          <div class="metric-number">
            {{ item.value }}<span>{{ item.unit }}</span>
          </div>
          <div class="metric-trend">▼{{ item.trend }}</div>
        </div>
        <div class="spec-list">
          <div
            v-for="spec in item.specs"
            :key="spec.label"
            class="spec-item"
          >
            <span>{{ spec.label }}</span>
            <strong>{{ spec.value }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showDistribution"
      class="bar-row"
    >
      <div
        v-for="item in ecsBars"
        :key="item.title"
        class="bar-card"
      >
        <CommonChart
          :options="createBarOption(item)"
          :style="barChartStyle"
        />
      </div>
    </div>

    <div class="generation-row">
      <div
        v-for="item in ecsGenerationMetrics"
        :key="item.title"
        class="generation-card"
      >
        <span class="title-icon">✹</span>
        <span class="generation-title">{{ item.title }}</span>
        <strong>{{ item.value }}</strong>
        <span class="unit">{{ item.unit }}</span>
        <span class="trend">环比 ▼{{ item.trend }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import CommonChart from '@/components/CommonChart.vue';
import { ecsBars, ecsGenerationMetrics, ecsMetrics } from './staticData';

const showDistribution = ref(false);
const barChartStyle = {
  width: 300,
  height: 176,
};
const distributionButtonText = computed(() => {
  if (showDistribution.value) {
    return '收起算力分布';
  }

  return '展开算力分布';
});

function toggleDistribution() {
  showDistribution.value = !showDistribution.value;
}

function createBarOption(item) {
  return {
    grid: {
      left: 36,
      right: 16,
      top: 18,
      bottom: 48,
    },
    xAxis: {
      type: 'category',
      data: item.data.map((barItem) => barItem.name),
      axisLabel: {
        color: '#8b8cae',
        rotate: 38,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: '#eef0f8',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '万核',
      nameTextStyle: {
        color: '#8b8cae',
        fontSize: 10,
      },
      axisLabel: {
        color: '#8b8cae',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: '#edf0f8',
        },
      },
    },
    series: [
      {
        name: item.title,
        type: 'bar',
        barWidth: 22,
        data: item.data.map((barItem) => barItem.value),
        itemStyle: {
          color: '#78a9e8',
          borderRadius: [3, 3, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: '#34356f',
          fontSize: 10,
        },
      },
    ],
  };
}
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

.panel-row,
.metric-title,
.metric-body,
.generation-card,
.header-actions,
.filters {
  display: flex;
  align-items: center;
}

.header-row {
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.header-actions {
  gap: 14px;
}

.distribution-button {
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6262a8;
  cursor: pointer;
  font-size: 14px;
}

.distribution-button::after {
  margin-left: 4px;
  content: '⌄';
  font-size: 12px;
}

.filters {
  gap: 12px;
}

.filters :deep(.el-select) {
  width: 128px;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1.35fr 1.35fr 1fr;
  gap: 22px;
}

.metric-card {
  min-width: 0;
  padding: 8px 4px 12px;
  border-right: 1px solid #eef0f8;
}

.metric-card:last-child {
  border-right: 0;
}

.metric-title {
  color: #34356f;
  font-size: 16px;
  font-weight: 700;
  gap: 7px;
}

.title-icon {
  color: #6262c6;
  font-size: 14px;
}

.metric-body {
  gap: 14px;
  margin-top: 10px;
}

.metric-number {
  color: #333376;
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.metric-number span {
  margin-left: 5px;
  color: #7b7da3;
  font-size: 14px;
  font-weight: 400;
}

.metric-trend,
.trend {
  color: #34356f;
  font-size: 12px;
}

.spec-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
  margin-top: 16px;
}

.spec-item {
  color: #7b7da3;
  font-size: 13px;
  line-height: 18px;
}

.spec-item strong {
  margin-left: 6px;
  color: #34356f;
  font-size: 17px;
}

.generation-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin-top: 12px;
}

.generation-card {
  min-height: 78px;
  padding: 10px 12px;
  box-sizing: border-box;
  color: #34356f;
  gap: 8px;
}

.generation-title {
  font-size: 14px;
  font-weight: 700;
}

.generation-card strong {
  margin-left: auto;
  font-size: 34px;
  line-height: 1;
}

.unit {
  color: #7b7da3;
  font-size: 13px;
}

.bar-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 8px;
}

.bar-card {
  height: 176px;
}
</style>
