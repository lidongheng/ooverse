<template>
  <div class="common-title flex-center">
    <div class="indicators-title flex-center top-overview">
      <SvgIcon
        :style="{
          width: 32,
          height: 32,
        }"
        :icon-name="iconName"
      />
      <div class="title">
        <span class="c-title text-ellipsis" :title="title">
          {{ title }}
        </span>
        <span
          v-if="!!tag"
          :class="{
            tag: true,
            purple: tag?.includes('内部'),
            blue: tag?.includes('YW'),
          }"
        >
          {{ getTagText(tag) }}
        </span>
        <span class="sub-title" :title="subTitle">{{ subTitle }}</span>
      </div>
      <div class="time">数据时间：{{ dayjs(currentDate.date).format('YY年M月D日') }}</div>
    </div>

    <div class="flex-center current">
      <slot name="select">
        <FilterDropdowns
          v-if="showGeneralComputeFilter"
          v-model="filterValue"
          :options="filterOptions"
          :filter-config="filterConfig"
          :loading="directoryTreeLoading"
          @change="onFilterChange"
        />
      </slot>
      <div class="text">时间</div>
      <el-date-picker
        class="current-month"
        v-model="currentDate.date"
        :disabled-date="getDisabledDate"
        value-format="YYYYMMDD"
        type="date"
        placeholder="选择日期"
        format="YYYY年MM月DD日"
        :clearable="false"
      />
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import SvgIcon from "../SvgIcon.vue";
import dayjs from 'dayjs';
import { useCurrentDate } from "@/views/useCurrentDate";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import { directoryTreeLoading } from "@/views/useDirectoryTree";
import {
  filterConfig,
  filterOptions,
  filterValue,
  onFilterChange,
} from "@/views/useGeneralComputeFilter";

const route = useRoute();
const currentDate = useCurrentDate();
const showGeneralComputeFilter = computed(() => route.name === "generalCompute");
const getDisabledDate = (date) => !dayjs(date).isBefore(dayjs(), 'day');

const getTagText = (text) => {
  if( text === 'YW') {
    return 'YW';
  } else {
    return text.slice(0, 1);
  }
}

const props = defineProps({
  title: { type: String },
  subTitle: { type: String },
  iconName: {
    type: String,
    default: 'top-ov2',
  },
  tag: {
    type: String,
    default: '',
  },
});
</script>
<style lang="less">
.current-month {
  --el-date-editor-width: 140px;
  --el-input-height: 28px;
  .el-input__wrapper.is-focus {
    box-shadow: none;
  }
}
</style>
<style lang="less" scoped>
.flex-center {
  display: flex;
  align-items: center;
}

.common-title {
  width: 100%;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.indicators-title {
  flex: 1;
  min-width: 0;
  color: rgba(53, 53, 117, 1);
  font-family: Microsoft YaHei;
  .title {
    margin-left: 8px;
    margin-right: 12px;
    font-weight: 700;
    letter-spacing: 0px;
    .sub-title {
      font-size: 16px;
      margin-left: 3px;
    }
    .c-title {
      height: 32px;
      line-height: 32px;
      font-size: 24px;
      text-align: left;
      max-width: 600px;
      vertical-align: text-bottom;
    }
    .tag {
      display: inline-block;
      min-width: 24px;
      height: 20px;
      line-height: 20px;
      border-radius: 6px 6px 6px 0;
      background-color: rgba(98, 98, 168, 1);
      text-align: center;
      color: #fff;
      font-size: 12px;
      vertical-align: super;
      margin-left: 3px;
    }
    .purple {
      background-color: rgba(134, 131, 239, 1);
    }

    .blue {
      background-color: rgba(64, 169, 255, 1);
    }
  }
  .time {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    margin-top: 10px;
  }
}
.current {
  width: auto;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 8px;
  position: relative;
  z-index: 99;
  .text {
    white-space: nowrap;
    color: rgba(89, 90, 138, 1);
    font-family: Micosoft YaHei;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    margin-right: 8px;
  }
}
</style>
