<template>
  <BubbleChart
    :data="mappedData"
    :avgX="avgX"
    :forbidden="forbidden"
    :title="title"
    :yAxisName="yAxisName"
    :yRange="chartYRange"
    :xRange="xRange"
    :yTicks="chartYTicks"
    :xAxisName="xAxisName"
    :xAxisValueUnit="xAxisValueUnit"
    :yAxisTopLabel="yAxisTopLabel"
    :showZoneLabels="false"
    :tooltipYLabel="tooltipYLabel"
    :tooltipMetricOrder="tooltipMetricOrder"
    :tooltipShowSize="tooltipShowSize"
    sizeLabel="卡数(卡)"
    :sizeTiers="AI_SIZE_TIERS"
    :singleLegend="singleLegend"
    :initialVisibleTiers="[true, true, true, true]"
    :trafficLights="trafficLightRules"
    :trafficLightKeys="trafficLightKeys"
    :dataFilter="dataFilter"
    @bubble-click="(e) => emit('bubble-click', e)"
    @visible-change="onVisibleChange"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import BubbleChart from "@/components/BubbleChart.vue";
import { useAIComputerPower } from "./useAIComputerPower";
import { useBubbleAxisRange } from "./useBubbleAxisRange";
import { useCurrentDate } from "./useCurrentDate";
import { AI_SIZE_TIERS, computeWeightedAvgFromData } from "./commonComputerPowerConfig";
import { useTargetNumStore } from "@/stores/targetNumStore";

const targetNumStore = useTargetNumStore();
const { trafficLightRules } = storeToRefs(targetNumStore);

const props = defineProps({
  xField: { type: String, default: "_allocationRate" },
  yField: { type: String, default: "" },
  xAxisName: { type: String, default: "分配率" },
  title: { type: String, default: "毛利率" },
  yAxisName: { type: String, default: "%" },
  yRange: { type: Array, default: () => [-200, 200] },
  /** 与 commonComputerPower 一致：设为数字时用数据 ±padding 驱动 Y 轴刻度与过滤范围 */
  axisRangeDataPadding: { type: Number, default: null },
  yTicks: { type: Array, default: null },
  xRange: { type: Array, default: null },
  xAxisValueUnit: { type: String, default: "%" },
  yAxisTopLabel: { type: String, default: "" },
  tooltipYLabel: { type: String, default: "毛利率" },
  tooltipMetricOrder: { type: Array, default: () => ["x", "y"] },
  tooltipShowSize: { type: Boolean, default: true },
  singleLegend: { type: Object, default: null },
  avgXField: { type: String, default: "allocationRate" },
  trafficLightKeys: { type: Object, default: null },
  dataFilter: { type: Function, default: null },
});

const emit = defineEmits(["bubble-click", "visible-change"]);

const { data, forbidden, fetchData } = useAIComputerPower();
const { date: currentMonth } = storeToRefs(useCurrentDate());

const visibleTiers = ref([true, true, true, true]);

function onVisibleChange(filterFn, tiers) {
  if (tiers) visibleTiers.value = tiers;
  emit("visible-change", filterFn);
}

const avgX = computed(() =>
  computeWeightedAvgFromData(
    mappedData.value,
    props.avgXField,
    visibleTiers.value,
    AI_SIZE_TIERS,
    props.dataFilter,
  )
);

const mappedData = computed(() =>
  data.value.map((d) => ({
    ...d,
    x: d[props.xField] ?? d.x,
    ...(props.yField ? { y: d[props.yField] ?? d.y } : {}),
  }))
);

const { chartYRange, chartYTicks } = useBubbleAxisRange(props, mappedData, {
  includeXAxis: false,
});

const xRange = computed(() => {
  if (props.xRange) return props.xRange;
  const rows = mappedData.value;
  if (!rows.length) return null;
  const filtered = props.dataFilter ? rows.filter(props.dataFilter) : rows;
  if (!filtered.length) return null;
  const xs = filtered
    .map((d) => d.x)
    .filter((x) => x != null && !Number.isNaN(Number(x)));
  if (!xs.length) return null;
  const maxX = Math.max(...xs);
  return [0, Math.max(0, Math.ceil(maxX + 5))];
});

onMounted(() => {
  fetchData(currentMonth.value);
});

defineExpose({ data: mappedData });
</script>
