<template>
  <div class="tables-section">
    <!-- 亏损资源池 -->
    <div class="table-panel">
      <div class="panel-header">
        <span class="panel-icon">📉</span>
        <span class="panel-title loss-title">亏损资源池-{{ selectedPoolDisplayName }}</span>
        <el-input
          v-model="lossSearch"
          placeholder="请输入资源关键字"
          :prefix-icon="Search"
          class="panel-search"
          clearable
          size="small"
        />
      </div>
      <el-table
        ref="lossTableRef"
        :data="lossTableData"
        class="resource-table"
        :row-class-name="rowClassName"
        max-height="280"
        size="small"
        @row-click="onRowClick"
      >
        <el-table-column type="index" label="No." width="46" />
        <el-table-column prop="name" label="资源池" min-width="180" show-overflow-tooltip />
        <el-table-column prop="serverNum" label="服务器(台)" width="90" align="right" />
        <el-table-column label="分配率" width="70" align="right">
          <template #default="{ row }">{{ row.x.toFixed(0) }}%</template>
        </el-table-column>
        <el-table-column label="毛利率 ▲" width="90" align="right" sortable :sort-method="(a, b) => a.y - b.y">
          <template #default="{ row }">
            <span class="loss-value">{{ row.y.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="非算力成本占比" width="110" align="right">
          <template #default="{ row }">{{ row.nonComputeCostRatio ?? '--' }}</template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 盈利资源池 -->
    <div class="table-panel">
      <div class="panel-header">
        <span class="panel-icon">📈</span>
        <span class="panel-title profit-title">盈利资源池-{{ selectedPoolDisplayName }}</span>
        <el-input
          v-model="profitSearch"
          placeholder="请输入资源关键字"
          :prefix-icon="Search"
          class="panel-search"
          clearable
          size="small"
        />
      </div>
      <el-table
        ref="profitTableRef"
        :data="profitTableData"
        class="resource-table"
        :row-class-name="rowClassName"
        max-height="280"
        size="small"
        @row-click="onRowClick"
      >
        <el-table-column type="index" label="No." width="46" />
        <el-table-column prop="name" label="资源池" min-width="180" show-overflow-tooltip />
        <el-table-column prop="serverNum" label="服务器(台)" width="90" align="right" />
        <el-table-column label="分配率" width="70" align="right">
          <template #default="{ row }">{{ row.x.toFixed(0) }}%</template>
        </el-table-column>
        <el-table-column label="毛利率" width="90" align="right">
          <template #default="{ row }">
            <span class="profit-value">{{ row.y.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="非算力成本占比" width="110" align="right">
          <template #default="{ row }">{{ row.nonComputeCostRatio ?? '--' }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { Search } from "@element-plus/icons-vue";
import { selectedPool } from "@/views/ResourcesLifecycle";
import { CLOUD_SERVICE_DISPLAY_NAME } from "@/views/useDirectoryTree";

const props = defineProps({
  data: { type: Array, default: () => [] },
});

const lossTableRef = ref(null);
const profitTableRef = ref(null);
const lossSearch = ref("");
const profitSearch = ref("");
const highlightName = ref("");
const selectedPoolDisplayName = computed(() => CLOUD_SERVICE_DISPLAY_NAME[selectedPool.value]);

const lossTableData = computed(() => {
  const keyword = lossSearch.value.trim().toLowerCase();
  return props.data
    .filter((d) => d.y < 0)
    .filter((d) => !keyword || (d.azName || d.name).toLowerCase().includes(keyword))
    .sort((a, b) => a.y - b.y);
});

const profitTableData = computed(() => {
  const keyword = profitSearch.value.trim().toLowerCase();
  return props.data
    .filter((d) => d.y >= 0)
    .filter((d) => !keyword || (d.azName || d.name).toLowerCase().includes(keyword))
    .sort((a, b) => b.y - a.y);
});

function rowClassName({ row }) {
  return (row.azName || row.name) === highlightName.value ? "highlight-row" : "";
}

function onRowClick(row) {
  highlightName.value = row.azName || row.name;
}

async function scrollToByName(azName) {
  highlightName.value = azName;
  await nextTick();

  const lossIdx = lossTableData.value.findIndex((r) => (r.azName || r.name) === azName);
  const profitIdx = profitTableData.value.findIndex((r) => (r.azName || r.name) === azName);

  if (lossIdx >= 0 && lossTableRef.value) {
    lossTableRef.value.scrollTo(0, lossIdx * 36);
    lossTableRef.value.setCurrentRow(lossTableData.value[lossIdx]);
  }
  if (profitIdx >= 0 && profitTableRef.value) {
    profitTableRef.value.scrollTo(0, profitIdx * 36);
    profitTableRef.value.setCurrentRow(profitTableData.value[profitIdx]);
  }
}

defineExpose({ scrollToByName });
</script>

<style lang="less" scoped>
.tables-section {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.table-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 6px;
}

.panel-icon {
  font-size: 16px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.loss-title {
  color: #f55b5b;
}

.profit-title {
  color: #1bcc8e;
}

.panel-search {
  margin-left: auto;
  width: 180px;
}

.loss-value {
  color: #f55b5b;
  font-weight: 600;
}

.profit-value {
  color: #1bcc8e;
  font-weight: 600;
}

.resource-table {
  flex: 1;

  :deep(.highlight-row) {
    td {
      background-color: rgba(53, 53, 117, 0.08) !important;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;
  }
}
</style>
