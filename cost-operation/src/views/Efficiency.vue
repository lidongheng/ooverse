<template>
  <div class="wrap">
    <div ref="el" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const el = ref(null);
let chart = null;

// 示例数据：x=进攻效率(相对联盟平均，可正可负)，y=防守效率(相对平均，可正可负)
// 你也可以用“越大越好”的指标，只要统一解释即可。
// logo: 建议放 public/logos 下
const teams = [
  { name: "Knicks", x: 7.2, y: 6.5, logo: "/logos/knicks.png" },
  { name: "Celtics", x: 4.8, y: 3.2, logo: "/logos/celtics.png" },
  { name: "Lakers", x: 2.1, y: 0.8, logo: "/logos/lakers.png" },
  { name: "Bulls", x: -2.5, y: -3.8, logo: "/logos/bulls.png" },
];

function buildOption() {
  const data = teams.map(t => ({
    name: t.name,
    value: [t.x, t.y],
    symbol: `image://${t.logo}`,
    symbolSize: 34, // logo 大小
    label: {
      show: false, // 想显示队名可开
      formatter: "{b}",
      position: "right"
    }
  }));

  return {
    grid: { left: 60, right: 40, top: 40, bottom: 60 },

    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const [x, y] = p.value || [];
        return `
          <div><b>${p.name}</b></div>
          <div>Offense: ${x}</div>
          <div>Defense: ${y}</div>
        `;
      }
    },

    xAxis: {
      name: "Offensive Efficiency",
      nameLocation: "middle",
      nameGap: 35,
      min: -10,
      max: 10,
      splitLine: { show: true },
      axisLine: { onZero: true }, // 让轴在 y=0 处
      axisTick: { show: false }
    },

    yAxis: {
      name: "Defensive Efficiency",
      nameLocation: "middle",
      nameGap: 45,
      min: -10,
      max: 10,
      splitLine: { show: true },
      axisLine: { onZero: true }, // 让轴在 x=0 处
      axisTick: { show: false }
    },

    series: [
      {
        type: "scatter",
        data,
        // 两条象限分割线
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { width: 1, type: "solid", opacity: 0.6 },
          data: [
            { xAxis: 0 }, // 垂直线 x=0
            { yAxis: 0 }  // 水平线 y=0
          ]
        }
      }
    ],

    // 象限文字（可选）
    graphic: [
      {
        type: "text",
        left: 80,
        top: 60,
        style: { text: "Quadrant I\n(Off +, Def +)", fontSize: 12, opacity: 0.6 }
      },
      {
        type: "text",
        right: 80,
        top: 60,
        style: { text: "Quadrant II\n(Off -, Def +)", fontSize: 12, opacity: 0.6, align: "right" }
      },
      {
        type: "text",
        left: 80,
        bottom: 80,
        style: { text: "Quadrant III\n(Off +, Def -)", fontSize: 12, opacity: 0.6 }
      },
      {
        type: "text",
        right: 80,
        bottom: 80,
        style: { text: "Quadrant IV\n(Off -, Def -)", fontSize: 12, opacity: 0.6, align: "right" }
      }
    ]
  };
}

function resize() {
  chart && chart.resize();
}

onMounted(() => {
  chart = echarts.init(el.value);
  chart.setOption(buildOption());
  window.addEventListener("resize", resize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  chart && chart.dispose();
  chart = null;
});
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}
.chart {
  width: 100%;
  height: 680px;
}
</style>
