<template>
  <div class="detail-table-layout">
    <div class="table-toolbar">
      <div class="section-title">资源详情</div>
    </div>

    <div
      v-if="showRangeToolbar"
      class="range-toolbar"
    >
      <span class="range-label">范围粒度</span>
      <el-radio-group v-model="rangeValue" class="range-radios">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="大区" value="大区" />
        <el-radio-button label="Region" value="Region" />
        <el-radio-button label="AZ" value="AZ" />
      </el-radio-group>
    </div>

    <TableList
      class="detail-table"
      :table-column="tableColumns"
      :table-data="tableRows"
      :table-config="tableConfig"
      :expands="expandedRows"
    >
      <template #stock="{ scope }">
        <span class="stock-value">{{ scope.row.stock }}</span>
      </template>
      <template #operation="{ scope }">
        <button
          type="button"
          class="trend-button"
          @click="toggleTrend(scope.row)"
        >
          {{ getTrendButtonText(scope.row.index) }}
        </button>
      </template>
      <template #expand>
        <div class="trend-row">
          <CommonChart
            :options="xpuTrendOption"
            :style="xpuTrendChartStyle"
          />
        </div>
      </template>
    </TableList>

    <div class="pagination-row">
      <span>共 {{ tableTotal }} 条</span>
      <el-select model-value="50条/页" size="small">
        <el-option :label="pageSizeText" :value="pageSizeText" />
      </el-select>
      <el-pagination layout="prev, pager, next, jumper" :total="tableTotal" :page-size="pageSize" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import CommonChart from '@/components/CommonChart.vue';
import TableList from '@/components/TableList.vue';
import { useCurrentDate } from '@/views/useCurrentDate';
import { networkRows } from './staticData';
import {
  buildDimensionParams,
  getSalesTrendByXpuAPI,
  obsTable,
  pageInfo,
  pageSize,
  rangeValue,
  tableSummary,
  useResoureDetailByOBS,
  useResoureDetailByXPU,
  xpuTrendData,
  xpuTable,
} from './useResourceData';

const props = defineProps({
  active: {
    type: String,
    required: true,
  },
});

const currentStore = useCurrentDate();
// OBS 和 XPU 的资源详情都需要范围粒度，network 截图里没有这一行。
const showRangeToolbar = computed(() => {
  return props.active === 'OBS' || props.active === 'XPU';
});
const xpuTrendChartStyle = {
  width: 900,
  height: 236,
};
// OBSTable 同时承载 OBS、XPU、network，activeRef 传给 composable 控制实际请求时机。
const activeRef = computed(() => props.active);
useResoureDetailByOBS(activeRef);
useResoureDetailByXPU(activeRef);
const pageSizeText = computed(() => `${pageSize.value}条/页`);
const tableTotal = computed(() => {
  // network 资源当前仍是静态页，分页总数不使用 OBS/XPU 共享 pageInfo。
  if (props.active === 'network') {
    return 2228;
  }

  return pageInfo.value.total;
});

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return Number(value).toLocaleString();
};

// 表格展示字段在这里统一适配：接口字段名不直接暴露给 TableList。
const tableRows = computed(() => {
  if (props.active === 'network') {
    return networkRows;
  }

  if (props.active === 'XPU') {
    // XPU 表格的 stock 展示待分配量，对应后端 unallocatedXpu。
    return xpuTable.value.map((item, index) => {
      return {
        index: index + 1,
        area: item.regName,
        region: item.regionName,
        type: item.cardModel,
        spec: item.computePower,
        stock: formatNumber(item.unallocatedXpu),
        // 趋势接口按当前行构造维度参数，保留原始字段避免从展示文案反推。
        areaName: item.regName,
        regionId: item.regionId,
        azId: item.azId,
      };
    });
  }

  // OBS 表格的 stock 展示可售容量，对应后端 sellableCapacity。
  return obsTable.value.map((item, index) => {
    return {
      index: index + 1,
      area: item.regName,
      region: item.regionName,
      type: item.storageMode,
      stock: formatNumber(item.sellableCapacity),
    };
  });
});

const expandedTrendIndex = ref(null);
// TableList 通过 row-key=index 控制展开行，所以这里返回当前展开的行号。
const expandedRows = computed(() => {
  if (expandedTrendIndex.value === null) {
    return [];
  }

  return [expandedTrendIndex.value];
});

function xpuSummaryMethod({ columns }) {
  // Element Plus 会按当前展示列顺序传入 columns，这里逐列返回底部汇总行文案。
  return columns.map((column) => {
    if (column.property === 'index') {
      // 汇总行第一格展示固定文案，和截图里的“汇总”保持一致。
      return '汇总';
    }

    if (column.property === 'stock') {
      // XPU 的汇总值来自表格接口 summaryVo，不重新累加当前页，避免分页后汇总变小。
      return formatNumber(tableSummary.xpu.unallocatedXpu);
    }

    // 非汇总字段保持空白，避免大区、Region、卡类型等列出现误导性内容。
    return '';
  });
}

const tableConfig = computed(() => {
  const config = {
    height: 438,
  };

  if (props.active === 'XPU') {
    // XPU 截图底部有汇总行，TableList 通过 el-table 的 summary 配置透传实现。
    config.showSummary = true;
    config.summaryMethod = xpuSummaryMethod;
  }

  return config;
});
// XPU 趋势图使用独立趋势样例，detail 接口只负责顶部关键信息。
const xpuTrendList = computed(() => {
  if (!Array.isArray(xpuTrendData.value)) {
    return [];
  }

  return xpuTrendData.value;
});
const xpuTrendOption = computed(() => ({
  grid: {
    left: 50,
    right: 28,
    top: 28,
    bottom: 36,
  },
  xAxis: {
    type: 'category',
    data: xpuTrendList.value.map((item) => item.dataDate),
    boundaryGap: false,
    axisLabel: {
      color: '#8a8bab',
      fontSize: 11,
    },
    axisLine: {
      lineStyle: {
        color: '#e9ecf5',
      },
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    name: '月销量趋势',
    nameTextStyle: {
      color: '#34356f',
      fontWeight: 700,
      align: 'left',
      padding: [0, 0, 0, 4],
    },
    axisLabel: {
      color: '#8a8bab',
    },
    splitLine: {
      lineStyle: {
        color: '#edf0f8',
      },
    },
  },
  series: [
    {
      type: 'line',
      data: xpuTrendList.value.map((item) => item.unallocatedXpu),
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: {
        color: '#75a9dd',
        width: 2,
      },
      itemStyle: {
        color: '#fff',
        borderColor: '#75a9dd',
        borderWidth: 2,
      },
      label: {
        show: true,
        position: 'top',
        color: '#34356f',
        fontSize: 11,
      },
    },
  ],
}));

function getTrendButtonText(index) {
  if (expandedTrendIndex.value === index) {
    return '关闭趋势';
  }

  return '查看趋势';
}

function buildTrendParams(row) {
  // 行内趋势图要按“当前粒度 + 当前行”查数据；这里复用 useResourceData 的互斥维度规则。
  return {
    month: currentStore.saleMonth,
    date: currentStore.saleDate,
    ...buildDimensionParams({
      areaName: row.areaName,
      regionId: row.regionId,
      azId: row.azId,
    }),
  };
}

function toggleTrend(row) {
  const index = row.index;
  // 同一时间只展开一行趋势，保持表格高度和截图一致。
  if (expandedTrendIndex.value === index) {
    expandedTrendIndex.value = null;
    return;
  }

  // 趋势图是行内展开内容，点击时按当前行和当前范围粒度重新请求 mock 数据。
  getSalesTrendByXpuAPI(buildTrendParams(row)).then((res) => {
    if (res.status === 200) {
      // trend 数据单独存放，避免覆盖 xpu/detail 返回的顶部 A1/A2/A3 指标。
      xpuTrendData.value = res.data.trend;
    }
  });

  expandedTrendIndex.value = index;
}

// 不同资源页列不同，但全部交给 TableList 渲染，避免页面里再次直接写 el-table。
const tableColumns = computed(() => {
  if (props.active === 'network') {
    return [
      { prop: 'index', label: '序号', width: 78 },
      { prop: 'exit', label: '公网出口', minWidth: 180 },
      { prop: 'bandwidth', label: '峰值名称', minWidth: 320 },
      { prop: 'stock', label: '可用带宽', minWidth: 180, showSlot: true },
    ];
  }

  if (props.active === 'XPU') {
    return [
      // showExpand 列只给 XPU 使用，用来承载行内趋势图。
      { type: 'showExpand' },
      { prop: 'index', label: '序号', width: 78 },
      { prop: 'area', label: '大区', minWidth: 120 },
      { prop: 'region', label: 'Region', minWidth: 180 },
      { prop: 'type', label: '卡类型', minWidth: 120 },
      { prop: 'spec', label: '算力类型', minWidth: 120 },
      { prop: 'stock', label: '待分配量(卡)', minWidth: 140, showSlot: true },
      { prop: 'operation', label: '操作', minWidth: 116, showSlot: true },
    ];
  }

  return [
    // 序号列只表示当前页行号，不参与业务筛选。
    { prop: 'index', label: '序号', width: 78 },
    // OBS 表格除序号外都显示筛选，筛选项由 TableList 从当前表格数据自动生成。
    { prop: 'area', label: '大区', minWidth: 120, showFilter: true },
    { prop: 'region', label: 'Region', minWidth: 180, showFilter: true },
    { prop: 'type', label: '存储类型', minWidth: 120, showFilter: true },
    { prop: 'stock', label: '可售量(PB)', minWidth: 140, showSlot: true, showFilter: true },
  ];
});
</script>

<style scoped lang="less">
.detail-table-layout {
  min-height: 0;
  padding: 18px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.table-toolbar,
.range-toolbar,
.pagination-row {
  display: flex;
  align-items: center;
}

.table-toolbar {
  margin-bottom: 8px;
}

.section-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.range-toolbar {
  gap: 12px;
  margin-bottom: 12px;
}

.range-label {
  color: #8b8cae;
  font-size: 13px;
}

.range-radios :deep(.el-radio-button__inner) {
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #595a8a;
  line-height: 28px;
  box-shadow: none;
}

.range-radios :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #39358e;
  color: #fff;
  box-shadow: none;
}

.detail-table {
  --el-table-header-bg-color: #f4f5fb;
  --el-table-border-color: #eceef7;
  color: #4d4e7c;
}

.trend-button {
  padding: 0 12px;
  box-sizing: border-box;
}

.trend-button {
  border: 0;
  background: transparent;
  color: #6262a8;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.trend-row {
  height: 258px;
  padding: 10px 12px 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eceef7;
  background: #fff;
}

.stock-value {
  color: #2d9a74;
  font-weight: 700;
}

.pagination-row {
  height: 42px;
  gap: 10px;
  color: #555681;
  font-size: 13px;
}

.pagination-row :deep(.el-select) {
  width: 98px;
}
</style>
