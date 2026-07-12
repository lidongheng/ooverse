<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn';
</script>

<style lang="less" scoped>
@import './styles/themes.less';

:global(html),
:global(body),
:global(#app) {
  max-width: 100%;
  overflow-x: hidden;
}

:global(body) {
  margin: 0;
}
</style>
