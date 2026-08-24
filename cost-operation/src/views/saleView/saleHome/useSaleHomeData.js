import { getSaleHomeDataAPI } from '@/api/sale';
import { useCurrentStore } from '@/views/costOperation/hooks/useCurrentDate';
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSaleFilterStore } from './useSaleFilter';
import { saleAgentIntellUrl, saleAgentUrl } from '@/views/costOperation/hooks/useAIPage';
import { debounce } from '@/shared/utils/utils.js';

const { filterValue } = storeToRefs(useSaleFilterStore());
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
  const currentStore = useCurrentStore();
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
        saleAgentUrl.value = res.data.agentFrontSalesUrl ?? "";
        saleAgentIntellUrl.value = res.data.agentFrontSalesIntellUrl ?? "";
      }
    });
  }, 300);

  watch([() => currentStore.saleDate, filterValue], loadData, { deep: true, immediate: true });

  return {
    loadData,
  };
};
