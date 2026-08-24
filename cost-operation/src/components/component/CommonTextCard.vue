<template>
  <div class="home-common-card">
    <div class="label">
      {{ options.label }}
      <span class="subtitle">{{ options.subLabel }}</span>
    </div>

    <div class="flex-center between">
      <div class="value">
        <span style="margin-right: 0.25rem">{{ showValue(options.value) }}</span>
        <span class="unit">{{ options.unit }}</span>
      </div>

      <div class="text-right">
        <RingRatio
          :upGreen="options.upGreen"
          :small="true"
          :unit="options.ratioUnit"
          :data="options.ratioValue"
        >
          <template #text>
            <span></span>
          </template>
        </RingRatio>
        <div class="unit">环比</div>
      </div>
    </div>

    <div class="label mgt16">
      {{ options2.label }}
      <span class="subtitle">{{ options2.subLabel }}</span>
    </div>

    <div class="flex-center between">
      <div class="value">
        <span style="margin-right: 0.25rem">{{ showValue(options2.value) }}</span>
        <span class="unit">{{ options2.unit }}</span>
      </div>

      <div class="text-right">
        <RingRatio
          :upGreen="options2.upGreen"
          :small="true"
          :unit="options2.ratioUnit"
          :data="options2.ratioValue"
        >
          <template #text>
            <span></span>
          </template>
        </RingRatio>
        <div class="unit">环比</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RingRatio from './RingRatio.vue';
import { numberToENUS } from '@shared/business/formatFunction';

const props = defineProps({
  options: {
    type: Object,
  },
  options2: {
    type: Object,
  },
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
  .between {
    justify-content: space-between;
    position: relative;
  }
  .text-right {
    text-align: right;
    position: absolute;
    right: 0;
    top: 0;
    .unit {
      color: rgba(98, 98, 168, 1);
      font-family: Microsoft YaHei;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0px;
      padding-right: 3px;
      margin-top: 3px;
    }
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