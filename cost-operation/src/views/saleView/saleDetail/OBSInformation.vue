<template>
  <div class="container">
    <div class="title">
      <div class="section-title">
        <SvgIcon iconName="xpod-1" class="triangle-icon" :style="{ width: 20, height: 20 }" />
        <span class="title-text">关键信息</span>
      </div>
      <slot name="filter"></slot>
    </div>
    <div class="info">
      <div class="item" v-for="(item, index) in infors" :key="item.title">
        <div class="item-top">
          <SvgIcon :iconName="item.iconName" :style="{ width: 20, height: 20 }" />
          <span class="name">{{ item.title }}</span>
          <span class="unit">(PB)</span>
        </div>
        <div class="line"></div>
        <div class="item-bottom">
          <span class="value">
            {{ permissionTable.obs ? formatNumToLocalString(item.value) : '**' }}
          </span>
          <RingRatio
            v-if="permissionTable.obs"
            class="mgt10"
            label="较上月"
            data="Number(item.rate)"
            unit=""
            upGreen="false"
            noColor="true"
          ></RingRatio>
          <span v-else>**</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import RingRatio from '@/views/costOperation/component/RingRatio.vue';
import { formatNumToLocalString, formatterValue } from '@/utils';
import { keyInfor, permissionTable } from './useResourceData.js';

const infors = computed(() => {
  return [
    {
      title: 'OBS可售量',
      value: formatterValue(keyInfor.obs?.totalSellableCapacity, 1024),
      rate: formatterValue(keyInfor.obs?.totalSellableCapacityMom, 1024),
      iconName: 'luggage1',
    },
    {
      title: '单AZ可售量',
      value: formatterValue(keyInfor.obs?.azTotalSellableCapacity, 1024),
      rate: formatterValue(keyInfor.obs?.azTotalSellableCapacityMom, 1024),
      iconName: 'luggage2',
    },
    {
      title: '三AZ可售量',
      value: formatterValue(keyInfor.obs?.threeAzTotalSellableCapacity, 1024),
      rate: formatterValue(keyInfor.obs?.threeAzTotalSellableCapacityMom, 1024),
      iconName: 'luggage3',
    },
  ];
});
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  padding: 20px 24px 0px 24px;
  .title {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }

  .section-title {
    .title-text {
      color: rgba(51, 51, 107, 1);
      font-size: 20px;
      font-weight: 700;
      line-height: 28px;
      margin-left: 8px;
    }
  }

  .info {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    .item {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 8px;
      border-radius: 8px;
      background: #f0f2fb;
      padding: 12px 20px;
      .item-top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .line {
        width: 100%;
        height: 1px;
        background: rgba(223, 228, 245);
      }
      .name {
        color: rgba(51, 51, 107, 1);
        font-family: Microsoft YaHei;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
        letter-spacing: 0px;
        text-align: left;
      }
      .unit {
        color: rgba(98, 98, 168, 1);
        font-family: Microsoft YaHei;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: 0px;
        text-align: left;
      }
      .value {
        color: rgba(51, 51, 107, 1);
        font-family: Arial;
        font-size: 28px;
        font-weight: 700;
        line-height: 32px;
        letter-spacing: 0px;
        text-align: left;
        margin-right: 5px;
      }
    }
  }
}
</style>
