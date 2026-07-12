<template>
  <BubbleChart
    :data="data"
    :avgX="avgX"
    :forbidden="forbidden"
    title="Region经营分析"
    yAxisName="盈亏 万元"
    :yRange="yRange"
    :xRange="xRange"
    :yTicks="yTicks"
    xAxisName="CPU使用率"
    :showZoneLabels="false"
    tooltipYLabel="毛利率"
    tooltipYField="grossProfitMargin"
    @bubble-click="(e) => emit('bubble-click', e)"
    @visible-change="onVisibleChange"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import BubbleChart from "@/components/BubbleChart.vue";
import { useProfitLossTrend } from "./useProfitLossTrend";
import { useCurrentDate } from "./useCurrentDate";
import { SIZE_TIERS, computeWeightedAvgFromData } from "./commonComputerPowerConfig";

const emit = defineEmits(["bubble-click", "visible-change"]);

const { data, forbidden, fetchData } = useProfitLossTrend();
const { date: currentMonth } = storeToRefs(useCurrentDate());

const visibleTiers = ref([false, true, true, true]);

function onVisibleChange(filterFn, tiers) {
  if (tiers) visibleTiers.value = tiers;
  emit("visible-change", filterFn);
}

const basicFilter = (d) => d.x != null && d.y != null && d.x > 0;

const avgX = computed(() =>
  computeWeightedAvgFromData(data.value, "x", visibleTiers.value, SIZE_TIERS, basicFilter)
);

const xRange = computed(() => {
  const xs = data.value.map((d) => d.x).filter((v) => v != null);
  if (!xs.length) return [0, 105];
  return [0, Math.min(Math.ceil(Math.max(...xs) + 5), 105)];
});

function ceilToMagnitude(v) {
  if (v === 0) return 0;
  const abs = Math.abs(v);
  const mag = Math.pow(10, Math.floor(Math.log10(abs)));
  const rounded = Math.ceil(abs / mag) * mag;
  return v < 0 ? -rounded : rounded;
}

const yTicksAndRange = computed(() => {
  const ys = data.value.map((d) => d.y).filter((v) => v != null);
  if (!ys.length) return { ticks: [0, 100, 200, 300], range: [0, 300] };

  const maxVal = Math.max(...ys, 0);
  const minVal = Math.min(...ys, 0);
  const rawMax = Math.max(Math.abs(maxVal), Math.abs(minVal));
  const step = ceilToMagnitude(rawMax / 3);
  if (step === 0) return { ticks: [0], range: [-1, 1] };

  const posCount = maxVal > 0 ? Math.ceil(maxVal / step) : 0;
  const negCount = minVal < 0 ? Math.ceil(Math.abs(minVal) / step) : 0;

  const ticks = [];
  for (let i = -negCount; i <= posCount; i++) {
    ticks.push(Math.round(step * i));
  }
  return { ticks, range: [ticks[0], ticks[ticks.length - 1]] };
});

const yTicks = computed(() => yTicksAndRange.value.ticks);
const yRange = computed(() => yTicksAndRange.value.range);

const mappedData = computed(() => data.value);

onMounted(() => {
  fetchData(currentMonth.value);
});

defineExpose({ data: mappedData });
</script>
