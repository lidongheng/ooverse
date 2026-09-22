import { computed, ref } from 'vue';
import { ecsTableRows as originalRows, resourceTree, trendValues } from './staticData';

export function useEcsTable() {
  // 移植时保留三个关键状态：表格实例、当前选中的大区、未经表格筛选的完整数据源。
  const ecsTableRef = ref();
  const selectedAreas = ref([]);
  const ecsTableRows = [
    ...originalRows,
    { index: 7, area: '中东', region: '中东-利雅得', az: '中东-利雅得-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '6,200' },
    { index: 8, area: '中东', region: '中东-利雅得', az: '中东-利雅得-AZ2', family: 'c', generation: 'c6', type: 'c6-4', stock: '5,100' },
    { index: 9, area: '亚太', region: '亚太-新加坡', az: '亚太-新加坡-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '8,200' },
    { index: 10, area: '亚太', region: '亚太-曼谷', az: '亚太-曼谷-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '4,600' },
    { index: 11, area: '欧洲', region: '欧洲-巴黎', az: '欧洲-巴黎-AZ1', family: 'c', generation: 'c6', type: 'c6-4', stock: '7,300' },
    { index: 12, area: '欧洲', region: '欧洲-巴黎', az: '欧洲-巴黎-AZ2', family: 'c', generation: 'c6', type: 'c6-4', stock: '6,800' },
  ];

  // AZ 候选项必须始终从完整数据源 ecsTableRows 计算。
  // 选中大区时按 area 收窄；大区数组为空表示已重置，此时自然恢复全部 AZ 候选项。
  // 不要从 el-table 当前展示行计算，否则行已被筛选后，重置大区也拿不回被排除的 AZ。
  const azFilterOptions = computed(() => {
    const rows = ecsTableRows.filter((row) => selectedAreas.value.length === 0 || selectedAreas.value.includes(row.area));
    return [...new Set(rows.map((row) => row.az))].map((az) => ({ text: az, value: az }));
  });

  const handleFilterChange = (filters) => {
    // columnKey 决定 filters 的键名，因此大区列必须配置 columnKey: 'area'。
    // filter-change 只包含本次发生变化的列；单独筛选 AZ 时不能覆盖 selectedAreas。
    if (!Object.prototype.hasOwnProperty.call(filters, 'area')) return;
    selectedAreas.value = filters.area;
    // 大区切换或重置后，旧 AZ 可能已不在新候选项中，但 Element Plus 仍会保留它的筛选状态。
    // 主动清除 AZ 后，表格数据和弹层勾选状态才能与新的 AZ 候选项保持一致。
    ecsTableRef.value.clearFilter(['az']);
  };

  const lineChartStyle = {
    width: 900,
    height: 248,
  };

  const ecsTableConfig = {
    height: 210,
  };

  // area 和 az 都要设置 showFilter 与 columnKey；az 的 filterOptions 跟随大区响应式变化。
  // 移植到其他项目时，将 area、az 替换成目标数据的字段名，并同步修改 handleFilterChange 中的键名。
  const ecsTableColumns = computed(() => [
    { prop: 'index', label: '序号', width: 70 },
    { prop: 'area', columnKey: 'area', label: '大区', minWidth: 110, showFilter: true },
    { prop: 'region', label: 'Region', minWidth: 150 },
    { prop: 'az', columnKey: 'az', label: 'AZ', minWidth: 160, showFilter: true, filterOptions: azFilterOptions.value },
    { prop: 'family', label: '资源族', minWidth: 110 },
    { prop: 'generation', label: '资源代次', minWidth: 110 },
    { prop: 'type', label: '资源类型', minWidth: 110 },
    // stock 和 operation 使用插槽，是为了保留绿色数值和“查看趋势”按钮样式。
    { prop: 'stock', label: '可售量(核)', minWidth: 120, showSlot: true },
    { prop: 'operation', label: '操作', minWidth: 100, showSlot: true },
  ]);

  const lineOption = {
    grid: {
      left: 46,
      right: 22,
      top: 20,
      bottom: 34,
    },
    xAxis: {
      type: 'category',
      data: trendValues.map((item, index) => index + 1),
      boundaryGap: false,
      axisLabel: {
        color: '#8a8bab',
        fontSize: 11,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#e9ecf5',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '核',
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
        data: trendValues,
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
  };

  return {
    ecsTableRef,
    ecsTableRows,
    ecsTableColumns,
    ecsTableConfig,
    handleFilterChange,
    resourceTree,
    lineChartStyle,
    lineOption,
  };
}
