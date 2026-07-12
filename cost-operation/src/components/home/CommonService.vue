<template>
  <div class="common-service">
    <div class="service-title">服务入口</div>
    <button type="button" class="service-button" @click="goTo('/generalCompute')">
      <span class="service-name">TS</span>
      <span class="service-desc">查看TYSL运营</span>
    </button>
    <button type="button" class="service-button" @click="goTo('/aiCompute')">
      <span class="service-name">ZS</span>
      <span class="service-desc">查看ZNSL运营</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goTo(path) {
  router.push(path);
}
</script>

<style lang="less" scoped>
.common-service {
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-title {
  height: 24px;
  line-height: 24px;
  color: #353575;
  font-size: 15px;
  font-weight: 700;
}

.service-button {
  height: 68px;
  padding: 10px 12px;
  border: 1px solid #c8c8e8;
  border-radius: 6px;
  background: #f7f8fd;
  color: #353575;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  text-align: left;
}

.service-button:hover {
  border-color: #7171a8;
  background: #eef2ff;
}

.service-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
}

.service-desc {
  color: #7171a8;
  font-size: 12px;
  line-height: 16px;
}
</style>
