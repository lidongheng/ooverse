<template>
  <div class="container">
    <div class="title">
      <div class="section-title">
        <SvgIcon iconName="xpod-1" :style="{ width: 20, height: 20 }" />
        <span class="title-text">运营代次</span>
      </div>
      <slot name="filter"></slot>
    </div>
    <div class="info-list">
      <div class="info" v-for="item in daiciList" :key="item.title2">
        <div class="title2">
          <SvgIcon :iconName="item.icon" class="triangle-icon" :style="{ width: 20, height: 20 }" />
          {{ item.title2 }}
        </div>
        <span class="num">{{ item.num }}</span>
        <span class="unit">万核</span>
        <span class="text">环比</span>
        <SvgIcon class="icon-trend" :iconName="Number(item.trend) < 0 ? 'ECSarrowdown' : 'ECSarrowup'" :style="{ width: 10, height: 10 }" />
        <span class="trend">{{ item.trend === '--' ? '--' : Math.abs(item.trend) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { formatNumToLocalString, formatterValue } from '@/utils';
import { keyInfor, permissionTable } from './useResourceData.js';

const toWan = (val) => (val !== null ? formatterValue(val, 10000, 2) : '--');

const daiciList = computed(() => [
  { title2: 'V5及以前', num: toWan(keyInfor.ecs?.operationV5PreviousItem?.value), trend: toWan(keyInfor.ecs?.operationV5PreviousItem?.compareValue), icon: 'ECSV5' },
  { title2: 'V6-V8', num: toWan(keyInfor.ecs?.operationV6ToV8Item?.value), trend: toWan(keyInfor.ecs?.operationV6ToV8Item?.compareValue), icon: 'ECSV68' },
  { title2: 'V9', num: toWan(keyInfor.ecs?.operationV9Item?.value), trend: toWan(keyInfor.ecs?.operationV9Item?.compareValue), icon: 'ECSV9' },
]);
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
  .info-list {
    display: flex;
    gap: 24px;
  }
  .info {
    flex: 1;
    min-width: 0;
    height: 48px;
    border-radius: 8px;
    background: rgba(240, 242, 251, 1);
    display: flex;
    align-items: center;
    gap: 4px;
    .title2 {
      display: flex;
      align-items: center;
      color: rgba(51, 51, 107, 1);
      font-size: 16px;
      font-weight: 700;
      line-height: 24px;
      margin-left: 28px;
      .triangle-icon {
        margin-right: 9px;
      }
    }
    .num {
      color: rgba(74, 74, 189, 1);
      font-size: 28px;
      font-weight: 700;
      line-height: 32px;
      margin-left: auto;
    }
    .unit {
      color: rgba(98, 98, 168, 1);
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      margin-top: 6px;
    }
    .text {
      color: rgba(98, 98, 168, 1);
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      margin-top: 6px;
    }
    .icon-trend {
      margin-top: 4px;
    }
    .trend {
      color: rgba(51, 51, 107, 1);
      font-size: 14px;
      font-weight: 700;
      line-height: 20px;
      margin-top: 6px;
      margin-right: 20px;
    }
  }
}
</style>
