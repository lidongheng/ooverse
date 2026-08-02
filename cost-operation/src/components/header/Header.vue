<template>
  <header class="global-header-content">
    <div class="header-left">
      <FilterDropdowns
        v-if="showSaleAreaFilter"
        v-model="areaFilterValue"
        :options="areaFilterOptions"
        :filter-config="areaFilterConfig"
        :loading="areaFilterLoading"
      />
      <span v-else>头部区域</span>
    </div>
    <RoleMenu />
  </header>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSaleRegionTreeAPI } from '@/api/sale'
import FilterDropdowns from '@/components/FilterDropdowns.vue'
import RoleMenu from '@/components/RoleMenu.vue'

const route = useRoute()
const showSaleAreaFilter = computed(() => ['saleHome', 'saleDetail'].includes(route.name))

const areaFilterLoading = ref(true)
const areaFilterValue = ref({
  insideOutside: [],
  areaName: [],
  regionName: [],
})

const areaFilterConfig = [
  {
    key: 'area',
    type: 'areaCascade',
    optionKey: 'regionAreaTree',
    areaValueKey: 'insideOutside',
    districtValueKey: 'areaName',
    regionValueKey: 'regionName',
    icon: 'location',
    hideLabel: true,
    columns: [
      { title: '区域' },
      { title: '大区' },
      { title: 'Region' },
    ],
  },
]

const areaFilterOptions = reactive({
  regionAreaTree: [],
})

function convertRegionTree(regionTree) {
  // 后端三层区域协议依次映射为区域、大区和 Region。
  return regionTree.map((area) => ({
    label: area.areaName,
    value: area.areaName,
    children: area.regionTreeItem.map((district) => ({
      label: district.areaName,
      value: district.areaName,
      children: district.regionTreeItem.map((region) => ({
        label: region.regionName,
        value: region.regionName,
      })),
    })),
  }))
}

onMounted(async () => {
  const response = await getSaleRegionTreeAPI()
  const regionAreaTree = convertRegionTree(response.data)
  const firstArea = regionAreaTree[0]
  const firstDistrict = firstArea.children[0]
  const firstRegion = firstDistrict.children[0]

  areaFilterOptions.regionAreaTree = regionAreaTree
  areaFilterValue.value = {
    insideOutside: [firstArea.value],
    areaName: [firstDistrict.value],
    regionName: [firstRegion.value],
  }
  areaFilterLoading.value = false
})
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
