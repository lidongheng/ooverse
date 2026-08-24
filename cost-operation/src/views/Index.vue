<template>
  <!-- 首页 -->
  <HomeLayout class="cost-operation">
    <template #overview>
      <CommonTitle title="运营概览" sub-title="(GYY)" />
    </template>
    <template #top>
      <TopIndicators></TopIndicators>
    </template>
    <template #left>
      <CommonService />
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
import Map from '@/components/home/Map.vue';
import HomeLayout from '@/components/home/HomeLayout.vue';
import TopIndicators from '@/components/home/TopIndicators.vue';
import CommonService from '@/components/home/CommonService.vue';
import Customer from '@/components/home/Customer.vue';
import CommonTitle from '@/components/home/CommonTitle.vue';
import { fetchHomeData } from './hooks/useIndicators';
import { useCompareStore } from '@/stores/compareStore';

useCompareStore().reset();
fetchHomeData();
</script>

<style lang="less">
.home-common-card {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 16px 16px 16px 20px;
  box-sizing: border-box;
  border-radius: 16px;
  box-shadow: 0px 2px 12px 0px rgba(53, 53, 117, 0.15);
  background: rgba(255, 255, 255, 0.75);
}
</style>

<style lang="less" scoped>
.cost-operation {
  background: rgba(238, 241, 250, 1);
}
</style>
