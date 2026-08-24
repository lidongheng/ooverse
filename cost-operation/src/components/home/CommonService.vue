<template>
  <div class="flex-column">
    <Card title="通算" @detailClick="router.push('./generalCompute')">
      <div class="card-gap">
        <CommonLineCard
          :options="{
            label: '流水',
            unit: '亿元',
            ratioUnit: '%',
            value: toBillion(homeCardData.recurringRevenue.commonComputing.value),
            ratioValue: formatRateValue(homeCardData.recurringRevenue.commonComputing.mom),
            chartData: homeCardData.recurringRevenue.commonComputing.trends,
            changeFn: toBillion,
          }"
        />
        <CommonLineCard
          :options="{
            label: '成本',
            unit: '亿元',
            ratioUnit: '%',
            value: toBillion(homeCardData.cost.commonComputing.value),
            ratioValue: formatRateValue(homeCardData.cost.commonComputing.mom),
            chartData: homeCardData.cost.commonComputing.trends,
            changeFn: toBillion,
            upGreen: false,
          }"
        />
        <CommonLineCard
          :options="{
            label: '通算服务器',
            unit: '万台',
            value: toWan(homeCardData.eff.commonComputing.curValue),
            ratioValue: homeCardData.eff.commonComputing.compareLastMonVal,
            chartData: homeCardData.eff.commonComputing.trend,
            ratioUnit: '台',
            ratioFixed: 0,
            changeFn: toWan,
            upGreen: false,
          }"
        />
        <CommonProgressCard
          :options="{
            label: 'CPU 使用率',
            unit: '%',
            ratioUnit: '%',
            target: formatRateValue(homeCardData.operate.commonComputing?.targetVal),
            value: formatRateValue(homeCardData.operate.commonComputing?.curValue),
            ratioValue: formatRateValue(homeCardData.operate.commonComputing?.compareLastMonVal),
            iconName: 'card-cpu',
          }"
        />
      </div>
    </Card>
    <Card title="智算" @detailClick="router.push('./aiCompute')" iconName="aicompute">
      <div class="card-gap">
        <CommonLineCard
          :options="{
            label: '流水',
            unit: '亿元',
            ratioUnit: '%',
            // value: toBillion(homeCardData.recurringRevenue.intelligentComputing.value),
            // ratioValue: formatRateValue(homeCardData.recurringRevenue.intelligentComputing.mom),
            value: '--',
            ratioValue: '--',
            chartData: homeCardData.recurringRevenue.intelligentComputing.trends,
            changeFn: toBillion,
          }"
        />
        <CommonLineCard
          :options="{
            label: '成本',
            unit: '亿元',
            ratioUnit: '%',
            // value: toBillion(homeCardData.cost.intelligentComputing.value),
            // ratioValue: formatRateValue(homeCardData.cost.intelligentComputing.mom),
            value: '--',
            ratioValue: '--',
            chartData: homeCardData.cost.intelligentComputing.trends,
            changeFn: toBillion,
            upGreen: false,
          }"
        />
        <CommonTextCard
          :options="{
            label: '昇腾卡数',
            unit: '万卡',
            ratioUnit: '',
            value: toWan(homeCardData.eff.intelligentComputing.curValue),
            ratioValue: toWan(homeCardData.eff.intelligentComputing.compareLastMonVal),
            upGreen: false,
          }"
          :options2="{
            label: '总算力数',
            unit: 'EFlops',
            ratioUnit: '',
            value: formatterValue(homeCardData.eFlops.curValue, 1000000),
            ratioValue: formatterValue(homeCardData.eFlops.compareLastMonVal, 1000000),
            upGreen: false,
          }"
        />
        <CommonProgressCard
          :options="{
            label: 'AI Core利用率',
            unit: '%',
            ratioUnit: '%',
            target: formatRateValue(homeCardData.operate.intelligentComputing.targetVal),
            value: formatRateValue(homeCardData.operate.intelligentComputing.curValue),
            ratioValue: formatRateValue(homeCardData.operate.intelligentComputing.compareLastMonVal),
            iconName: 'card-fenpeiIv',
          }"
        />
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';
import { useI18n } from 'vue-i18n';
import Card from '../component/Card.vue';
import CommonLineCard from '../component/CommonLineCard.vue';
import CommonTextCard from '../component/CommonTextCard.vue';
import CommonProgressCard from '../component/CommonProgressCard.vue';
import { formatRateValue, formatterValue, toBillion, toWan } from '@/utils';
import { homeCardData } from '@/views/hooks/useIndicators';

const { t, locale } = useI18n();
const state = ref();
const props = defineProps({});
</script>
