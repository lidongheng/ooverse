<template>
  <div class="container">
    <div class="title">
      <div class="section-title">
        <SvgIcon iconName="xpod-1" class="triangle-icon" :style="{ width: 20, height: 20 }" />
        <span class="title-text">算力类型</span>
      </div>
      <div class="title-right">
        <slot name="filter"></slot>
        <div class="collapse-toggle" v-if="showCollapse" @click="toggleCollapse">
          <span class="collapse-text">{{ isCollapsed ? '展开算力分布' : '收起算力分布' }}</span>
          <span class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }">
            <SvgIcon iconName="left-return" :style="{ width: 12, height: 12 }" />
          </span>
        </div>
      </div>
    </div>
    
    <div :class="{ info: true, 'info-1': !isCollapsed }">
      <div class="item-all">
        <div class="item-top">
          <SvgIcon iconName="summary" class="triangle-icon" :style="{ width: 20, height: 20 }" />
          <span class="name">总可售量</span>
          <span class="unit">(万核)</span>
        </div>
        <div class="line"></div>
        <div class="item-bottom-all">
          <div class="value-total">
            {{ permissionTable.ecs ? totalSellableValue : '**' }}
          </div>
          <div class="bottom-left-ratio bottom-left-ratio-all">
            <div class="sub-value">环比</div>
            <div class="sub-name">
            <SvgIcon
              class="icon-trend"
              :iconName="Number(totalCompareValue) < 0 ? 'ECSarrowdown' : 'ECSarrowup'"
              :style="{ width: 10, height: 10 }"
            />
            {{ totalCompareValue === '--' ? '--' : Math.abs(totalCompareValue) }}
          </div>
        </div>
      </div>
    </div>
    <SvgIcon iconName="separation" v-if="isCollapsed" style="{ width: 8, height: 112 }" />
    <SvgIcon iconName="separation-344" v-else :style="{ width: 8, height: 344 }" />
    <div class="item" v-for="(item, index) in infors" :key="item.title">
      <div class="item-top">
        <SvgIcon :iconName="item.icon" class="triangle-icon" style="{ width: 20, height: 20 }" />
        <span class="name">{{ item.title }}</span>
        <span class="unit">(万核)</span>
      </div>
      <div class="line"></div>
      <div class="item-bottom">
        <div class="bottom-left">
          <div class="bottom-left-main">
            <div class="sub-name">总可售量</div>
              <div class="sub-value">
                <span class="value-total">
                  {{ permissionTable.ecs ? item.totalValue : '**' }}
                </span>
              </div>
            </div>
            <div class="bottom-left-ratio">
              <div class="sub-name">
                <SvgIcon
                  class="icon-trend"
                  :iconName="Number(item.compareValue) < 0 ? 'ECSarrowdown' : 'ECSarrowup'"
                  :style="{ width: 10, height: 10 }"
                />
                {{ item.compareValue === '--' ? '--' : Math.abs(item.compareValue) }}
              </div>
              <div class="sub-value">环比</div>
            </div>
          </div>
          <SvgIcon iconName="separation" style="{ width: 5.5, height: 48 }"/>
          <div class="inter" :class="{ 'inter-column': item.title === 'K算力' }">
            <div class="interItem" v-for="sub in item.subList" :key="sub.title">
              <div class="inter-title">{{ sub.title }}</div>
              <div class="inter-num">{{ sub.num }}</div>
            </div>
          </div>
        </div>
        <ECSTrend v-if="!isCollapsed" :chartData="item.chartData"></ECSTrend>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatNumToLocalString, formatNumToLocalStringAndFiexd, formatterValue } from '@/utils';
import { keyInfor, permissionTable, showCollapse, isCollapsed } from './useResourceData.js';
import ECSTrend from './ECSTrend.vue';

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toWan = (val, fixed = 2) => (val !== null ? formatterValue(val, 10000, fixed) : '--');

const totalSellableValue = computed(() => toWan(keyInfor.ecs?.totalSellableCapacityItem?.value));
const totalCompareValue = computed(() => toWan(keyInfor.ecs?.totalSellableCapacityItem?.compareValue));

const infors = computed(() => {
  const iSubList = [
    { title: 'Intel V5', num: toWan(keyInfor.ecs?.icalcItem?.intelV5, 2) },
    { title: 'Intel V6', num: toWan(keyInfor.ecs?.icalcItem?.intelV6, 2) },
    { title: 'Intel V7', num: toWan(keyInfor.ecs?.icalcItem?.intelV7, 2) },
    { title: 'Intel V9', num: toWan(keyInfor.ecs?.icalcItem?.intelV9, 2) }
  ];
  const aSubList = [
    { title: 'AXD V6', num: toWan(keyInfor.ecs?.acalcItem?.axdv6, 2) },
    { title: 'AXD V7', num: toWan(keyInfor.ecs?.acalcItem?.axdv7, 2) },
    { title: 'AXD V8', num: toWan(keyInfor.ecs?.acalcItem?.axdv8, 2) },
    { title: 'AXD V9', num: toWan(keyInfor.ecs?.acalcItem?.axdv9, 2) }
  ];
  const kSubList = [
    { title: 'Kunpeng V1', num: toWan(keyInfor.ecs?.kcalcItem?.kunpengV1, 2) },
    { title: 'Kunpeng V2', num: toWan(keyInfor.ecs?.kcalcItem?.kunpengV2, 2) }
  ];

  return [
    {
      title: 'I算力',
      icon: 'Isuanli',
      totalValue: toWan(keyInfor.ecs?.icalcItem?.itotalSellableCapacity, 2),
      compareValue: toWan(keyInfor.ecs?.icalcItem?.compareValue, 2),
      subList: iSubList,
      chartData: keyInfor.ecs?.icalcItem?.topCalcItems
    },
    {
      title: 'A算力',
      icon: 'Asuanli',
      totalValue: toWan(keyInfor.ecs?.acalcItem?.atotalSellableCapacity, 2),
      compareValue: toWan(keyInfor.ecs?.acalcItem?.compareValue, 2),
      subList: aSubList,
      chartData: keyInfor.ecs?.acalcItem?.topCalcItems
    },
    {
      title: 'K算力',
      icon: 'Ksuanli',
      totalValue: toWan(keyInfor.ecs?.kcalcItem?.ktotalSellableCapacity, 2),
      compareValue: toWan(keyInfor.ecs?.kcalcItem?.compareValue, 2),
      subList: kSubList,
      chartData: keyInfor.ecs?.kcalcItem?.topCalcItems
    }
  ];
});
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    padding: 20px 24px 0px 24px;
  }
  
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

  .title-right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .info {
    display: flex;
    gap: 20px;
    height: 116px;
    .item-all {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 176px;
      height: 100%;
      border-radius: 8px;
      background: #f0f2fb;
      padding: 12px;
      .item-top {
        display: flex;
        align-items: center;
        gap: 4px;

        .name {
          color: rgba(51, 51, 107, 1);
          font-size: 16px;
          font-weight: 700;
          line-height: 24px;
        }
        .unit {
          color: rgba(98, 98, 168, 1);
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
        }
      }
      .item-bottom {
        display: flex;

        .value-total {
          color: rgba(74, 74, 189, 1);
          font-size: 28px;
        }
      }
      .item-bottom {
        display: flex;
        .value-total {
          color: rgba(74, 74, 189, 1);
          font-size: 28px;
          font-weight: 700;
          line-height: 32px;
          margin-right: 4px;
        }
      }

      .bottom-left-ratio-all {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .item-bottom-all {
        .value-total {
          color: rgba(74, 74, 189, 1);
          font-size: 28px;
          font-weight: 700;
          line-height: 32px;
          margin-right: 4px;
        }
      }
      .sub-name {
        color: rgba(51, 51, 107, 1);
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
      }

      .sub-value {
        color: rgba(98, 98, 168, 1);
        font-size: 12px;
        font-weight: 400;
      }
    }
    .item {
      width: 440px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-radius: 8px;
      background: #f0f2fb;
      padding: 12px;
      .item-top {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .item-bottom {
        display: flex;
        align-items: center;
        .bottom-left {
          display: flex;
          align-items: center;
          .bottom-left-ratio {
            margin-left: 4px;
            margin-right: 10px;
            .sub-name {
              color: rgba(51, 51, 107, 1);
              font-size: 14px;
              font-weight: 700;
              line-height: 20px;
              .icon-trend {
                padding-bottom: 4px;
              }
            }
            .sub-value {
              color: rgba(98, 98, 168, 1);
              font-size: 12px;
              font-weight: 400;
            }
          }
        }
        .inter {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
          margin-left: 20px;
          &.inter-column {
            grid-template-columns: 1fr;
          }
          .interItem {
            display: flex;
            align-items: center;
            gap: 4px;
            .inter-title {
              color: rgba(89, 90, 138, 1);
              font-size: 14px;
              font-weight: 400;
              line-height: 20px;
            }
            .inter-num {
              color: rgba(53, 53, 117, 1);
              font-size: 18px;
              font-weight: 700;
              line-height: 24px;
            }

            .inter-unit {
              color: rgba(98, 98, 168, 1);
              font-size: 12px;
            }
          }
        }
      }
      .line-box {
        width: 1px;
        height: 48px;
        border-left: 1px dashed rgba(212, 217, 230, 1);
      }
      .name {
        color: rgba(51, 51, 107, 1);
        font-family: 'Microsoft YaHei';
        font-style: Bold;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
        letter-spacing: 0px;
        text-align: left;
      }
      .unit {
        color: rgba(98, 98, 168, 1);
        font-family: 'Microsoft YaHei';
        font-style: Regular;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: 0px;
        text-align: left;
        margin-left: 4px;
      }
      .value {
        color: rgba(53, 53, 117, 1);
        font-family: 'Arial';
        font-style: Bold;
        font-size: 24px;
        font-weight: 700;
        line-height: 28px;
        letter-spacing: 0px;
        text-align: left;
      }
      .value-total {
        color: rgba(74, 74, 189, 1);
        font-family: 'Arial';
        font-style: Bold;
        font-size: 28px;
        font-weight: 700;
        line-height: 32px;
        letter-spacing: 0px;
        text-align: left;
      }

      .unit-total {
        color: rgba(98, 98, 168, 1);
        font-family: 'Microsoft YaHei';
        font-style: Regular;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        margin-left: 4px;
      }
      .sub-name {
        color: rgba(98, 98, 168, 1);
        font-family: 'Microsoft YaHei';
        font-style: Regular;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
      }
    }
  }
  .info-1 {
    height: 344px;
  }
  .line {
    width: 100%;
    height: 1px;
    background: rgba(223, 228, 245);
    flex-shrink: 0;
  }

  .collapse-toggle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 28px;
    cursor: pointer;
    user-select: none;
    .collapse-text {
      font-size: 14px;
      color: rgba(94, 124, 224, 1);
    }

    .collapse-arrow {
      font-size: 10px;
      color: rgba(94, 124, 224, 1);
      transition: transform 0.3s ease;
    }

    .collapse-arrow.is-collapsed {
      transform: rotate(180deg);
    }

    &:hover {
      .collapse-text,
      .collapse-arrow {
          color: rgba(94, 124, 224, 1);
      }
    }
  }
}
</style>
