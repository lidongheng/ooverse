<template>
  <HomeLayout class="sale-home">
    <template #overview>
      <CommonTitle title="概览" />
    </template>
    <template #top>
      <TopIndicators></TopIndicators>
    </template>
    <template #left>
      <SaleService />
    </template>
    <template #center>
      <Map />
    </template>
    <template #right>
      <XpuNetResourceCard />
    </template>
  </HomeLayout>
</template>

<script setup>
import HomeLayout from "@/components/home/HomeLayout.vue";
import CommonTitle from "@/components/home/CommonTitle.vue";
import TopIndicators from "@/components/home/TopIndicators.vue";
import SaleService from "@/components/home/SaleService.vue";
import Map from '@/views/saleView/map/Map.vue';
import XpuNetResourceCard from "./XpuNetResourceCard.vue";
</script>
