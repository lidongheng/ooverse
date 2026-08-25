import { formatNumToLocalStringAndFiexd, formatterValue, toPb, toWan } from '@/utils';
import { useRouter } from 'vue-router';
import { useSaleFilterStore } from '../saleHome/useSaleFilter.js';

export const indicators = [
  {
    label: 'ECS可售量',
    unit: '万核',
    format: toWan,
    key: 'ecsAvailableVolume',
    permissionKey: 'ecsPermission',
  },
  {
    label: 'OBS可售量',
    unit: 'PB',
    format: toPb,
    key: 'obsAvailableVolume',
    permissionKey: 'obsPermission',
  },
  {
    label: 'XPU待分配量',
    unit: '卡',
    format: (val) => formatNumToLocalStringAndFiexd(val, 0),
    key: 'xpuAvailableVolume',
    permissionKey: 'xpuPermission',
  },
  {
    label: '网络可用带宽',
    unit: 'Gb',
    format: formatterValue,
    key: 'networkAvailableVolume',
    permissionKey: 'networkPermission',
  },
];

export function enrichSaleRegionWithCoords(item) {
  return { ...item, lng: Number(item.longitude), lat: Number(item.latitude), name: item.area };
}

export const useSaleMapNavigation = () => {
  const router = useRouter();
  const saleFilterStore = useSaleFilterStore();

  const jumpToEcsDetailByArea = async (areaName) => {
    await saleFilterStore.selectAreaWithChildren(areaName);
    await router.push({
      path: '/saleDetail',
      query: {
        type: 'ECS'
      }
    });
  };

  return {
    jumpToEcsDetailByArea
  };
};
