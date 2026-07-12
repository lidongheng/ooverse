<template>
  <div class="category-nav">
    <div
      v-for="item in categories"
      :key="item.key"
      class="category-btn"
      :class="{ active: activeCategory === item.key, disabled: item.disabled }"
      @click="onCategoryClick(item)"
    >
      {{ item.key }}
    </div>
  </div>
</template>

<script setup>
import { activeCategory } from "@/views/useGeneralComputer";
import { resetGeneralComputeFilter } from "@/views/useGeneralComputeFilter";

const categories = [
  { key: "ECS", disabled: false },
  { key: "BMS", disabled: true },
  { key: "DCC", disabled: true },
  { key: "EVS", disabled: false },
  { key: "OBS", disabled: false },
  { key: "DSS", disabled: true },
];

function onCategoryClick(item) {
  if (item.disabled) return;
  activeCategory.value = item.key;
  resetGeneralComputeFilter();
}
</script>

<style lang="less" scoped>
.category-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.category-btn {
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #353575;
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover:not(.disabled) {
    background: rgba(53, 53, 117, 0.08);
  }

  &.active {
    color: #fff;
    background: #353575;
  }

  &.disabled {
    color: #bbb;
    cursor: not-allowed;
  }
}
</style>
