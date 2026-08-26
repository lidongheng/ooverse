import { getCardModelAPI, getFlavorVcpuTypeAPI, getRegionTreeAPI } from '@/api/sale';
import { defineStore, storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';

const changeRes = (regionTree) => {
  // 后端三层区域协议依次映射为区域、大区和 Region。
  return regionTree.map((area) => ({
    label: area.areaName,
    value: area.areaName,
    children: area.regionTreeItem.map((district) => ({
      label: district.areaName,
      value: district.areaName,
      children: district.regionTreeItem.map((region) => ({
        label: region.regionName,
        value: region.regionName
      }))
    }))
  }))
}

export const useSaleFilterStore = defineStore('saleFilter', () => {
  // 公共 Region 与详情专属筛选统一由 Pinia 管理，避免热更新后状态实例分离。
  const filterValue = ref({});
  const filterOtherValue = ref({});
  const filterConfig = [
    {
      key: 'area',
      type: 'areaCascade',
      optionKey: 'regionAreaTree',
      areaValueKey: 'insideOutside',
      districtValueKey: 'areaName',
      regionValueKey: 'regionName',
      icon: 'location',
      label: 'Region',
      hideLabel: true,
      columns: [
        { title: '区域' },
        { title: '大区' },
        { title: 'Region' }
      ],
    },
  ];
  const filterLoading = ref(false);
  let regionTreePromise = null;

  const filterOptions = reactive({
    regionNameList: [],
    azNameList: [],
    cardModelTree: [],
    regionAreaTree: [],
    resourceGenerationTree: []
  });

  const loadRegionTreeData = () => {
    filterLoading.value = true;
    const params = {
      regionId: [],
      regionName: [],
      areaName: []
    };
    regionTreePromise = getRegionTreeAPI(params).then((res) => {
      if (res.status === 403) {
        return;
      }
      const regionAreaTree = changeRes(res.data);
      filterOptions.regionAreaTree = regionAreaTree;
      setDefaultFilterValues();
    });
    return regionTreePromise;
  };

  // 设置默认勾选所有
  const setDefaultFilterValues = () => {
    const insideOutside = [];
    const areaName = [];
    const regionName = [];

    filterOptions.regionAreaTree.forEach((area) => {
      insideOutside.push(area.value);
      area.children?.forEach((district) => {
        areaName.push(district.value);
        district.children?.forEach((region) => {
          regionName.push(region.value);
        });
      });
    });

    filterValue.value = {
      ...filterValue.value,
      insideOutside,
      areaName,
      regionName
    };

    filterLoading.value = false;
  };

  const selectAreaWithChildren = async (areaName) => {
    if (regionTreePromise) {
      await regionTreePromise;
    }

    const area = filterOptions.regionAreaTree.find((item) => {
      return item.children?.some((district) => district.value === areaName);
    });
    const district = area?.children?.find((item) => item.value === areaName);
    if (!area || !district) {
      return false;
    }

    filterValue.value = {
      ...filterValue.value,
      insideOutside: [area.value],
      areaName: [district.value],
      regionName: district.children.map((region) => region.value)
    };
    return true;
  };

  loadRegionTreeData();

  return {
    filterValue,
    filterOtherValue,
    filterConfig,
    filterOptions,
    loadRegionTreeData,
    setDefaultFilterValues,
    selectAreaWithChildren,
    filterLoading
  };
});

export const useSaleDetailStore = (active) => {
  const saleFilterStore = useSaleFilterStore();
  const { filterConfig: regionFilterConfig, filterOptions } = saleFilterStore;
  const { filterOtherValue } = storeToRefs(saleFilterStore);

  const ecsFilterConfig = [
    {
      key: 'resourceSpec',
      label: '资源规格',
      type: 'list',
      optionKey: 'resourceSpecList',
      valueKey: 'resourceType',
      multiple: false,
    },
    {
      key: 'resourceGeneration',
      label: '资源代次',
      type: 'cascade',
      optionKey: 'resourceGenerationTree',
      parentValueKey: 'resourceFamily',
      valueKey: 'resourceGeneration',
      outputKey: 'generationDirTreeList',
      outputFields: {
        parent: 'family',
        value: 'generation',
      },
      searchable: false,
      confirmable: true,
      columns: [{ title: '资源族' }, { title: '资源代次' }],
    },
  ];
  const obsFilterConfig = [];
  const xpuFilterConfig = [
    {
      key: 'cardModel',
      label: '卡类型',
      type: 'list',
      optionKey: 'cardModelTree',
      optionKey: 'cardModelTree',
      valueKey: 'cardTypeList',
    },
  ];

  const filterConfig = computed(() => {
    switch (active.value) {
      case 'ECS':
        return ecsFilterConfig;
      case 'OBS':
        return obsFilterConfig;
      case 'XPU':
        return xpuFilterConfig;
      default:
        return [];
    }
  });
  
  const loadFlavorVcpuTypeData = () => {
    const params = {
      regionId: [],
      regionName: [],
      areaName: [],
    };
  
    filterOtherValue.value = {
      ...filterOtherValue.value,
      resourceType: ['32U'],
    };
  
    getFlavorVcpuTypeAPI(params).then((res) => {
      const { flavorVcpuTypeList, flavorGenerationItem } = res.data ?? {};
      filterOptions.resourceSpecList = flavorVcpuTypeList?.map((v) => ({
        label: v.flavorVcpuType,
        value: v.flavorVcpuType,
      }));
      filterOptions.resourceGenerationTree = flavorGenerationItem?.map((v) => ({
        label: v.flavorFamily,
        value: v.flavorFamily,
        children: v.item?.map((c) => ({
          label: c.flavorGeneration,
          value: c.flavorGeneration,
        })),
      }));
    });
  };

  loadFlavorVcpuTypeData();

  const loadXpuCardModelData = () => {
    const params = {
      regionId: [],
      regionName: [],
      areaName: []
    };

    getCardModelAPI(params).then((res) => {
      filterOptions.cardModelTree = res.data?.map((v) => ({
        label: v.cardModel,
        value: v.cardModel
      }));
    });
  };

  loadXpuCardModelData();

  return {
    filterConfig,
    filterOptions
  };
};
