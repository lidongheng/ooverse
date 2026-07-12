<template>
  <div class="container">
    <header class="header">
      <CommonTitle title="ZS" icon-name="type">
        <template #select>
          <FilterDropdowns
            v-model="overviewFilterValue"
            :options="overviewFilterOptions"
            :filter-config="overviewFilterConfig"
            @change="onOverviewFilterChange"
          />
        </template>
      </CommonTitle>
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <template v-if="isToken">
          <AICategoryNav
            :compute-items="maskedFilteredComputeItems"
            :compute-customer-items="maskedComputeCustomerItems"
            :token-items="maskedFilteredTokenItems"
            :token-customer-items="maskedTokenCustomerItems"
          />
        </template>
        <template v-if="!isToken">
          <AICategoryNav
            :compute-items="maskedFilteredComputeItems"
            :compute-customer-items="maskedComputeCustomerItems"
            :token-items="maskedFilteredTokenItems"
            :token-customer-items="maskedTokenCustomerItems"
          />
        </template>
      </section>
      <section class="main-right">
        <div v-if="tabs.length > 1" class="tab-bar">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>
        <template v-if="!isSuperNode">
          <SwitchTableOrChart
            v-if="parentName !== '地域'"
            class="switch-btn"
            v-model="tableRadio"
          />
          <div v-show="tableRadio === 'chart'" class="trend trend-upSuperNode">
            <div class="ai-computer-power">
              <div class="trend-header">
                {{ activeTabYTitle }}
              </div>
              <div class="trend-chart">
                <AIComputerPower
                  ref="chartRef"
                  :xField="currentConfig.xField"
                  :yField="currentConfig.yField"
                  :xAxisName="currentConfig.xAxisName"
                  :title="currentConfig.title"
                  :yAxisName="currentConfig.yAxisName"
                  :xRange="currentConfig.xRange"
                  :yRange="bubbleChartYRange"
                  :y-ticks="bubbleChartYTicks"
                  :axis-range-data-padding="bubbleChartAxisPadding"
                  :xAxisValueUnit="currentConfig.xAxisValueUnit"
                  :yAxisTopLabel="currentConfig.yAxisTopLabel"
                  :tooltipYLabel="currentConfig.tooltipYLabel"
                  :tooltipMetricOrder="currentConfig.tooltipMetricOrder"
                  :tooltipShowSize="currentConfig.tooltipShowSize"
                  :singleLegend="currentConfig.singleLegend"
                  :avgXField="currentConfig.xField"
                  :trafficLightKeys="currentConfig.trafficLightKeys"
                  :dataFilter="currentConfig.dataFilter ?? null"
                  @bubble-click="onBubbleClick"
                  @visible-change="onVisibleChange"
                />
              </div>
            </div>
            <ResourcePoolTable
              ref="tableRef"
              :data="chartData"
            />
          </div>
          <div v-if="tableRadio === 'table'" class="ai-table">
            Other Table
          </div>
        </template>
        
        <div
          v-else
          class="trend common-card-style2 trend-superNode"
          :class="{ 'trend-superNode--collapsed': chartCollapsed }"
        >
          <div class="trend-header">
            NPU卡时使用率
          </div>
          <div
            class="chart-area"
            :class="{ 'chart-area--collapsed': chartCollapsed }"
          >
            <SuperNodeChart
              ref="superNodeChartRef"
              :data="superNodeData"
              :avgRangeList="superNodeAvgRangeList"
              :avg-x-from-frontend="currentConfig.avgXFromFrontend === true"
              @bubble-click="onBubbleClick"
              @visible-change="onVisibleChange"
              @collapse-change="onCollapseChange"
            />
          </div>
          <ResourcePoolTable
            ref="tableRef"
            :data="chartData"
          />
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import CommonTitle from "@/components/home/CommonTitle.vue";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import AICategoryNav from "@/components/AICategoryNav.vue";
import AIComputerPower from "./aiComputerPower.vue";
import SuperNodeChart from "./superNodeChart.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";
import {
  mode,
  selectedModelType,
  selectedResourceType,
  selectedTokenGroup,
  parentName,
  isCustomer,
} from "./useAIComputer";
import { mockFetchEfficiency2, toSuperNodeChartData } from "./useSuperNodeChart";
import { useCurrentDate } from "./useCurrentDate";
import SwitchTableOrChart from "@/components/SwitchTableOrChart.vue";

const NPU_USEAGE_FOR_GENERATION = {
  key: "npuUsage",
  label: "资源池",
  xField: "_npuUseRate",
  yField: "_allocationRate",
  xAxisName: "NPU使用率",
  title: "分配率",
  yAxisName: "%",
  yRange: [0, 100],
  tooltipYLabel: "分配率",
  trafficLightKeys: { x: "NPU使用率", y: "A3分配率" },
  dataFilter: (d) => d.x != null && d.y != null && d._npuUseRate > 0,
};
const NPU_USEAGE_FOR_CUSTOMER = {
  key: "npuUsage",
  label: "资源池",
  xField: "_cardTimeUseRate",
  yField: "_aiCoreUseRate",
  xAxisName: "卡时使用率",
  title: "AI Core利用率",
  yAxisName: "AI Core利用率",
  axisRangeDataPadding: 5,
  yTicks: [0, 10, 20, 30],
  tooltipYLabel: "AI Core利用率",
  tooltipMetricOrder: ["y", "x"],
  trafficLightKeys: { x: "卡时使用率", y: "AI Core利用率" },
  dataFilter: (d) => d.x != null && d.y != null && d._cardTimeUseRate > 0,
};
const SUPER_NODE_CONFIG = {
  key: "superNode",
  label: "超节点",
  avgXFromFrontend: true,
};
const TOKEN_MODEL_MODE_CONFIG = {
  key: "tokenUsage",
  label: "资源池",
  xField: "_tokenUseRate",
  yField: "_actualTps",
  xAxisName: "Token利用率",
  title: "模型分析",
  yAxisName: "模型分析",
  yAxisTopLabel: "实际TPS",
  yRange: [0, 100],
  tooltipYLabel: "实际TPS",
  trafficLightKeys: { x: "Token利用率", y: "实际TPS" },
  dataFilter: (d) => d.x != null && d.y != null && d._tokenUseRate > 0,
};
const TOKEN_CUSTOMER_MODE_CONFIG = {
  key: "tokenUsage",
  label: "资源池",
  xField: "_dailyToken",
  yField: "_avgRpm",
  xAxisName: "日Token数",
  title: "客户模型分析",
  yAxisName: "客户模型分析",
  yAxisTopLabel: "平均RPM",
  xAxisValueUnit: "",
  xRange: [0, 1000],
  yRange: [0, 100],
  yTicks: [0, 25, 50, 75, 100],
  tooltipYLabel: "平均RPM",
  tooltipMetricOrder: ["y", "x"],
  tooltipShowSize: false,
  singleLegend: { label: "客户", color: "#6d5dfc" },
  trafficLightKeys: { x: "日Token数", y: "平均RPM" },
  dataFilter: (d) => d.x != null && d.y != null && d._dailyToken > 0,
};

const { date: currentMonth } = storeToRefs(useCurrentDate());

const CARD_TYPE_VALUE_KEY = "cardType";
const MODEL_TYPE_VALUE_KEY = "modelType";
const CARD_TYPE_OPTIONS = ["A3", "A2", "A1"];
const MODEL_TYPE_OPTIONS = ["DS V4", "DS V3", "Minimax"];
const cardTypeFilterConfig = {
  key: CARD_TYPE_VALUE_KEY,
  label: "卡类型",
  type: "list",
  optionKey: CARD_TYPE_VALUE_KEY,
  valueKey: CARD_TYPE_VALUE_KEY,
};
const modelTypeFilterConfig = {
  key: MODEL_TYPE_VALUE_KEY,
  label: "模型类型",
  type: "list",
  optionKey: MODEL_TYPE_VALUE_KEY,
  valueKey: MODEL_TYPE_VALUE_KEY,
};
const overviewFilterOptions = {
  [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
  [MODEL_TYPE_VALUE_KEY]: MODEL_TYPE_OPTIONS,
};
const overviewFilterValue = ref({
  [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
});
const isToken = computed(() => mode.value === 'token');

const computeOverviewItems = [
  {
    name: "A3",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "A2",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "A1",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
];

const computeCustomerItems = [
  {
    name: "内部",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "外部",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "YT",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
];

const tokenOverviewItems = [
  {
    name: "DS V4",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
  {
    name: "DS V3",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
  {
    name: "Minimax",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
];

const tokenCustomerItems = [
  {
    name: "外部",
    cardNum: "42",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "25.295%",
  },
  {
    name: "内部",
    cardNum: "42",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "25.295%",
  },
];

const overviewFilterConfig = computed(() => {
  if (isToken.value) {
    return [modelTypeFilterConfig];
  }
  return [cardTypeFilterConfig];
});

const filteredComputeItems = computed(() => {
  const selectedCards = overviewFilterValue.value[CARD_TYPE_VALUE_KEY];
  if (!Array.isArray(selectedCards)) return [];
  return computeOverviewItems.filter((item) => selectedCards.includes(item.name));
});

const filteredTokenItems = computed(() => {
  const selectedModels = overviewFilterValue.value[MODEL_TYPE_VALUE_KEY];
  if (!Array.isArray(selectedModels)) return [];
  return tokenOverviewItems.filter((item) => selectedModels.includes(item.name));
});

function maskOverviewItem(item) {
  // 左侧只脱敏展示数据，name 继续作为点击选择右侧图表的业务标识。
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, key === "name" ? value : "**"])
  );
}

const maskedFilteredComputeItems = computed(() =>
  filteredComputeItems.value.map(maskOverviewItem)
);

const maskedComputeCustomerItems = computed(() =>
  computeCustomerItems.map(maskOverviewItem)
);

const maskedFilteredTokenItems = computed(() =>
  filteredTokenItems.value.map(maskOverviewItem)
);

const maskedTokenCustomerItems = computed(() =>
  tokenCustomerItems.map(maskOverviewItem)
);

const xpodDetailData = ref({});
const fetchXpodDetail = async () => {
  const response = await mockFetchEfficiency2();
  xpodDetailData.value = response.data;
};

const superNodeData = computed(() => {
  const list = xpodDetailData.value?.quadrantVo?.list;
  return list ? toSuperNodeChartData(list) : [];
});
const superNodeAvgRangeList = computed(() =>
  xpodDetailData.value?.quadrantVo?.avgRangeList ?? []
);

const tabs = computed(() => {
  if (isToken.value) {
    if (selectedTokenGroup.value === "customer") {
      return [TOKEN_CUSTOMER_MODE_CONFIG];
    }
    return [TOKEN_MODEL_MODE_CONFIG];
  }
  if (['A3'].includes(selectedResourceType.value) ||
    ['代次'].includes(parentName.value) && !selectedResourceType.value) {
      return [NPU_USEAGE_FOR_GENERATION, SUPER_NODE_CONFIG];
  } else if (isCustomer.value) {
    return [NPU_USEAGE_FOR_CUSTOMER];
  } else {
    return [NPU_USEAGE_FOR_GENERATION];
  }
});
const activeTab = ref(tabs.value[0].key);
const activeTabYTitle = ref(tabs.value[0].title);

const chartRef = ref(null);
const superNodeChartRef = ref(null);
const tableRef = ref(null);
const tierFilter = ref(null);

const isSuperNode = computed(() => activeTab.value === "superNode");

watch(tabs, (newTabs) => {
  activeTab.value = newTabs[0].key;
  activeTabYTitle.value = newTabs[0].title;
});

watch(isSuperNode, () => {
  if (isSuperNode.value) {
    fetchXpodDetail();
  }
});

watch(currentMonth, () => {
  if (isSuperNode.value) {
    fetchXpodDetail();
  }
});

watch(activeTab, () => {
  tierFilter.value = null;
  chartCollapsed.value = false;
});

watch(mode, (nextMode) => {
  tierFilter.value = null;
  chartCollapsed.value = false;
  if (nextMode === "token") {
    overviewFilterValue.value = {
      [MODEL_TYPE_VALUE_KEY]: MODEL_TYPE_OPTIONS,
    };
    return;
  }
  overviewFilterValue.value = {
    [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
  };
});

watch(filteredComputeItems, (items) => {
  if (isToken.value) return;
  if (parentName.value !== "代次") return;
  if (!items.length) return;
  const isSelectedVisible = items.some(item => item.name === selectedResourceType.value);
  if (isSelectedVisible) return;
  selectedResourceType.value = items[0].name;
});

watch(filteredTokenItems, (items) => {
  if (!isToken.value) return;
  if (!items.length) return;
  const isSelectedVisible = items.some(item => item.name === selectedModelType.value);
  if (isSelectedVisible) return;
  selectedModelType.value = items[0].name;
});

const currentConfig = computed(() =>
  tabs.value.find((t) => t.key === activeTab.value) ?? tabs.value[0]
);

/** 与「无有效气泡点」判定一致：null / 非有限数字视为无效，数值为 0 视为零 */
function isNullOrZeroAxisValue(v) {
  if (v == null) return true;
  const n = Number(v);
  if (!Number.isFinite(n)) return true;
  return n === 0;
}

/** 无行，或每一行 x、y 均为 null/0（无有效坐标） */
function isAllBubbleAxesNullOrZero(rows) {
  if (!rows.length) return true;
  return rows.every(
    (row) => isNullOrZeroAxisValue(row.x) && isNullOrZeroAxisValue(row.y)
  );
}

const currentChartRef = computed(() =>
  activeTab.value === "superNode" ? superNodeChartRef.value : chartRef.value
);
const allData = computed(() => currentChartRef.value?.data ?? []);

/** 气泡图：数据全空/全为 0 时用固定 [0,100] 与关闭按数据驱动的 Y 轴配置 */
const isBubbleAxisDataDegenerate = computed(() => {
  if (activeTab.value === "superNode") return false;
  return isAllBubbleAxesNullOrZero(allData.value);
});

const bubbleChartYRange = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? [0, 100]
    : currentConfig.value.yRange
);

const bubbleChartYTicks = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? null
    : currentConfig.value.yTicks ?? null
);

const bubbleChartAxisPadding = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? null
    : currentConfig.value.axisRangeDataPadding ?? null
);
const chartData = computed(() =>
  tierFilter.value ? allData.value.filter(tierFilter.value) : allData.value
);

const chartCollapsed = ref(false);

function onCollapseChange(isCollapsed) {
  chartCollapsed.value = isCollapsed;
}

function onVisibleChange(filterFn) {
  tierFilter.value = filterFn;
}

function onBubbleClick(detail) {
  const azName = detail.azName || detail.name;
  tableRef.value?.scrollToByName(azName);
}

function onOverviewFilterChange(value) {
  overviewFilterValue.value = value;
  if (isToken.value) {
    updateSelectedModelType(value[MODEL_TYPE_VALUE_KEY]);
    return;
  }
  updateSelectedResourceType(value[CARD_TYPE_VALUE_KEY]);
}

function updateSelectedResourceType(cardTypes) {
  if (!cardTypes.length) return;
  if (cardTypes.includes(selectedResourceType.value)) return;
  selectedResourceType.value = cardTypes[0];
}

function updateSelectedModelType(modelTypes) {
  if (!modelTypes.length) return;
  if (modelTypes.includes(selectedModelType.value)) return;
  selectedModelType.value = modelTypes[0];
}

const tableRadio = ref('chart');
</script>

<style scoped lang="less">
.flex-center {
  display: flex;
  align-items: center;
}

.container {
  width: 100%;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  border-radius: 16px;
  background-color: rgba(221, 227, 246, 0.4);
  box-shadow: 0 4px 4px 0 rgba(33, 48, 92, 0.2);
  padding: 24px 24px 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    width: 100%;
    min-width: 0;
  }

  .main {
    flex: 1;
    min-height: 0;
    gap: 24px;
    align-items: stretch;

    .main-left {
      flex-shrink: 0;
      flex-basis: 30%;
      width: 30%;
      min-width: 0;
    }

    .main-right {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .tab-bar {
        display: flex;
        flex-shrink: 0;

        .tab-item {
          padding: 8px 20px;
          font-size: 16px;
          color: #606266;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;

          &:hover {
            color: #353575;
          }

          &.active {
            color: #353575;
            font-weight: 600;
            border-bottom-color: #353575;
          }
        }
      }

      .chart-area {
        flex-shrink: 0;
        width: 100%;
        min-width: 0;
        min-height: 0;
        height: 380px;
        transition: height 0.3s ease;

        &.chart-area--collapsed {
          height: 255px;
        }
      }

      .switch-btn {
        align-self: flex-end;
        margin: 8px 0 14px;
      }

      .trend {
        flex: 1;
        min-height: 0;
        min-width: 0;
        padding: 18px 20px;
        border-radius: 14px;
        background: rgba(246, 248, 252, 0.9);
        box-sizing: border-box;
      }

      .trend-upSuperNode {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .trend-superNode {
        display: flex;
        flex-direction: column;
        gap: 16px;

        &.trend-superNode--collapsed {
          gap: 28px;
        }

        :deep(.bubble-chart-wrap) {
          min-height: 0;
        }

        :deep(.bubble-chart) {
          min-height: 0;
        }
      }

      .ai-computer-power {
        flex-shrink: 0;
        min-width: 0;
      }

      .trend-header {
        height: 32px;
        display: flex;
        align-items: flex-start;
        color: #16183d;
        font-size: 20px;
        font-weight: 700;
        line-height: 28px;
      }

      .trend-chart {
        width: 100%;
        min-width: 0;
        height: 380px;
      }

      .ai-table {
        flex: 1;
        min-height: 460px;
        min-width: 0;
        padding: 24px;
        border-radius: 14px;
        background: rgba(246, 248, 252, 0.9);
        color: #353575;
        font-size: 16px;
        font-weight: 600;
        box-sizing: border-box;
      }
    }
  }
}
</style>
