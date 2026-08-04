<template>
  <div class="no-permission-box">
    <SvgIcon iconName="no-permission" class="no-permission-icon" :style="{ width: '64', height: '64' }"/>
    <span class="no-permission-text">{{ text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '暂无权限访问',
  },
});
</script>

<style lang="less" scoped>
.no-permission-box {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 12px;
}
.no-permission-icon {
  width: 64px;
  height: 64px;
}
.no-permission-text {
  color: rgba(98, 98, 168, 1);
  font-family: Microsoft YaHei;
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
  letter-spacing: 0px;
  text-align: left;
}
</style>
