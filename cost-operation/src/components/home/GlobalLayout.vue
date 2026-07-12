<template>
  <div class="global-box">
    <div class="global-wapper">
      <div class="global-header">
        <Header />
      </div>
      <div class="global-body">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '../header/Header.vue';
</script>

<style lang="less" scoped>
.global-box {
  background: rgba(238, 241, 250, 1);
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
}
.global-wapper {
  width: 100%;
  max-width: 1920px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  .global-header {
    width: 100%;
    height: 64px;
  }
  .global-body {
    width: 100%;
    margin: 0 auto;
    position: relative;
  }
}
</style>
