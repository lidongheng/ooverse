<template>
  <div
    class="warpper flex-center common-card-style2 top-indicators"
    :class="{
      detail: isDetailPage,
      pointer: !isDetailPage,
    }"
    @click="toIndicatorsPage"
  >
    <div class="w-419 flex-center">
      <CommonIndicators
        :value="toBillion(homoIndicatorsData.totalCost.cost)"
        :ratio-value="toBillion(homoIndicatorsData.totalCost.momValue)"
        label="总流水"
        ratio-unit="亿元"
        unit="亿元(RMB)"
        icon-name="top-total"
      />
      <CommonChart :style="chartStyle" :options="totalOptions" />
    </div>
    <div class="line"></div>
    <div class="w-419 flex-center">
      <CommonIndicators
        :value="toBillion(homoIndicatorsData.total.cost)"
        :ratio-value="toBillion(homoIndicatorsData.total.momValue)"
        :upGreen="false"
        label="总成本"
        ratio-unit="亿元"
        unit="亿元(RMB)"
        icon-name="top-cost-total"
      />
      <CommonChart :style="chartStyle" :options="totalCostOptions" />
    </div>
    <div class="line"></div>

    <div class="w-419 flex-center">
      <CommonIndicators
        :value="formatRateValue(homoIndicatorsData.assetOnlineRate.curValue)"
        :ratio-value="
          formatRateValue(homoIndicatorsData.assetOnlineRate.compareLastMonVal)
        "
        label="资产在线率"
        ratio-unit="PCT"
        unit="%"
        icon-name="top-asset"
      >
        <!--<template #light>
          <SvgIcon :class="cpuLightClass" icon-name="top-light-green"></SvgIcon>
        </template>
        <template #challenge>
          <div class="item-top-target">
            <div class="target">目标: {{ formatRateValue(homoIndicatorsData.assetOnlineRate.targetVal) }}%</div>
            <div class="challenge">挑战: {{ formatRateValue(homoIndicatorsData.assetOnlineRate.challengeVal) }}%</div>
          </div>
        </template>-->
      </CommonIndicators>
      <CommonChart :style="chartStyle" :options="assetOptions" />
    </div>
    <template v-if="!isDetailPage">
      <div class="line"></div>
      <div class="w-419 flex-center">
        <CommonIndicators
          :value="formatterValue(homoIndicatorsData.service.curValue, 10000)"
          :ratio-value="
            formatterValue(homoIndicatorsData.service.compareLastMonVal, 10000)
          "
          label="服务器"
          ratio-unit="万台"
          unit="万台"
          icon-name="top-service"
        />
        <CommonChart
          :style="{ width: 154, height: 98 }"
          :options="serviceOptions"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import CommonChart from '@/components/CommonChart.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { computed, ref } from 'vue';
import { toBillion, formatRateValue, formatterValue } from '@/utils';
import {
  commonChartOptions,
  commonLabelPopover,
  sortTrend,
  homoIndicatorsData,
  cpuLightClass,
} from '../hooks/useIndicators';
import { useRouter } from 'vue-router';
import CommonIndicators from './CommonIndicators.vue';

const props = defineProps({
  isDetailPage: {
    type: Boolean,
    default: false,
  },
});

const chartStyle = {
  width: 158,
  height: 98,
};

const router = useRouter();
const toIndicatorsPage = () => {
  if (props.isDetailPage) {
    return;
  }
  router.push({
    path: '/indicators',
  });
};

const colors = ['rgba(98, 98, 168, 1)'];

// 服务器趋势图
const serviceOptions = computed(() => {
  const comOp = commonChartOptions();
  const data = homoIndicatorsData.service.trend ?? [];

  const { data: xAxisData } = comOp.xAxis;

  return {
    ...comOp,
    yAxis: {
      ...comOp.yAxis,
      name: '万台',
    },
    color: colors,
    series: [
      {
        ...comOp.series[0],
        data: xAxisData.map((v, index) => {
          const seriesObj = data.find((c) => c.key === v) ?? {};
          return {
            value: formatterValue(seriesObj.value, 10000),
            name: v,
            ...commonLabelPopover(index, xAxisData.length - 1),
          };
        }),
      },
    ],
  };
});

const assetOptions = computed(() => {
  const lineValue = formatRateValue(
    homoIndicatorsData.assetOnlineRate.targetVal,
  );
  const comOp = commonChartOptions();
  const data = homoIndicatorsData.assetOnlineRate.trend ?? [];

  const { data: xAxisData } = comOp.xAxis;

  return {
    ...comOp,
    yAxis: {
      ...comOp.yAxis,
      name: '%',
    },
    color: colors,
    series: [
      {
        ...comOp.series[0],
        data: xAxisData.map((v, index) => {
          const seriesObj = data.find((c) => c.key === v) ?? {};
          return {
            value: formatRateValue(seriesObj.value, 2),
            name: v,
            ...commonLabelPopover(index, xAxisData.length - 1),
          };
        }),
      },
    ],
  };
});

// 总流水
const totalOptions = computed(() => {
  const comOp = commonChartOptions();
  const seriesData = sortTrend(homoIndicatorsData.totalCost.trend ?? []);
  const { data: xAxisData } = comOp.xAxis;
  return {
    ...comOp,
    yAxis: {
      ...comOp.yAxis,
    },
    color: colors,
    series: [
      {
        ...comOp.series[0],
        data: xAxisData.map((v, index) => {
          const seriesObj = seriesData.find((c) => c.axisX === v) ?? {};
          return {
            value: toBillion(seriesObj.cost),
            name: v,
            ...commonLabelPopover(index, xAxisData.length - 1),
          };
        }),
      },
    ],
  };
});

// 总成本
const totalCostOptions = computed(() => {
  const comOp = commonChartOptions();
  const seriesData = sortTrend(homoIndicatorsData.total.trend ?? []);
  const { data: xAxisData } = comOp.xAxis;

  return {
    ...comOp,
    yAxis: {
      ...comOp.yAxis,
      name: '亿元',
    },
    color: colors,
    series: [
      {
        ...comOp.series[0],
        data: xAxisData.map((v, index) => {
          const seriesObj = seriesData.find((c) => c.axisX === v) ?? {};
          return {
            value: toBillion(seriesObj.cost),
            name: v,
            ...commonLabelPopover(index, xAxisData.length - 1),
          };
        }),
      },
    ],
  };
});
</script>

<style lang="less" scoped>
.value {
  color: rgba(53, 53, 117, 1);
  font-size: 40px;
  font-weight: 500;
  line-height: 47px;
  letter-spacing: 0px;
  text-align: left;
}

.unit {
  color: rgba(53, 53, 117, 1);
  font-family: Microsoft YaHei;
  font-size: 20px;
  font-weight: 400;
  line-height: 26px;
  letter-spacing: 0px;
  text-align: left;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.warpper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  color: rgba(53, 53, 117, 1);
  .w-419 {
    width: 419px;
    height: 98px;
  }
  .line {
    width: 1px;
    height: 96px;
    background: linear-gradient(
      180deg,
      rgba(158, 158, 208, 0) 1%,
      rgba(158, 158, 208, 1) 51%,
      rgba(158, 158, 208, 0) 100%
    );
  }
}

.warpper.detail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 20px;
  color: rgba(53, 53, 117, 1);
  .w-448 {
    width: 448px;
    height: 98px;
  }
  .line {
    width: 1px;
    height: 96px;
    margin-left: 144px;
    margin-right: 48px;
    background: linear-gradient(
      180deg,
      rgba(158, 158, 208, 0) 1%,
      rgba(158, 158, 208, 1) 51%,
      rgba(158, 158, 208, 0) 100%
    );
  }
}

.item-top-target {
  color: rgba(113, 113, 168, 1);
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0px;
  text-align: left;
  margin-left: 12px;
}

.jump-btn {
  position: absolute;
  top: 8px;
  right: 13px;
}
</style>
