<template>
  <div class="pl-analysis">
    <div class="chart-header">
      <span class="title-icon"></span>
      <h2 class="chart-title">盈亏分析</h2>
    </div>
    <div class="chart-box">
      <CommonChart
        :options="costLineOptionData"
        :style="{
          width: '100%',
          height: 420,
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import CommonChart from '@/components/CommonChart.vue';
import { setOption } from './useChartOption';
import { usePLAnalysis } from './usePLAnalysis';

const { monthLabels, revenue, cost, grossProfitRate, cpuUsage, fetchData } = usePLAnalysis();
fetchData(); // 组件 setup 时立即请求，不等待挂载

const costLineOptionData = computed(() => {
  const revenueData = revenue.value;
  const costData = cost.value;
  const grossData = grossProfitRate.value;
  const cpuData = cpuUsage.value;
  const months = monthLabels.value;

  const xAxisData = months;
  const yDataList = [
    {
      name: 'CPU使用率',
      color: 'rgba(53, 144, 204, 1)',
      data: cpuData,
    },
    {
      name: '销毛率',
      color: 'rgba(53, 144, 204, 1)',
      data: grossData,
    },
    {
      name: '流水',
      color: 'rgba(35, 208, 154, 1)',
      data: revenueData,
    },
    {
      name: '成本',
      color: 'rgba(98, 98, 168, 1)',
      data: costData,
    },
  ];
  const grid = { top: 60, bottom: 80, left: 60, right: 40 };
  const legendVal = { data: yDataList.map((i) => i.name) };
  let optionData = setOption({
    yDataList,
    xAxisData,
    grid,
    legendVal,
    hasPercentageData: true,
  });
  optionData.series[0].label.show = true;
  optionData.series[1].label.show = true;

  const hiddenLineStyle = { lineStyle: { opacity: 0 }, itemStyle: { opacity: 0 } };
  const makeAreaGradient = (fromColor, toColor) => ({
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: fromColor },
      { offset: 1, color: toColor },
    ],
  });

  const lowerBound = revenueData.map((rev, i) => Math.min(rev, costData[i]));
  optionData.xAxis.boundaryGap = false;
  optionData.series.push(
    {
      name: '下边界',
      type: 'line',
      stack: 'fillBand',
      data: lowerBound,
      yAxisIndex: 0,
      ...hiddenLineStyle,
      areaStyle: { opacity: 0 },
      smooth: true,
    },
    {
      name: '盈利',
      type: 'line',
      stack: 'fillBand',
      data: revenueData.map((rev, i) => (rev >= costData[i] ? rev - costData[i] : 0)),
      yAxisIndex: 0,
      ...hiddenLineStyle,
      areaStyle: { color: makeAreaGradient('rgba(35, 208, 154, 1)', 'rgba(35, 208, 154, 0)') },
      smooth: true,
    },
    {
      name: '亏损',
      type: 'line',
      stack: 'fillBand',
      data: revenueData.map((rev, i) => (costData[i] > rev ? costData[i] - rev : 0)),
      yAxisIndex: 0,
      ...hiddenLineStyle,
      areaStyle: { color: makeAreaGradient('rgba(245, 91, 91, 1)', 'rgba(245, 91, 91, 0)') },
      smooth: true,
    },
  );
  const displaySeries = ['CPU使用率', '销毛率', '流水', '成本'];
  const customTooltipConfig = {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: 'rgba(158, 158, 208, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: [12, 16],
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08);',
    formatter: function (params) {
      const month = params[0].axisValue;
      const idx = months.indexOf(month);
      const rev = revenueData[idx] ?? 0;
      const costVal = costData[idx] ?? 0;
      const profitValue = rev - costVal;
      let result = `<div class="pl-tooltip">
        <div class="pl-tooltip-title">${month}月盈亏分析</div>`;
      displaySeries.forEach((name) => {
        const param = params.find((p) => p.seriesName === name);
        if (!param) return;
        const isPercentage = name.includes('率');
        const unit = isPercentage ? ' %' : ' 亿元';
        const raw = param.value;
        const value = raw != null ? (typeof raw === 'number' ? (isPercentage ? raw.toFixed(1) : raw.toFixed(2)) : raw) : '-';
        result += `<div class="pl-tooltip-row">
          <span class="pl-tooltip-marker" style="background-color:${param.color}"></span>
          <span class="pl-tooltip-name">${name}：</span>
          <span class="pl-tooltip-val">${value}</span>
          <span class="pl-tooltip-unit">${unit}</span>
        </div>`;
      });
      result += `<div class="pl-tooltip-row pl-tooltip-row--summary">
        <span class="pl-tooltip-name">盈利：</span>
        <span class="pl-tooltip-val">${profitValue.toFixed(2)}</span>
        <span class="pl-tooltip-unit"> 亿元</span>
      </div>`;
      result += '</div>';
      return result;
    },
    confine: true,
  };
  optionData.tooltip = customTooltipConfig;
  return optionData;
})
</script>

<style lang="less" scoped>
.pl-analysis {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px 24px;
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.title-icon {
  width: 8px;
  height: 8px;
  background: #353575;
  border-radius: 1px;
  flex-shrink: 0;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #252b3a;
  letter-spacing: 0;
}

.chart-box {
  width: 100%;
  height: 420px;
  overflow: hidden;
  position: relative;

  :deep(.chart-dom) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>

<style lang="less">
.pl-tooltip {
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;

  .pl-tooltip-title {
    font-size: 16px;
    font-weight: 700;
    color: #353575;
    margin-bottom: 6px;
    line-height: 1.6;
  }

  .pl-tooltip-row {
    display: flex;
    align-items: baseline;
    line-height: 1.8;
    font-size: 15px;
    white-space: nowrap;

    .pl-tooltip-marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    .pl-tooltip-name {
      color: #353575;
    }

    .pl-tooltip-val {
      color: #252b8a;
      font-weight: 700;
    }

    .pl-tooltip-unit {
      color: #353575;
    }
  }

  .pl-tooltip-row--summary {
    padding-left: 16px;
  }
}
</style>
