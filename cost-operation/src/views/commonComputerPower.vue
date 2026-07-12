<template>
  <BubbleChart
    :data="mappedData"
    :avgX="avgX"
    :forbidden="forbidden"
    :title="title"
    :yAxisName="yAxisName"
    :yRange="chartYRange"
    :xRange="chartXRange"
    :xAxisName="xAxisName"
    :showZoneLabels="false"
    :tooltipYLabel="tooltipYLabel"
    :sizeLabel="sizeLabel"
    :sizeValueField="sizeValueField"
    :sizeTiers="sizeTiers"
    :trafficLights="trafficLightRules"
    :trafficLightKeys="trafficLightKeys"
    :yTicks="chartYTicks"
    :resourcePoolTierFilter="true"
    :filterResetKey="filterResetKey"
    @bubble-click="(e) => emit('bubble-click', e)"
    @visible-change="onVisibleChange"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import BubbleChart from "@/components/BubbleChart.vue";
import { useCommonComputerPower, computeWeightedAvg } from "./useCommonComputerPower";
import { computeWeightedAvgFromData, SIZE_TIERS } from "./commonComputerPowerConfig";
import { useBubbleAxisRange } from "./useBubbleAxisRange";
import { backendFilters, filterResetKey } from "./useGeneralComputeFilter";
import { useTargetNumStore } from "@/stores/targetNumStore";

const targetNumStore = useTargetNumStore();
const { trafficLightRules } = storeToRefs(targetNumStore);

const props = defineProps({
  xField: { type: String, default: "_useRate" },
  xAxisName: { type: String, default: "CPU使用率" },
  yField: { type: String, default: "" },
  title: { type: String, default: "毛利率" },
  yAxisName: { type: String, default: "%" },
  yRange: { type: Array, default: () => [-205, 105] },
  /** 自定义 X 轴 [min, max]，不传则 BubbleChart 使用默认 0–100 */
  xRange: { type: Array, default: null },
  yTicks: { type: Array, default: () => [-200, -100, 0, 100] },
  /**
   * 设为数字（如 5）时，用 mappedData 中 xField / yField 的有效数值计算轴范围 [min−pad, max+pad]；
   * 某一轴无有效值则该轴仍用 yRange / xRange / yTicks 传入的默认值
   */
  axisRangeDataPadding: { type: Number, default: null },
  tooltipYLabel: { type: String, default: "毛利率" },
  sizeLabel: { type: String, default: "服务器规模(台)" },
  sizeValueField: { type: String, default: "serverNum" },
  sizeTiers: { type: Array, default: () => SIZE_TIERS },
  trafficLightKeys: { type: Object, default: null },
});

const emit = defineEmits(["bubble-click", "visible-change"]);

const {
  data,
  avgRangeList,
  forbidden,
  fetchData,
} = useCommonComputerPower();

const visibleTiers = ref([false, true, true, true]);

function onVisibleChange(filterFn, tiers) {
  if (tiers) visibleTiers.value = tiers;
  emit("visible-change", filterFn);
}

const avgValueField = computed(() => {
  // 后端 avgRangeList 按指标拆分平均值，平均线必须跟随当前 X 轴字段切换。
  if (props.xField === "_allocationRate" || props.xField === "allocationRate") return "allocationVal";
  if (props.xField === "_useRate" || props.xField === "useRate") return "useRateVal";
  return "val";
});

const avgX = computed(() => {
  const hasMatchingAvgRange = avgRangeList.value.some((item) =>
    props.sizeTiers.some((tier) => tier.label === item.name)
  );
  if (!hasMatchingAvgRange) {
    return computeWeightedAvgFromData(
      data.value,
      props.xField,
      visibleTiers.value,
      props.sizeTiers,
      null,
      props.sizeValueField
    );
  }
  const avg = computeWeightedAvg(avgRangeList.value, visibleTiers.value, props.sizeTiers, avgValueField.value);
  return avg * 100;
});

const mappedData = computed(() =>
  data.value.map((d) => ({
    ...d,
    x: d[props.xField] ?? d.x,
    ...(props.yField ? { y: d[props.yField] ?? d.y } : {}),
  }))
);

const { chartXRange, chartYRange, chartYTicks } = useBubbleAxisRange(
  props,
  mappedData
);

watch(
  backendFilters,
  (filters) => {
    // backendFilters 为 null 时表示筛选选项还没加载完成。
    // 等默认全选参数生成后再请求，避免首屏空筛选条件请求。
    if (!filters) return;
    fetchData(filters);
  },
  { deep: true, immediate: true }
);

defineExpose({ data: mappedData });
</script>
