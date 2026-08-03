<template>
  <header class="global-header-content">
    <div class="header-left">
      <FilterDropdowns
        v-if="showSaleAreaFilter"
        v-model="filterValue"
        :options="filterOptions"
        :filter-config="filterConfig"
        :loading="filterLoading"
      />
      <span v-else>头部区域</span>
    </div>
    <RoleMenu />
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FilterDropdowns from '@/components/FilterDropdowns.vue'
import RoleMenu from '@/components/RoleMenu.vue'
import { useSaleFilterStore } from '@/views/saleView/saleHome/useSaleFilter'

const route = useRoute()
const showSaleAreaFilter = computed(() => ['saleHome', 'saleDetail'].includes(route.name))
const saleFilterStore = useSaleFilterStore()
const { filterConfig } = saleFilterStore
const { filterValue, filterOptions, filterLoading } = storeToRefs(saleFilterStore)
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
