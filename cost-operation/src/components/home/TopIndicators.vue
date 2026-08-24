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
        :ratio-value="formatRateValue(homoIndicatorsData.assetOnlineRate.compareLastMonVal)"
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
          :ratio-value="formatterValue(homoIndicatorsData.service.compareLastMonVal, 10000)"
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
</script>