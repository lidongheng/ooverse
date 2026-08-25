import { getSaleHomeDataAPI } from '@/api/sale';
import { useCurrentDate } from '@/views/useCurrentDate';
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSaleFilterStore } from './useSaleFilter';
import { saleAgentIntellUrl, saleAgentUrl } from './useAIPage';

// 销售概览筛选连续变化时，只执行最后一次数据加载。
const debounce = (fn, delay) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const homeData = ref({
  overviewIndicator: {},
  ecsIndicator: {},
  obsIndicator: {},
  xpuIndicator: {},
  networkIndicator: {},
  regionalAvailableVolumeList: [],
  ecsPermission: false,
  networkPermission: false,
  obsPermission: false,
  xpuPermission: false,
  areaPermission: [], // 大区权限
});

export const regionData = ref([]);

export const useSaleHomeData = () => {
  const currentStore = useCurrentDate();
  const { filterValue } = storeToRefs(useSaleFilterStore());
  const loadData = debounce(() => {
    const params = {
      date: currentStore.saleDate,
      areaName: filterValue.value.areaName ?? [],
      regionName: filterValue.value.regionName ?? [],
    };
    getSaleHomeDataAPI(params).then((res) => {
      if (res.status === 403) {
        homeData.value.ecsPermission = true;
        homeData.value.networkPermission = true;
        homeData.value.obsPermission = true;
        homeData.value.xpuPermission = true;
        return;
      }
      if (res.status === 200) {
        homeData.value = res.data;
        saleAgentUrl.value = res.data.agentFrontSalesUrl ?? '';
        saleAgentIntellUrl.value = res.data.agentFrontSalesIntellUrl ?? '';
      }
    });
  }, 300);

  watch([() => currentStore.saleDate, filterValue], loadData, { deep: true, immediate: true });

  return {
    homeData,
    loadData,
  };
};
