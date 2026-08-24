<template>
  <button
    type="button"
    class="detail-button"
    @click="emit('click')"
  >
    <span>详情</span>
    <span aria-hidden="true">›</span>
  </button>
</template>

<script setup>
const emit = defineEmits(['click']);
</script>

<style lang="less" scoped>
.detail-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7171a8;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
}
</style>
