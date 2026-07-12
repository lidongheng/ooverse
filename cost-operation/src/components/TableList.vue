<template>
  <div class="rg-table-box">
    <el-table
      class="rg-custom-table"
      ref="table"
      :data="tableDataByPage"
      :default-sort="defaultSort"
      :expand-row-keys="expands"
      :header-cell-style="headerCellStyle"
      header-row-class-name="rg-gross-table"
      :row-style="rowStyle"
      row-key="index"
      empty-text="暂无数据"
      @sort-change="sortChangeFunc"
      @filter-change="filterChangeFunc"
      @row-click="rowClick"
      v-bind="tableConfig"
    >
      <template v-for="item in tableColumn">
        <el-table-column
          v-if="item.type === 'showExpand'"
          type="expand"
          class="expand-col"
          width="1"
        >
          <template v-slot="scope">
            <slot name="expand" :scope="scope" />
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="!!item.children"
          :label="item.label"
          :align="item.align"
        >
          <template v-for="child in item.children">
            <el-table-column
              :show-overflow-tooltip="child.showTooltip"
              :prop="child.prop"
              :label="child.label"
              :minWidth="changeValueByScale(child.width)"
              :sortable="child.sortable"
              :formatter="child.formatterFun"
              :className="child.className"
              :filters="
                child.showFilter
                  ? item.filterOptions || getFilters(child.prop, tableData)
                  : null
              "
              :filter-method="child.showFilter ? filterHandler : null"
              :align="child.align"
            >
              <template v-if="child.showSlot" v-slot="scope">
                <slot
                  :name="child.prop"
                  :scope="{ row: scope.row, index: scope.$index }"
                ></slot>
              </template>
            </el-table-column>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="item.type === 'index'"
          type="index"
          :label="item.label"
          :align="item.align"
          :width="changeValueByScale(item.width)"
        ></el-table-column>
        <el-table-column
          v-else
          :show-overflow-tooltip="item.showTooltip"
          :prop="item.prop"
          :label="item.label"
          :width="changeValueByScale(item.width)"
          :minWidth="changeValueByScale(item.minWidth)"
          :sortable="item.sortable"
          :formatter="item.formatterFun"
          :className="item.className"
          :filters="
            item.showFilter
              ? item.filterOptions || getFilters(item.prop, tableData)
              : null
          "
          :filter-method="item.showFilter ? filterHandler : null"
          :align="item.align"
        >
          <template #header>
            <span>{{ item.label }}</span>
            <span v-if="item.tipsCode" class="mgl8">
              <!--<Indicators :code="item.tipsCode" /> -->
            </span>
          </template>
          <template v-if="item.showSlot" v-slot="scope">
            <slot
              :name="item.prop"
              :scope="{ row: scope.row, index: scope.$index }"
            ></slot>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      class="pages"
      v-if="showPage"
      :size="props.paginationSmall"
      :teleported="false"
      :background="true"
      :total="props.tableData.length"
      :current-page="pages.pageNo"
      :page-size="pages.pageSize"
      @current-change="pageCurrentChange"
      @size-change="pageSizeChange"
      :layout="pages.layout"
    ></el-pagination>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { changeValueByScale } from '@/composables/autoLayout/index';
import { useForceCastTablePagination } from './useForceCastTablePagination';
// import Indicators from '@/components/indicator-tips/index.vue';

const table = ref();
const props = defineProps([
'tableColumn',
'tableData',
'sortChangeFunc',
'filterChangeFunc',
'rowStyle',
'rowClick',
'expands',
'defaultSort',
'tableConfig',
'showPage',
'paginationSmall',
'pageSize',
'pageNo',
]);

const headerCellStyle = ({ column, columnIndex }) => {
if (column.align) {
return { textAlign: column.align };
}

if (column.property === 'xpodName') {
return { textAlign:  'left' };
}
return { textAlign: columnIndex === 0 ? 'left' : 'end' };
};

const getFilters = (prop, data) => Array.from(new Set(data.map((i) => i[prop]))).map((item) => ({ text: item, value: item }));

const filterHandler = (value, row, column) =>
row[column.property] === value;

const { pages,
pageCurrentChange,
pageSizeChange } = useForceCastTablePagination(props);

const tableDataByPage = computed(() => {
if (!props.showPage) return props.tableData;

// showPage 开启时 TableList 自己按当前页切片，避免每个业务表重复写分页截取。
return props.tableData?.slice((pages.pageNo - 1) * pages.pageSize,
pages.pageNo * pages.pageSize);
});

// 暴露 table 组件方法

const sort = (...args) => table.value?.sort(...args);
const toggleRowExpansion = (...args) => table.value?.toggleRowExpansion(...args);
const clearSort = () => table.value?.clearSort();

defineExpose ({
    sort,
toggleRowExpansion,
clearSort,
});
</script>

<style lang="less" scoped>
:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}
.pages {
  margin-top: 12px;
}

.rg-table-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .cloud-service-item {
    display: flex;
    align-items: center;
    color: rgba(113, 113, 168, 1);
    font-weight: 400;
    font-size: 16px;
  }

  .profit-rate-value {
    color: rgba(53, 53, 117, 1);
    font-weight: 400;
    font-size: 18px;
  }

  .revenue-volume-value {
    color: rgba(53, 53, 117, 1);
    font-weight: 400;
    font-size: 16px;
  }

  .cost-value {
    color: rgba(53, 53, 117, 1);
    font-weight: 400;
    font-size: 16px;
  }
}
</style>
<style>
.rg-gross-table {
  font-size: 14px;
  font-weight: 400;
  font-family: Microsoft YaHei;
  color: rgba(98, 98, 168, 1);

  th {
    border-bottom-color: rgb(217, 220, 238) !important;
  }
}

.rg-table-box .rg-custom-table {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  --el-color-primary: rgba(53, 53, 117, 1);
  --el-text-color-placeholder: rgba(158, 158, 208, 1);
  .cell {
    padding: 0 8px;
    font-weight: normal;
    line-height: 16px;
  }

  .el-table__body-wrapper {
    td {
      border-bottom-color: rgb(217, 220, 238) !important;
    }

    .cell {
      color: rgba(53, 53, 117, 1);
      font-size: 14px;
      height: 20px;
      line-height: 20px;
      white-space: nowrap;
    }
  }
}
</style>
