import { ref } from 'vue';
import { cloneDeep } from '@/utils';

export const legend = {
  orient: 'horizontal',
  right: 10,
  top: 10,
  textStyle: {
    fontFamily: 'Microsoft YaHei',
    fontWeight: 400,
    fontSize: 16,
    color: 'rgba(37, 43, 58, 1)',
  },
  itemWidth: 8,
  itemHeight: 8,
  itemGap: 12,
};

export const customTooltipConfig = {
  trigger: 'axis',
  backgroundColor: 'rgba(218, 229, 255, 0.9)',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 4,
  textStyle: {
    color: 'rgba(113, 113, 168, 1)',
  },
  formatter: function (params) {
    let result = '<div class="tooltip-container">';
    params.forEach(param => {
      const iconColor = param.color;
      const name = param.seriesName;
      const value = param.value;
      const isPercentage = name.includes('率') && param.seriesIndex === 2;
      const unit = isPercentage ? '%' : '亿元';

      result += `<div class="tooltip-item">
        <div class="tooltip-icon" style="background-color: ${iconColor};"></div>
        <div class="tooltip-label">${name}：</div>
        <div class="tooltip-value">${value}</div>
        <div class="tooltip-label">${unit}</div>
      </div>`;
    });
    result += '</div>';
    return result;
  },
  confine: true,
};

export const optionBar = {
  grid: {
    left: 30,
    right: 10,
    top: 60,
    bottom: 30,
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    axisTick: {
      show: false,
    },
    axisLabel: {
      rotate: 0,
      interval: 0,
      color: 'rgba(158, 158, 208, 1)',
      fontSize: 16,
    },
    axisLine: {
      lineStyle: {
        type: 'category',
        color: 'rgba(158, 158, 208, 0.2)',
        width: 1,
      },
    },
    data: [],
  },
  tooltip: customTooltipConfig,
  yAxis: {
    name: '亿元',
    type: 'value',
    min: 0,
    axisLabel: {
      color: 'rgba(158, 158, 208, 1)',
      fontSize: 16,
    },
    nameTextStyle: {
      color: 'rgba(158, 158, 208, 1)',
      fontSize: 14,
      align: 'left',
      padding: [0, 0, 10, -30],
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: 'rgba(158, 158, 208, 0.2)',
      }
    },
  },
  series: [
    {
      name: '成本',
      data: [],
      type: 'bar',
      smooth: true,
      label: {
        show: false,
        position: 'top',
        fontSize: 16,
        color: 'rgb(98, 98, 168)',
      },
      itemStyle: {
        color: 'rgb(98, 98, 168)',
        borderRadius: [8,8,0,0],
      },
      barWidth: '16px',
      tooltip: {
        valueFormatter: (params) => {
          return `${params}亿元`;
        },
      }
    }
  ],
};

export const setOption = ({
  yDataList = [],
  xAxisData = [],
  legendVal = {},
  grid = {},
  hasPercentageData = false,
}) => {
  let optionData = cloneDeep(optionBar);

  let seriesItem = optionData.series[0];
  optionData.grid = { ...optionData.grid, ...grid };
  optionData.legend = { ...legend, ...legendVal };

  optionData.xAxis.data = xAxisData;

  yDataList.forEach((item, index) => {
    if (!optionData.series[index]) {
      optionData.series[index] = cloneDeep(seriesItem);
    }
    
    let itemData = {
      name: item.name,
      data: item.data,
      type: item.chartType || 'line',
      itemStyle: {
        color: item.color,
        borderRadius: [8,8,0,0],
      },
    };
    if (item.gradientColor) {
      itemData.areaStyle = {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: item.gradientColor[0],
            },
            {
              offset: 1,
              color: item.gradientColor[1],
            },
          ]
        }
      }
    }
    if (hasPercentageData) {
      itemData.yAxisIndex = item.name.includes('率') ? 1 : 0;
    }
    optionData.series[index] = { ...optionData.series[index], ...itemData };
  });
  const percentageData = {
    name: '',
    type: 'value',
    min: 0,
    max: 100,
    position: 'right',
    axisLabel: {
      color: 'rgba(158, 158, 208, 1)',
      fontSize: 18,
      formatter: function (value) {
        return `${value}%`;
      }
    },
    nameTextStyle: {
      color: 'rgba(158, 158, 208, 1)',
      fontSize: 18,
      padding: [0, 0, 10, 30],
    },
    splitLine: {
      show: false,
    }
  };
  if (hasPercentageData) {
    optionData.yAxis = [optionData.yAxis, percentageData];
  }
  optionData.tooltip = cloneDeep(customTooltipConfig);
  return optionData;
};
