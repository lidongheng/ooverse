import { computed } from 'vue';
import { keyInfor, permissionTable } from './useResourceData.js';
import { formatNumToLocalString, formatterValue } from '@/utils';
import { commonChartOptions } from '@/views/hooks/useIndicators';
import { changeValueByScale } from '@/composables/autoLayout';

const resourceConfig = {
  obs: {
    listKey: 'topTenList',
    totalKey: 'totalSellableCapacity',
    unit: 'PB',
    legends: [
      {
        name: '单 AZ',
        key: 'azTotalSellableCapacity',
        color: 'rgba(137, 135, 203, 1)',
        stack: 'az',
        type: 'bar',
        gap: 1024,
        fixed: 2,
      },
      {
        name: '三 AZ',
        key: 'threeAzTotalSellableCapacity',
        color: 'rgba(179, 213, 255, 1)',
        stack: 'az',
        type: 'bar',
        gap: 1024,
        fixed: 2,
      },
    ],
  },
  xpu: {
    listKey: 'topList',
    totalKey: 'totalUnallocatedXpu',
    unit: '卡',
    legends: [
      {
        name: 'A3',
        key: 'a3Unallocated',
        color: 'rgba(137, 135, 203, 1)',
        stack: 'xpu',
        type: 'bar',
        fixed: 0,
      },
      {
        name: 'A2',
        key: 'a2Unallocated',
        color: 'rgba(179, 213, 255, 1)',
        stack: 'xpu',
        type: 'bar',
        fixed: 0,
      },
    ],
  },
};

export const useRegionTopTrend = (props) => {
  const config = computed(() => resourceConfig[props.resourceType]);
  const hasPermission = computed(() => permissionTable[props.resourceType]);

  const y2Axis = computed(() => {
    return props.hasY2
      ? [
          {
            type: 'value',
            name: '',
            show: false,
            axisLabel: {
              fontSize: changeValueByScale(14),
              fontWeight: changeValueByScale(400),
            },
            splitLine: {
              show: false, // 右侧 Y 轴不显示分割线
            },
          },
        ]
      : [];
  });

  const monthOptions = computed(() => {
    // OBS 与 XPU 只在这里根据接口字段配置取数，图表展示逻辑保持一致。
    const currentConfig = config.value;
    const trendData = (keyInfor[props.resourceType][currentConfig.listKey] ?? []).sort(
      (a, b) => Number(b[currentConfig.totalKey]) - Number(a[currentConfig.totalKey]),
    );
    const xData = trendData.map((item) => item.regionName);
    const maxTotal = Math.max(
      ...trendData.map(
        (item) =>
          Number(
            formatterValue(
              item[currentConfig.totalKey],
              currentConfig.legends[0].gap,
              currentConfig.legends[0].fixed,
            ),
          ) || 0,
      ),
      0,
    );
    const minLabelValue = maxTotal * 0.1;

    return {
      ...commonChartOptions(),
      grid: {
        left: changeValueByScale(40),
        bottom: changeValueByScale(40),
        right: changeValueByScale(20),
        top: changeValueByScale(40),
      },
      tooltip: {
        trigger: 'axis',
        formatter(params) {
          const name = params?.[0].name;
          const regionItem = trendData.find((item) => item.regionName === name);
          const tooltipContent = params
            .map((param) => {
              const { seriesName, seriesType, value = null, color } = param;
              const val = value ?? '--';
              const colorBox =
                seriesType === 'line'
                  ? `<div class="tooltip-icon-circle" style="display:inline-block; width:${changeValueByScale(8)}px; height:${changeValueByScale(8)}px; background-color:#fff; margin-right:${changeValueByScale(6)}px; border-radius: 50%;border:${changeValueByScale(3)}px solid ${color};line-height:${changeValueByScale(21)}px"></div>`
                  : `<div style="display:inline-block; width:${changeValueByScale(12)}px; height:${changeValueByScale(12)}px; background-color:${color}; margin-right:${changeValueByScale(4)}px; border-radius: ${changeValueByScale(2)}px; line-height:${changeValueByScale(21)}px"></div>`;

              return `${colorBox}
                <span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;">${seriesName} : </span><span style="font-weight: bold;font-size:${changeValueByScale(16)}px;">${formatNumToLocalString(val)}</span><span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;"> ${currentConfig.unit}</span>
              `;
            })
            .join('</br>');
          const colorBox = `<div class="tooltip-icon-circle" style="display:inline-block; width:${changeValueByScale(12)}px; height:${changeValueByScale(12)}px; background-color:#fff; margin-right:${changeValueByScale(10)}px; border-radius: 50%;border:${changeValueByScale(3)}px solid #fff;line-height:${changeValueByScale(21)}px"></div>`;
          const totalValue = formatterValue(
            regionItem?.[currentConfig.totalKey],
            currentConfig.legends[0].gap,
            currentConfig.legends[0].fixed,
          );
          const htmlTotal = `${colorBox}<span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;">总共 : </span><span style="font-weight: bold;font-size:${changeValueByScale(16)}px;">${formatNumToLocalString(totalValue)}</span><span class="tooltip-label" style="font-size: ${changeValueByScale(16)}px;"> ${currentConfig.unit}</span>`;

          return `<div class="tooltip-container"><span style="font-weight: bold;font-size: ${changeValueByScale(14)}px; color: #252B3A;">${name}</span><br/>${htmlTotal}<br/>${tooltipContent}</div>`;
        },
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisTick: { show: false },
        boundaryGap: true,
        axisLine: {
          linestyle: {
            color: 'rgba(158, 158, 208, 0.2)',
          },
        },
        axisLabel: {
          interval: 0,
          fontSize: changeValueByScale(14),
          fontWeight: changeValueByScale(400),
          formatter(value) {
            if (value && value.length > 10) {
              return `${value.substr(0, 10)}...`;
            }
            return value;
          },
        },
      },
      legend: {
        data: currentConfig.legends.map((item) => item.name),
        right: changeValueByScale(20),
        top: changeValueByScale(0),
        itemWidth: changeValueByScale(12),
        itemHeight: changeValueByScale(12),
        textStyle: {
          fontFamily: 'Microsoft YaHei',
          fontWeight: changeValueByScale(400),
          fontSize: changeValueByScale(14),
          color: 'rgba(37, 43, 58, 1)',
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            show: true,
            fontSize: changeValueByScale(14),
            fontWeight: changeValueByScale(400),
          },
          axisTick: {
            show: false,
          },
          name: currentConfig.unit,
          splitLine: {
            show: true,
            lineStyle: {
              width: changeValueByScale(1),
              type: 'dashed',
              color: 'rgba(158, 158, 208, 0.2)',
            },
          },
        },
        ...y2Axis.value,
      ],
      series: currentConfig.legends.map((legend, index) => {
        return {
          name: legend.name,
          type: legend.type,
          stack: legend.stack,
          data: trendData.map((item) =>
            formatterValue(item[legend.key], legend.gap, legend.fixed),
          ),
          label: {
            show: true,
            color: '#fff',
            fontSize: 10,
            formatter: (params) => {
              return params.value >= minLabelValue ? params.value : '';
            },
          },
          labelLayout: {
            hideOverlap: true,
          },
          itemStyle: {
            color: legend.color,
            borderWidth: 0,
            borderRadius:
              index === 0
                ? [0, 0, 0, 0]
                : [changeValueByScale(4), changeValueByScale(4), 0, 0],
          },
          lineStyle: {
            width: 2,
            color: legend.color,
          },
          barWidth: `${changeValueByScale(50)}px`,
          silent: true,
        };
      }),
    };
  });

  return {
    hasPermission,
    monthOptions,
  };
};
