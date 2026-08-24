<template>
  <div class="item-box">
    <div class="item-top">
      <div class="item-top-light" v-if="$slots.light">
        <slot name="light"></slot>
      </div>
      <div class="item-top-num">{{ value }}</div>
      <div class="item-top-unit">{{ unit }}</div>
      <slot name="challenge"></slot>
      <slot name="rightRatio"></slot>
    </div>
    <div class="item-bottom">
      <SvgIcon
        :icon-name="iconName"
        :style="{ width: 20, height: 20, color: '#6262a8' }"
      ></SvgIcon>
      <div class="item-bottom-label">{{ label }}</div>
      <RingRatio
        lable="较上月"
        class="ring-ratio"
        :data="ratioValue"
        :unit="ratioUnit"
        v-if="!hideRatio"
        :upGreen="upGreen"
      >
        <template #unit v-if="ratioUnit !== '%'">{{ ratioUnit }}</template>
      </RingRatio>
    </div>
  </div>
</template>

<script setup>
import RingRatio from '../component/RingRatio.vue';

const props = defineProps({
  value: {
    type: [Number, String],
  },
  unit: {
    type: String,
  },
  iconName: {
    type: String,
  },
  label: {
    type: String,
  },
  ratioValue: {
    type: Number,
  },
  ratioUnit: {
    type: String,
  },
  hideRatio: {
    type: Boolean,
    default: false,
  },
  upGreen: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
.item-box {
  .item-top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .item-top-light {
      margin-right: 10px;
    }
    .item-top-num {
      font-family: Arial;
      font-size: 40px;
      font-weight: 700;
      line-height: 36px;
      letter-spacing: 0px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .item-top-unit {
      font-family: Microsoft YaHei;
      font-size: 16px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0px;
      text-align: left;
      margin-left: 4px;
      margin-top: 12px;
    }
    .item-top-target {
      margin-left: 12px;
    }
    .mgl27 {
      margin-left: 27px;
    }
    .item-top-text {
      border-radius: 10px;
      background: rgba(113, 90, 251, 1);
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      letter-spacing: 0px;
      text-align: left;
      margin-left: 10px;
      padding: 0px 4px;
    }
  }
  .item-bottom {
    display: flex;
    align-items: center;
    white-space: nowrap;
    .item-bottom-icon {
      width: 16px;
      height: 16px;
    }
    .item-bottom-label {
      color: rgba(53, 53, 117, 1);
      font-family: Microsoft YaHei;
      font-size: 20px;
      font-weight: 700;
      height: 28px;
      line-height: 28px;
      letter-spacing: 0px;
      text-align: left;
      margin-right: 12px;
      margin-left: 8px;
    }
    .ring-ratio {
      margin-top: 8px;
    }
  }
}
</style>
