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
      <div class="trend-chart" v-if="permissionTable.obs">
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
import { ref, computed } from 'vue';
import { keyInfor, permissionTable } from './useResourceData.js';
import CommonChart from '@/components/CommonChart.vue';
import NoPermissionCard from '@/components/component/NoPermissionCard.vue';
import { formatNumToLocalString, formatterValue } from '@/utils';
import { commonChartOptions } from '@/views/hooks/useIndicators';
import { changeValueByScale } from '@/composables/autoLayout';

const props = defineProps({
  width: {
    type: Number,
    default: 1000,
  },
  hasY2: {
    type: Boolean,
    default: false,
  },
});

const legends = [
  {
    name: '单 AZ',
    key: 'azTotalSellableCapacity',
    color: 'rgba(137, 135, 203, 1)',
    stack: 'az',
    type: 'bar',
    yIndex: 0,
    unit: 'PB',
    gap: 1024,
    fixed: 2,
  },
  {
    name: '三 AZ',
    key: 'threeAzTotalSellableCapacity',
    color: 'rgba(179, 213, 255, 1)',
    stack: 'az',
    type: 'bar',
    yIndex: 0,
    unit: 'PB',
    gap: 1024,
    fixed: 2,
  },
];

const trendRef = ref(null);

const y2Axis = computed(() => {
  return props.hasY2
    ? [
        {
          type: 'value',
          name: '',
          show: false,
          axisLabel: {
            fontSize: changeValueByScale(14),
            fontWeight: changeValueByScale(400),
          },
          splitLine: {
            show: false, // 右侧 Y 轴不显示分割线
          },
        },
      ]
    : [];
});

const monthOptions = computed(() => {
  // keyInfor.obs 这个是对接后端的数据
  const trendData = (keyInfor.obs.topTenList ?? []).sort(
    (a, b) => Number(b.totalSellableCapacity) - Number(a.totalSellableCapacity),
  );
  const xData = trendData.map((v) => v.regionName);

  const maxTotal = Math.max(
    ...trendData.map(
      (t) => Number(formatterValue(t.totalSellableCapacity, 1024, 2)) || 0,
    ),
    0,
  );
  const minLabelValue = maxTotal * 0.1;

  const options = {
    ...commonChartOptions(),
    grid: {
      left: changeValueByScale(40),
      bottom: changeValueByScale(40),
      right: changeValueByScale(20),
      top: changeValueByScale(40),
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const unit = 'PB';
        const name = params?.[0].name;
        const regionItem = trendData?.find((v) => v.regionName === name);
        const tooltipContent = params
          .map((param) => {
            const { seriesName, seriesType, value = null, color } = param;
            const val = value ?? '--';

            // 根据系列类型生成不同的颜色块
            const colorBox =
              seriesType === 'line'
                ? `<div class="tooltip-icon-circle" style="display:inline-block; width:${changeValueByScale(8)}px; height:${changeValueByScale(8)}px; background-color:#fff; margin-right:${changeValueByScale(6)}px; border-radius: 50%;border:${changeValueByScale(3)}px solid ${color};line-height:${changeValueByScale(21)}px"></div>`
                : `<div style="display:inline-block; width:${changeValueByScale(12)}px; height:${changeValueByScale(12)}px; background-color:${color}; margin-right:${changeValueByScale(4)}px; border-radius: ${changeValueByScale(2)}px; line-height:${changeValueByScale(21)}px"></div>`;

            return `${colorBox}
          <span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;">${seriesName} : </span><span style="font-weight: bold;font-size:${changeValueByScale(16)}px;">${formatNumToLocalString(val)}</span><span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;"> ${unit}</span>
          `;
          })
          .join('</br>');

        const colorBox1 = `<div class="tooltip-icon-circle" style="display:inline-block; width:${changeValueByScale(12)}px; height:${changeValueByScale(12)}px; background-color:#fff; margin-right:${changeValueByScale(10)}px; border-radius: 50%;border:${changeValueByScale(3)}px solid #fff;line-height:${changeValueByScale(21)}px"></div>`;

        const htmlTotal = `${colorBox1}<span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;">总共 : </span><span style="font-weight: bold;font-size:${changeValueByScale(16)}px;">${formatNumToLocalString(formatterValue(regionItem?.totalSellableCapacity, 1024, 2))}</span><span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;"> ${unit}</span>`;

        const htmls = `<div class="tooltip-container"><span style="font-weight: bold;font-size: ${changeValueByScale(14)}px; color: #252B3A;">${name}</span><br/>${htmlTotal}<br/>${tooltipContent}</div>`;

        return htmls;
      },
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisTick: { show: false },
      boundaryGap: true,
      axisLine: {
        linestyle: {
          color: 'rgba(158, 158, 208, 0.2)', // 这里设置轴线颜色
        },
      },
      axisLabel: {
        interval: 0,
        fontSize: changeValueByScale(14),
        fontWeight: changeValueByScale(400),
        formatter: function (value, index) {
          if (value && value.length > 10) {
            return `${value.substr(0, 10)}...`;
          }
          return value;
        },
      },
    },
    legend: {
      data: legends.map((v) => v.name),
      right: changeValueByScale(20),
      top: changeValueByScale(0),
      itemWidth: changeValueByScale(12),
      itemHeight: changeValueByScale(12),
      textStyle: {
        fontFamily: 'Microsoft YaHei',
        fontWeight: changeValueByScale(400),
        fontSize: changeValueByScale(14),
        color: 'rgba(37, 43, 58, 1)',
      },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          show: true,
          fontSize: changeValueByScale(14),
          fontWeight: changeValueByScale(400),
        },
        axisTick: {
          show: false,
        },
        name: 'PB',
        splitLine: {
          show: true,
          lineStyle: {
            width: changeValueByScale(1),
            type: 'dashed',
            color: 'rgba(158, 158, 208, 0.2)',
          },
        },
      },
      ...y2Axis.value,
    ],
    series: legends.map((v, i) => {
      return {
        name: v.name,
        type: v.type,
        stack: v.stack,
        data: trendData.map((t) => formatterValue(t[v.key], v.gap, v.fixed)),
        label: {
          show: true,
          color: '#fff',
          fontSize: 10,
          formatter: (params) => {
            return params.value >= minLabelValue ? params.value : '';
          },
        },
        labelLayout: {
          hideOverlap: true, // 自动隐藏重叠的标签
        },
        itemStyle: {
          color: v.color,
          borderWidth: 0,
          borderRadius:
            i === 0
              ? [0, 0, 0, 0]
              : [changeValueByScale(4), changeValueByScale(4), 0, 0],
        },
        lineStyle: {
          width: 2,
          color: v.color,
        },
        barWidth: `${changeValueByScale(50)}px`,
        silent: true,
      };
    }),
  };

  return options;
});
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
