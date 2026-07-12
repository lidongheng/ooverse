import dayjs from 'dayjs';
import { defineStore } from 'pinia';

const costCenterLastMonth = () => {
  let days = dayjs().date();
  let diffMonth = days < 15 ? 2 : 1;
  return dayjs().add(-`${diffMonth}`, 'month').startOf('month').format('YYYY-MM');
}

const saleDefaultDate = () => {
  return dayjs().subtract(1, 'day').format('YYYYMMDD');
}

const getMonthArray = (currentMonth) => {
  const data = [currentMonth];
  for (let index = 1; index < 6; index++) {
    data.unshift(dayjs(currentMonth).subtract(index, 'months').format('YYYYMM'));
  }
  return data;
};

export const useCurrentDate = defineStore('currentMonth', {
  state: () => {
    return {
      date: costCenterLastMonth('YYYYMMDD'),
      saleDate: saleDefaultDate(),
    };
  },
  getters: {
    monthsArray: (state) => getMonthArray(state.date, 6),
    monthsArray12: (state) => getMonthArray(state.date, 12),
    monthText: (state) => dayjs(state.saleDate).format('M月'),
    month: (state) => dayjs(state.date).format('YYYYMM'),
    saleMonth: (state) => dayjs(state.saleDate).format('YYYYMM'),
    saleDate: (state) => dayjs(state.saleDate).format('YYYYMMDD'),
  },
});

// XPU
export const useResoureDetailByXPU = (active) => {
  const currentStore =
    useCurrentStore();
  const loadCardData = () => {
    const params = {
      month:
        currentStore.saleMonth,
      date: currentStore.saleDate,
      areaName: areaList.value,
      regionid: [],
      regionName:
        regionList.value,
    };
    leftCardData.xpu = {};
    permissionCard.xpu = true;

    getSalesDetailByXpuAPI(params).then((res) => {
      if (res.status === 403) {
        permissionCard.xpu = false;
        return;
      }
      if (res.status === 200) {
        leftCardData.xpu = res.data ?? {};
      }
    });
  };
  const loadInfoData = debounce(() => {
    const params = {
      month: currentStore.saleMonth,
      date: currentStore.saleDate,
      areaName: areaList.value,
      regionid: [],
      regionName: regionList.value,
      cardModel: cardTypeList.value,
    };
    keyInfor.xpu = {};
    getSalesDetailByXpuAPI(params).then((res) => {
      if (res.status === 200) {
        keylnfor.xpu = res.data ?? {};
      }
    });
  }, 100);
  const loadTableData = debounce(() => {
    const params = {
      month: currentStore.saleMonth,
      date: currentStore.saleDate,
      areaName: areaList.value,
      regionid: [],
      regionName: regionList.value,
      cardModel: cardTypeList.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      sortField: currentSort.value.prop,
      order: currentSort.value.order ===
        'descending' ? 2 : 1,
    }
    xpuTable.value = [];
    tableSummary.xpu = {};
    permissionTable.xpu = true;

    getSalesTableByXpuAPI(params)
      .then((res) => {
        if (res.status === 403) {
          permissionTable.xpu =
            false;
          return;
        }
        if (res.status === 200) {
          xpuTable.value =
            res.data?.pagelnfo?.records ?? [];
          pagelnfo.value.total = res.data?.pagelnfo?.totalINum ?? 0;
          tableSummary.xpu = res.data?.summaryVo ?? {};
        }
      })
      .catch(() =>
        (pagelnfo.value.total = 0));
  }, 100);

  watch(
    [() => currentStore.saleDate,
      filterValue],
    ([]) => {
      loadCardData();
    },
    {
      immediate: true,
    }
  );
  watch(
    [() => currentStore.saleDate,
      filterValue, filterOtherValue,
      active],
    ([]) => {
      if (active.value !== 'XPU') {
        return;
      }
      loadInfoData();
    },
    {
      immediate: true,
    }
  );
  watch([() =>
    currentStore.saleDate,
    filterValue, filterOtherValue,
    active, pageNo, pageSize,
    currentSort], ([]) => {
      if (active.value !== 'XPU') {
        return;
      }
      loadTableData();
    });
};