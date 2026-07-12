import { applyBubbleConfig, SUPER_NODE_SIZE_TIERS } from "./commonComputerPowerConfig";

// TODO: 替换为真实接口
export function mockFetchEfficiency2(params = {}) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          status: 200,
          message: "SUCCESS",
          data: {
            quadrantVo: {
              avgNpuUseRate: 0.5,
              avgRangeList: [
                { name: "0-100", val: 0.6499, num: "323" },
                { name: "100-200", val: 0.5201, num: "158" },
                { name: "200-300", val: 0.4388, num: "76" },
                { name: ">300", val: 0.7102, num: "42" },
              ],
              list: [
                { azName: "华东-上海二(AZ1)", npuCardUseRate: 0.68, ascendCardNum: 80, npuUseRate: 0.72 },
                { azName: "华东-北京四(AZ1)", npuCardUseRate: 0.51, ascendCardNum: 350, npuUseRate: 0.55 },
                { azName: "华北-北京一(AZ1)", npuCardUseRate: 0.39, ascendCardNum: 150, npuUseRate: 0.43 },
                { azName: "华东-上海一(AZ2)", npuCardUseRate: 0.82, ascendCardNum: 60, npuUseRate: 0.88 },
                { azName: "华南-深圳一(AZ1)", npuCardUseRate: 0.27, ascendCardNum: 220, npuUseRate: 0.31 },
                { azName: "华北-北京一(AZ2)", npuCardUseRate: 0.60, ascendCardNum: 280, npuUseRate: 0.65 },
              ],
            },
          },
        }),
      250
    );
  });
}

/**
 * 将 efficiency2 接口的 quadrantVo.list 转换为气泡图数据
 */
export function toSuperNodeChartData(list) {
  const toPercent = (v) => (v != null ? Number(v) * 100 : null);
  const baseList = list.map((item) => ({
    name: item.azName,
    azName: item.azName,
    x: toPercent(item.npuUseRate),
    y: toPercent(item.npuCardUseRate),
    serverNum: Number(item.ascendCardNum) || 0,
    _npuUseRate: toPercent(item.npuUseRate),
    _npuCardTimeUseRate: toPercent(item.npuCardUseRate),
  }));
  return baseList.map((item) => applyBubbleConfig(item, SUPER_NODE_SIZE_TIERS));
}
