import type { EChartsOption } from 'echarts';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export function adaptVisualizationForUser(
  chartConfig: EChartsOption,
  userLevel: UserLevel
): EChartsOption {
  const adapted = { ...chartConfig };

  switch (userLevel) {
    case 'beginner':
      return adaptForBeginner(adapted);
    case 'intermediate':
      return adaptForIntermediate(adapted);
    case 'advanced':
      return adaptForAdvanced(adapted);
    default:
      return adapted;
  }
}

function adaptForBeginner(chartConfig: EChartsOption): EChartsOption {
  return {
    ...chartConfig,
    tooltip: {
      ...chartConfig.tooltip,
      formatter: simplifyTooltip
    },
    series: Array.isArray(chartConfig.series)
      ? chartConfig.series.map(series => ({
          ...series,
          itemStyle: {
            ...(series as any).itemStyle,
            opacity: 0.8
          }
        }))
      : chartConfig.series,
    // 移除复杂功能
    dataZoom: undefined,
    toolbox: undefined,
    visualMap: undefined
  };
}

function adaptForIntermediate(chartConfig: EChartsOption): EChartsOption {
  return {
    ...chartConfig,
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ]
  };
}

function adaptForAdvanced(chartConfig: EChartsOption): EChartsOption {
  return {
    ...chartConfig,
    toolbox: {
      feature: {
        dataZoom: {},
        restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ]
  };
}

function simplifyTooltip(params: any): string {
  if (Array.isArray(params)) {
    // 多系列情况
    return params.map(p => `${p.seriesName}: ${formatNumber(p.value)}`).join('<br/>');
  } else {
    // 单系列情况
    const { name, value, seriesName } = params;
    if (Array.isArray(value)) {
      return `${seriesName}<br/>${name}: ${formatNumber(value[1])}`;
    } else {
      return `${seriesName}<br/>${name}: ${formatNumber(value)}`;
    }
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
}

// 主题适配器
export function adaptTheme(chartConfig: EChartsOption, theme: 'light' | 'dark'): EChartsOption {
  if (theme === 'dark') {
    return {
      ...chartConfig,
      backgroundColor: '#1f1f1f',
      textStyle: {
        color: '#fff'
      },
      title: chartConfig.title ? {
        ...chartConfig.title,
        textStyle: {
          color: '#fff'
        }
      } : undefined,
      legend: chartConfig.legend ? {
        ...chartConfig.legend,
        textStyle: {
          color: '#fff'
        }
      } : undefined,
      xAxis: Array.isArray(chartConfig.xAxis)
        ? chartConfig.xAxis.map(axis => ({
            ...axis,
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#aaa'
            }
          }))
        : chartConfig.xAxis ? {
            ...chartConfig.xAxis,
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#aaa'
            }
          } : undefined,
      yAxis: Array.isArray(chartConfig.yAxis)
        ? chartConfig.yAxis.map(axis => ({
            ...axis,
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#aaa'
            }
          }))
        : chartConfig.yAxis ? {
            ...chartConfig.yAxis,
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#aaa'
            }
          } : undefined
    };
  }
  
  return chartConfig;
}

// 响应式适配器
export function adaptResponsive(
  chartConfig: EChartsOption,
  screenSize: 'mobile' | 'tablet' | 'desktop'
): EChartsOption {
  const adapted = { ...chartConfig };

  switch (screenSize) {
    case 'mobile':
      adapted.textStyle = {
        ...adapted.textStyle,
        fontSize: 12
      };
      if (adapted.legend) {
        adapted.legend = {
          ...adapted.legend,
          orient: 'horizontal',
          bottom: 0
        };
      }
      break;
      
    case 'tablet':
      adapted.textStyle = {
        ...adapted.textStyle,
        fontSize: 14
      };
      break;
      
    case 'desktop':
      adapted.textStyle = {
        ...adapted.textStyle,
        fontSize: 16
      };
      break;
  }

  return adapted;
}

// 性能优化适配器
export function optimizePerformance(
  chartConfig: EChartsOption,
  dataSize: number
): EChartsOption {
  if (dataSize > 1000) {
    return {
      ...chartConfig,
      series: Array.isArray(chartConfig.series)
        ? chartConfig.series.map(series => ({
            ...series,
            sampling: 'average',
            progressive: 1000,
            progressiveThreshold: 5000
          }))
        : chartConfig.series
    };
  }
  
  return chartConfig;
}

// 可访问性适配器
export function enhanceAccessibility(chartConfig: EChartsOption): EChartsOption {
  return {
    ...chartConfig,
    aria: {
      enabled: true,
      label: {
        description: '投资组合可视化图表'
      }
    },
    color: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ]
  };
}