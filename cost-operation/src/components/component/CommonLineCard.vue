<template>
  <div
    class="home-common-card"
    :class="{ full: options.chartRight }">
    <div class="label">
      {{ options.label }}
      <span class="subtitle">{{ options.subLabel }}</span>
    </div>
    <div class="value" :class="{ marginValue: options.chartRight }">
      <span style="margin-right: 0.25rem">{{
        forbidden ? '**' : showValue(options.value)
      }}</span>
      <span class="unit">{{ options.unit }}</span>
    </div>
    <RingRatio
      :upGreen="options.upGreen"
      :label="options.ratioLabel"
      :small="true"
      :unit="options.ratioUnit"
      :data="forbidden ? '***' : options.ratioValue"
      :ratioFixed="options.ratioFixed"
    >
      <template #unit v-if="options.ratioUnit && options.ratioUnit !== '%'">
        <span>{{ options.ratioUnit }}</span>
      </template>
    </RingRatio>
    <CommonChart
      :class="{ chartRight: options.chartRight }"
      :options="chartOptions"
      :style="{ width: options.chartRight ? 250 : 156, height: options.chartRight ? 140 : 56 }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import RingRatio from './RingRatio.vue';
import CommonChart from '@/components/CommonChart.vue';
import { changeValueByScale } from '@/composables/autoLayout';
import { mapToArray } from '@/utils';
import { numberToENUS } from '@/shared/business/formatFunction';

const props = defineProps({
  forbidden: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
  },
});

const chartOptions = computed(() => {
  const sourceData = props.options.chartData instanceof Array
    ? props.options.chartData
    : mapToArray(props.options.chartData);
  const changeFn = props.options.changeFn;
  return {
    color: [
      {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(27, 204, 142, 0.3)', // 0% 处的颜色
          },
          {
            offset: 0.5,
            color: 'rgba(27, 204, 142, 0.1)', // 0% 处的颜色
          },
          {
            offset: 1,
            color: 'rgba(27, 204, 142, 0.01)', // 100% 处的颜色
          },
        ],
      },
    ],
    grid: {
      top: changeValueByScale(18),
      left: changeValueByScale(15),
      right: changeValueByScale(20),
      bottom: changeValueByScale(8)
    },
    xAxis: {
      show: false,
      data: sourceData.map((v) => v.label || v.key || v.month),
      boundaryGap: false
    },
    yAxis: {
      show: false
    },
    tooltip: {
      show: true,
      backgroundColor: "#3a3e44",
      borderColor: "#3a3e44",
      textStyle: {
        color: "#fff"
      },
      axisPointer: {
        type: "none"
      },
      trigger: "axis"
    },
    series: [
      {
        data: sourceData.map((v, index) => {
          return {
            value: changeFn(v.value),
            symbol: circle,
            showAllSymbol: true,
            symbolSize: changeValueByScale(8),
            itemStyle: {
              color: "#fff",
              borderColor: "#1BCC8E",
              borderWidth: "changeValueByScale(3)",
              opacity: index === sourceData.length - 1 ? 1 : 0
            },
            label: {
              show: true,
              position: "top",
              fontSize: changeValueByScale(10),
              color: "rgba(53, 53, 117, 1)",
              distance: 0
            },
            emphasis: {
              itemStyle: {
                opacity: 1
              },
              label: {
                show: true,
                opacity: 1
              }
            },
          }
        }),
        type: "line",
        smooth: true,
        showAllSymbol: true,
        areaStyle: {},
        labelLayout: {
          hideOverlap: false
        },
        lineStyle: {
          width: changeValueByScale(2),
          color: "#1BCC8E"
        }
      }
    ]
  };
});

const showValue = (value) => {
  if (['**', '--'].includes(value)) {
    return value;
  } else {
    return numberToENUS(value);
  }
};
</script>

<style lang="less" scoped>
.home-common-card {
  &.full {
    width: 100%;
    position: relative;
  }
  .chartRight {
    position: absolute;
    right: 20px;
    bottom: 12px;
  }
  .label {
    color: rgba(53, 53, 117, 1);
    font-family: Microsoft YaHei;
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    .subtitle {
      color: #b1b1d4;
      margin-left: 2px;
    }
  }
  .value {
    margin-top: 4px;
    color: rgba(53, 53, 117, 1);
    font-family: Arial;
    font-size: 28px;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 0px;
    text-align: left;
    &.marginValue {
      margin: 10px 0;
    }
    .unit {
      color: rgba(53, 53, 117, 1);
      font-family: Microsoft YaHei;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0px;
      text-align: left;
    }
  }
}
</style>
