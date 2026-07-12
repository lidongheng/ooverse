<template>
  <HomeLayout class="sale-home">
    <template #overview>
      <CommonTitle title="概览">
        <template #select>
          <FilterDropdowns
            v-model="filterValue"
            :options="filterOptions"
            :filter-config="filterConfig"
          />
        </template>
      </CommonTitle>
    </template>
    <template #top>
      <TopIndicators></TopIndicators>
    </template>
    <template #left>
      <SaleService />
    </template>
    <template #center>
      <Map />
    </template>
    <template #right>
      <Customer />
    </template>
  </HomeLayout>
</template>

<script setup>
import { ref } from "vue";
import HomeLayout from "@/components/home/HomeLayout.vue";
import CommonTitle from "@/components/home/CommonTitle.vue";
import TopIndicators from "@/components/home/TopIndicators.vue";
import SaleService from "@/components/home/SaleService.vue";
import Map from "@/components/home/Map.vue";
import Customer from "@/components/home/Customer.vue";
import FilterDropdowns from "@/components/FilterDropdowns.vue";

const filterValue = ref(null);

/**
 * saleHome 顶部 Region 筛选配置说明：
 * - filterConfig 负责声明筛选框长什么样、读哪个数据源、选中后写到哪个字段。
 * - filterOptions 负责提供筛选框选项数据。
 * - optionKey: "regionAreaTree" 表示当前 Region 筛选读取 filterOptions.regionAreaTree。
 * - regionAreaTree 是两层树结构：第一层渲染“大区”，第二层渲染“Region”。
 * - parentValueKey: "regionAreaList" 表示第一层大区选中值写入 filterValue.regionAreaList。
 * - valueKey: "regionNameList" 表示第二层 Region 选中值写入 filterValue.regionNameList。
 * - label 是选项展示文案，value 是实际提交到 filterValue 的值。
 */
const filterConfig = [
  {
    key: "region",
    label: "Region",
    type: "cascade",
    optionKey: "regionAreaTree",
    parentValueKey: "regionAreaList",
    valueKey: "regionNameList",
    searchable: true,
    confirmable: true,
    columns: [
      { title: "大区" },
      { title: "Region" },
    ],
  },
];

const filterOptions = {
  // regionAreaTree 被 Region 筛选引用；用于渲染带搜索、确定/取消按钮的“大区 / Region”级联面板。
  regionAreaTree: [
    {
      label: "非洲",
      value: "africa",
      children: [
        { label: "非洲-开罗", value: "非洲-开罗" },
        { label: "非洲-约翰内斯堡", value: "非洲-约翰内斯堡" },
      ],
    },
    {
      label: "拉美",
      value: "latam",
      children: [
        { label: "拉美-圣保罗一", value: "拉美-圣保罗一" },
        { label: "拉美-圣地亚哥", value: "拉美-圣地亚哥" },
      ],
    },
  ],
};
</script>
