<template>
  <el-radio-group v-model="radio" :fill="bgColor">
    <el-radio-button v-for="item in list" :key="item.value" v-bind="item">
      <span>{{ item.label }}</span>
    </el-radio-button>
  </el-radio-group>
</template>

<script setup>
const radio = defineModel();

const props = defineProps({
  list: {
    type: Array,
    default: () => [
      {
        label: '图形',
        value: 'chart',
      },
      {
        label: '表格',
        value: 'table',
      },
    ],
  },
  bgColor: {
    type: String,
    default: 'rgba(53, 53, 117, 1)',
  },
});
</script>

<style lang="less" scoped>
:deep(.el-radio-group) {
  padding: 3px;
  border: 1px solid rgba(53, 53, 117, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 2px 8px 0 rgba(33, 48, 92, 0.08);
}

:deep(.el-radio-button__inner) {
  min-width: 64px;
  height: 30px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #353575;
  font-size: 14px;
  line-height: 30px;
  box-shadow: none;
}

:deep(.el-radio-button:first-child .el-radio-button__inner),
:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 6px;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 6px 0 rgba(53, 53, 117, 0.18);
}
</style>
