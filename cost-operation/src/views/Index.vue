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
import HomeLayout from "@/components/home/HomeLayout.vue";
import CommonTitle from "@/components/home/CommonTitle.vue";
import TopIndicators from "@/components/home/TopIndicators.vue";
import CommonService from "@/components/home/CommonService.vue";
import Map from "@/components/home/Map.vue";
import Customer from "@/components/home/Customer.vue";
</script>
