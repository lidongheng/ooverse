<template>
  <BubbleChart
    :data="data"
    :avgX="avgX"
    :forbidden="false"
    title="NPU卡时使用率"
    yAxisName="%"
    :yRange="[0, 50]"
    :xRange="xRange"
    xAxisName="NPU使用率"
    :showZoneLabels="false"
    tooltipYLabel="NPU卡时使用率"
    sizeLabel="卡数(卡)"
    :sizeTiers="SUPER_NODE_SIZE_TIERS"
    :initialVisibleTiers="[true, true, true, true]"
    :trafficLights="trafficLightRules"
    :trafficLightKeys="{ x: 'NPU使用率', y: 'NPU卡时使用率' }"
    :dataFilter="dataFilter"
    :collapsible="true"
    @bubble-click="(e) => emit('bubble-click', e)"
    @visible-change="onVisibleChange"
    @collapse-change="(v) => emit('collapse-change', v)"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import BubbleChart from "@/components/BubbleChart.vue";
import { SUPER_NODE_SIZE_TIERS, computeWeightedAvgFromData } from "./commonComputerPowerConfig";
import { computeWeightedAvg } from "./useCommonComputerPower";
import { useTargetNumStore } from "@/stores/targetNumStore";

const targetNumStore = useTargetNumStore();
const { trafficLightRules } = storeToRefs(targetNumStore);

const props = defineProps({
  data: { type: Array, default: () => [] },
  avgRangeList: { type: Array, default: () => [] },
  /** true：与资源池一致，按气泡数据 + 勾选档位在前端算 X（NPU使用率）加权平均；false：用后端 avgRangeList */
  avgXFromFrontend: { type: Boolean, default: false },
});

const emit = defineEmits(["bubble-click", "visible-change", "collapse-change"]);

const visibleTiers = ref([true, true, true, true]);

function dataFilter(d) {
  return d.x != null && d.y != null && d._npuCardTimeUseRate > 0;
}

function onVisibleChange(filterFn, tiers) {
  if (tiers) visibleTiers.value = tiers;
  emit("visible-change", filterFn);
}

const avgX = computed(() => {
  if (props.avgXFromFrontend) {
    return computeWeightedAvgFromData(
      props.data,
      "x",
      visibleTiers.value,
      SUPER_NODE_SIZE_TIERS,
      dataFilter,
    );
  }
  return (
    computeWeightedAvg(
      props.avgRangeList,
      visibleTiers.value,
      SUPER_NODE_SIZE_TIERS,
    ) * 100
  );
});

const xRange = computed(() => {
  if (!props.data.length) return null;
  const xs = props.data.map((d) => d.x);
  return [Math.floor(Math.min(...xs) - 5), Math.ceil(Math.max(...xs) + 5)];
});

defineExpose({ data: computed(() => props.data) });
</script>
