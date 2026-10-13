<template>
  <div class="detail-table-layout">
    <aside class="tree-card">
      <div class="tree-title">资源目录</div>
      <el-input model-value="" size="small" placeholder="请输入筛选关键字" />
      <el-tree
        class="resource-tree"
        :data="resourceTree"
        show-checkbox
        default-expand-all
        node-key="label"
      />
    </aside>

    <section class="table-card">
      <div class="toolbar">
        <div class="range-tabs">
          <button type="button" class="active">全部</button>
          <button type="button">大区</button>
          <button type="button">Region</button>
          <button type="button">AZ</button>
        </div>
        <el-select model-value="月" size="small">
          <el-option label="日" value="日" />
          <el-option label="月" value="月" />
          <el-option label="年" value="年" />
        </el-select>
      </div>

      <div class="trend-chart">
        <CommonChart
          :options="lineOption"
          :style="lineChartStyle"
        />
      </div>

      <!-- ref 用来调用 clearFilter，filter-change 则交给 composable 处理大区和 AZ 的联动。 -->
      <TableList
        ref="ecsTableRef"
        class="detail-table"
        :table-column="ecsTableColumns"
        :table-data="ecsTableRows"
        :table-config="ecsTableConfig"
        :filter-change-func="handleFilterChange"
      >
        <template #stock="{ scope }">
          <span class="stock-value">{{ scope.row.stock }}</span>
        </template>
        <template #operation>
          <button type="button" class="link-button">查看趋势</button>
        </template>
      </TableList>

      <div class="pagination-row">
        <span>共 2228 条</span>
        <el-select model-value="50条/页" size="small">
          <el-option label="50条/页" value="50条/页" />
        </el-select>
        <el-pagination layout="prev, pager, next, jumper" :total="2228" :page-size="50" />
      </div>
    </section>
  </div>
</template>

<script setup>
import CommonChart from '@/components/CommonChart.vue';
import TableList from '@/components/TableList.vue';
import { useEcsTable } from './useEcsTable';

const {
  ecsTableRef,
  ecsTableRows,
  ecsTableColumns,
  ecsTableConfig,
  handleFilterChange,
  resourceTree,
  lineChartStyle,
  lineOption,
} = useEcsTable();
</script>

<style scoped lang="less">
.detail-table-layout {
  min-height: 0;
  padding: 18px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
}

.tree-card,
.table-card {
  min-height: 0;
  border-radius: 8px;
  background: #fff;
}

.tree-card {
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid #eceef7;
}

.tree-title {
  margin-bottom: 12px;
  color: #34356f;
  font-size: 16px;
  font-weight: 700;
}

.resource-tree {
  margin-top: 14px;
  color: #4b4c7d;
}

.table-card {
  min-width: 0;
}

.toolbar,
.range-tabs,
.pagination-row {
  display: flex;
  align-items: center;
}

.toolbar {
  justify-content: space-between;
  margin-bottom: 8px;
}

.range-tabs button {
  height: 30px;
  padding: 0 14px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #595a8a;
  cursor: pointer;
}

.range-tabs button.active {
  background: #39358e;
  color: #fff;
}

.toolbar :deep(.el-select) {
  width: 74px;
}

.trend-chart {
  height: 248px;
  margin-bottom: 10px;
  border: 1px solid #f0f2f8;
  border-radius: 6px;
}

.detail-table {
  --el-table-header-bg-color: #f4f5fb;
  --el-table-border-color: #eceef7;
  color: #4d4e7c;
}

.stock-value {
  color: #2d9a74;
  font-weight: 700;
}

.link-button {
  border: 0;
  background: transparent;
  color: #6262a8;
  cursor: pointer;
}

.pagination-row {
  height: 40px;
  gap: 10px;
  color: #555681;
  font-size: 13px;
}

.pagination-row :deep(.el-select) {
  width: 98px;
}
</style>
