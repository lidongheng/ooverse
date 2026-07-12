<template>
  <header class="global-header-content">
    <div class="header-left">
      <FilterDropdowns
        v-if="showSaleAreaFilter"
        v-model="areaFilterValue"
        :options="areaFilterOptions"
        :filter-config="areaFilterConfig"
      />
      <span v-else>头部区域</span>
    </div>
    <RoleMenu />
  </header>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import RoleMenu from "@/components/RoleMenu.vue";

const route = useRoute();
const showSaleAreaFilter = computed(() => ["saleHome", "saleDetail"].includes(route.name));

const areaFilterValue = ref({
  areaName: ["华东"],
  regionName: ["华东上海一", "华东上海二", "华东上海三", "华东上海四"],
});

const areaFilterConfig = [
  {
    key: "range",
    type: "range",
    variant: "areaCascader",
    optionKeyMode: "valueKeyList",
    autoSelectChild: false,
    icon: "location",
    hideLabel: true,
    columns: [
      { label: "大区", valueKey: "areaName", visible: true, showAll: false },
      { label: "Region", valueKey: "regionName", visible: true, showAll: false },
    ],
  },
];

const areaFilterOptions = reactive({
  // saleHome Header 筛选先使用 mock 两列数据，后续接接口时替换这两个列表即可。
  areaNameList: [
    { label: "华北", value: "华北" },
    { label: "华东", value: "华东" },
    { label: "华南", value: "华南" },
    { label: "西南", value: "西南" },
    { label: "西北", value: "西北" },
  ],
  regionNameList: [
    { label: "华北北京一", value: "华北北京一" },
    { label: "华北北京二", value: "华北北京二" },
    { label: "华东上海一", value: "华东上海一" },
    { label: "华东上海二", value: "华东上海二" },
    { label: "华东上海三", value: "华东上海三" },
    { label: "华东上海四", value: "华东上海四" },
    { label: "华东青岛", value: "华东青岛" },
    { label: "华南广州一", value: "华南广州一" },
    { label: "华南深圳一", value: "华南深圳一" },
    { label: "西南成都一", value: "西南成都一" },
    { label: "西南重庆一", value: "西南重庆一" },
    { label: "西北西安一", value: "西北西安一" },
    { label: "西北兰州一", value: "西北兰州一" },
  ],
});
</script>

<style lang="less" scoped>
.global-header-content {
  width: 100%;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}
</style>
