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
        >
          <template #extra>
            <div class="server-region-summary">
              <div class="server-region-summary__item">
                <span>公网Region:</span>
                <span class="server-region-summary__value">
                  {{ toWan(homeCardData.eff.commonComputing.publicRegionServerNum) }}
                </span>
                <span>万台</span>
              </div>
              <div class="server-region-summary__item">
                <span>非公网Region:</span>
                <span class="server-region-summary__value">
                  {{ toWan(homeCardData.eff.commonComputing.nonPublicRegionServerNum) }}
                </span>
                <span>万台</span>
              </div>
            </div>
          </template>
        </CommonLineCard>
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

<style lang="less" scoped>
.flex-column {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  > .card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.card-gap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .home-common-card {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }
}

.server-region-summary {
  margin-top: 6px;
  color: #6262a8;
  font-size: 12px;
  line-height: 18px;

  &__item {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  &__value {
    margin-left: auto;
    margin-right: 4px;
    color: #353575;
    font-family: Arial;
    font-weight: 700;
  }
}
</style>
