import { reactive, watch } from 'vue';

export const useForceCastTablePagination = (props) => {
  // TableList 内部维护分页展示状态，外部仍然可以通过 props.pageNo/pageSize 控制它。
  const pages = reactive({
    pageNo: props.pageNo,
    pageSize: props.pageSize,
    layout: 'total, sizes, prev, pager, next, jumper',
  });

  const pageCurrentChange = (pageNo) => {
    pages.pageNo = pageNo;
  };

  const pageSizeChange = (pageSize) => {
    pages.pageSize = pageSize;
    // 切换每页条数后回到第一页，避免当前页超出新分页范围。
    pages.pageNo = 1;
  };

  // 父组件如果重置页码，这里同步到 TableList 内部分页。
  watch(
    () => props.pageNo,
    (pageNo) => {
      pages.pageNo = pageNo;
    },
  );

  // 父组件如果重置每页条数，这里同步给 el-pagination 和本地切片逻辑。
  watch(
    () => props.pageSize,
    (pageSize) => {
      pages.pageSize = pageSize;
    },
  );

  return {
    pages,
    pageCurrentChange,
    pageSizeChange,
  };
};
