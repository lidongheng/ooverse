<template>
  <div ref="chartContainer" class="chart-dom" :style="containerStyle"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { changeValueByScale } from '@/composables/autoLayout';

const props = defineProps({
  // 图表配置选项
  options: {
    type: Object,
    required: true,
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true,
  },
  // 固定高度
  fixHeight: {
    type: Number,
    default: null,
  },
  // 自定义样式
  style: {
    type: Object,
    default: () => ({}),
  },
  // 图表主题
  theme: {
    type: String,
    default: '',
  },
  // 是否延迟自动化
  lazyInit: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['chartReady', 'chartUpdaed', 'chartError']);

const chartContainer = ref(null);
let myChart = null;
let isInitialized = false;

// 计算容器样式
const containerStyle = computed(() => {
  const styleValue = {
    ...props.style,
    width: `${changeValueByScale(props.style.width || 160)}px`,
    height: `${changeValueByScale(props.style.height || 160)}px`,
  };
  return styleValue;
})

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || isInitialized) return;

  try {
    myChart = echarts.init(chartContainer.value, props.theme, {
      renderer: 'svg',
    });
    isInitialized = true;

    // 设置初始配置
    if (props.options) {
      myChart.setOption(props.options, true);
    }

    // 触发图表就绪事件
    emit('chartReady', myChart);

    // 如果需要自动调整大小
    if (props.autoResize) {
      window.addEventListener('resize', resize);
    }
  } catch (error) {
    console.error('图表初始化失败:', error);
    emit('chartError', error);
  }
};

// 更新图表配置
const updateChart = (newOptions) => {
  if (!myChart) return;

  try {
    myChart.setOption(newOptions, true);
    emit('chartUpdated', myChart);
  } catch (error) {
    console.error('图表更新失败:', error);
    emit('chartError', error);
  }
};

// 手动调整大小
const resize = () => {
  if (myChart) {
    myChart.resize(containerStyle.value);
  }
};

// 清理图表
const dispose = () => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
    isInitialized = false;
    window.removeEventListener('resize', resize);
  }
};

// 获取图表实例
const getInstance = () => {
  return myChart;
};

// 监听 options 变化
watch(
  () => props.options,
  (newOptions) => {
    if (isInitialized && newOptions) {
      updateChart(newOptions);
    }
  },
  { deep: true }
);

// 组件挂载时初始化
onMounted(() => {
  if (!props.lazyInit) {
    initChart();
  }
});

// 组件卸载时清理
onUnmounted(() => {
  dispose();
});

// 暴露方法给父组件
defineExpose({
  initChart,
  updateChart,
  resize,
  dispose,
  getInstance,
});
</script>

<style lang="less" scoped>
.chart-dom {
  width: 100%;
  height: 100%;
}
</style>
