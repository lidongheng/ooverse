/**
 * 盈亏分析 API
 * 返回格式：{ status: 200, message: "SUCCESS", data: [{ month: "202601", value: number }] }
 * 替换下方 mock 实现为真实 axios 请求即可
 */

/** 流水 */
export function fetchRevenue() {
  // return axios.get('/api/pl-analysis/revenue');
  return mockApi("revenue");
}

/** 成本 */
export function fetchCost() {
  // return axios.get('/api/pl-analysis/cost');
  return mockApi("cost");
}

/** 销毛率 */
export function fetchGrossProfitRate() {
  // return axios.get('/api/pl-analysis/gross-profit-rate');
  return mockApi("grossProfitRate");
}

/** CPU使用率 */
export function fetchCpuUsage() {
  // return axios.get('/api/pl-analysis/cpu-usage');
  return mockApi("cpuUsage");
}

/**
 * 模拟请求（替换为真实 API 后可删除）
 * 数据来源：原 P&LAnalysis.vue 页面写死的静态数据
 */
const MOCK_MONTHS = ["202508", "202509", "202510", "202511", "202512", "202601"];

function mockApi(type) {
  const seeds = {
    revenue: [32, 19, 16, 18, 15, 16],
    cost: [11, 9, 26, 38, 5, 6],
    grossProfitRate: [88, 78, 87, 78, 77, 88],
    cpuUsage: [11, 12, 13, 9, 12, 13],
  };
  const arr = seeds[type] ?? seeds.revenue;
  const data = MOCK_MONTHS.map((month, i) => ({
    month,
    value: type === "revenue" || type === "cost" ? (arr[i] ?? 0) * 1e8 : (arr[i] ?? 0),
  }));
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 200, message: "SUCCESS", data }), 200);
  });
}
