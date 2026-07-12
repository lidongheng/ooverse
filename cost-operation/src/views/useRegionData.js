import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { REGION_COORDS } from "@/config/regionCoords";
import { useCurrentDate } from "./useCurrentDate";

const isIframeCreated = ref(true);

const LEAGUE_CLUB_LIST = [
  { name: "英国-英超-曼城", rate: 0.1644, lng: -2.2426, lat: 53.4808 },
  { name: "英国-英超-阿森纳", rate: 0.1189, lng: -0.1022, lat: 51.5549 },
  { name: "英国-英超-利物浦", rate: 0.1522, lng: -2.9608, lat: 53.4308 },
  { name: "西班牙-西甲-皇家马德里", rate: 0.1899, lng: -3.6883, lat: 40.4531 },
  { name: "西班牙-西甲-巴塞罗那", rate: 0.1318, lng: 2.1228, lat: 41.3809 },
  { name: "西班牙-西甲-马德里竞技", rate: 0.0782, lng: -3.5994, lat: 40.4362 },
  { name: "意大利-意甲-国际米兰", rate: 0.1211, lng: 9.124, lat: 45.4781 },
  { name: "意大利-意甲-尤文图斯", rate: 0.0966, lng: 7.6413, lat: 45.1096 },
  { name: "意大利-意甲-AC米兰", rate: 0.0872, lng: 9.122, lat: 45.478 },
  { name: "德国-德甲-拜仁慕尼黑", rate: 0.1533, lng: 11.6247, lat: 48.2188 },
  { name: "德国-德甲-多特蒙德", rate: 0.0633, lng: 7.4518, lat: 51.4926 },
  { name: "德国-德甲-勒沃库森", rate: 0.1455, lng: 6.9816, lat: 51.0383 },
  { name: "法国-法甲-巴黎圣日耳曼", rate: 0.1829, lng: 2.2522, lat: 48.8414 },
  { name: "法国-法甲-马赛", rate: 0.0422, lng: 5.3959, lat: 43.2699 },
  { name: "法国-法甲-里昂", rate: 0.0688, lng: 4.9828, lat: 45.7653 },
  { name: "葡萄牙-葡超-本菲卡", rate: -0.0088, lng: -9.1847, lat: 38.7527 },
  { name: "荷兰-荷甲-阿贾克斯", rate: 0.0615, lng: 4.9413, lat: 52.3142 },
  { name: "土耳其-土超-加拉塔萨雷", rate: -0.0211, lng: 28.9917, lat: 41.1036 },
  { name: "巴西-巴甲-弗拉门戈", rate: 0.1055, lng: -43.2302, lat: -22.9122 },
  { name: "阿根廷-阿甲-博卡青年", rate: -0.0355, lng: -58.3647, lat: -34.6356 },
];

/**
 * 根据 name 前缀匹配，补充 lng、lat；无匹配则返回 null（用于过滤）
 * @param {{ name: string, rate: number }} item 后端返回的项（仅 name、rate）
 * @returns {{ name: string, rate: number, lng: number, lat: number } | null}
 */
export function enrichRegionWithCoords(item) {
  // 五大联赛资料这类数据直接携带坐标时，优先使用数据自身坐标。
  if (Number.isFinite(item.lng) && Number.isFinite(item.lat)) {
    return item;
  }
  const name = item.name || "";
  for (const [prefix, [lng, lat]] of REGION_COORDS) {
    if (name.startsWith(prefix)) {
      return { ...item, lng, lat };
    }
  }
  return null;
}

/**
 * Region 数据 composable：从后端获取 regionData、profitCount、lossCount
 */
/**
 * 模拟 operate 接口（有白名单权限控制）
 * 有权限时返回 { status: 200, data: { list }, message: "SUCCESS" }
 * 无权限时返回 { status: 403, data: null, message: "没有相关权限" }
 */
async function mockFetchOperate() {
  await new Promise((r) => setTimeout(r, 300));
  // 取消下行注释可模拟无权限
  // return { status: 403, data: null, message: "没有相关权限" };
  return {
    status: 200,
    message: "SUCCESS",
    data: {
      list: LEAGUE_CLUB_LIST,
    },
  };
}

/**
 * 模拟 efficiency 接口（无权限控制，rate 全为 null）
 */
async function mockFetchEfficiency() {
  await new Promise((r) => setTimeout(r, 200));
  return {
    status: 200,
    message: "SUCCESS",
    data: {
      list: LEAGUE_CLUB_LIST.map(item => ({ ...item, rate: null })),
    },
  };
}

export function useRegionData() {
  const regionData = ref([]);
  const profitCount = ref(0);
  const lossCount = ref(0);
  const error = ref(null);
  /** operate 接口返回 403 时为 true，rate 显示为 "**" */
  const forbidden = ref(false);
  const rates = computed(() => regionData.value.map((r) => r.rate));

  async function fetchRegionStats(month) {
    error.value = null;
    forbidden.value = false;
    try {
      // TODO: 替换为真实接口，如 axios.get('/api/xxx/operate', { params: { month } })
      let res = await mockFetchOperate();

      if (res.status === 403) {
        forbidden.value = true;
        // TODO: 替换为真实接口，如 axios.get('/api/xxx/efficiency')
        res = await mockFetchEfficiency();
      }

      const rawList = res.data?.list ?? [];
      const matched = rawList.map(enrichRegionWithCoords).filter(Boolean);
      regionData.value = matched.map((r) => ({
        ...r,
        rate: r.rate != null ? Number((r.rate * 100).toFixed(2)) : null,
      }));
      profitCount.value = regionData.value.filter((r) => r.rate != null && r.rate >= 0).length;
      lossCount.value = regionData.value.filter((r) => r.rate != null && r.rate < 0).length;
      return { regionData: regionData.value, profitCount: profitCount.value, lossCount: lossCount.value };
    } catch (e) {
      error.value = e;
      regionData.value = [];
      profitCount.value = 0;
      lossCount.value = 0;
      return { regionData: [], profitCount: 0, lossCount: 0 };
    }
  }

  // isIframeCreated 或 月份 变化时自动重新请求
  const { date: currentMonth } = storeToRefs(useCurrentDate());
  watch(
    [isIframeCreated, currentMonth],
    ([iframeReady, month]) => {
      if (iframeReady) fetchRegionStats(month);
    },
    { immediate: true }
  );

  return {
    regionData,
    profitCount,
    lossCount,
    error,
    forbidden,
    rates,
    fetchRegionStats,
  };
}
