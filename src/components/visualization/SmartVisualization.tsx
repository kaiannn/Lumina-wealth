import React, { useState, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { InsightPanel } from './InsightPanel';
import { adaptVisualizationForUser } from '../../utils/visualizationAdapter';
import { generateVisualInsights } from '../../services/InsightGenerator';

export type VisualizationType = 'structure' | 'timeline' | 'relationship' | 'behavior';

export interface UserPreferences {
  level: 'beginner' | 'intermediate' | 'advanced';
  theme: 'light' | 'dark';
  chartComplexity: 'simple' | 'standard' | 'detailed';
  notifications: boolean;
}

export interface VisualInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  visualizationId: string;
  dataPoints: number[];
  actionItems: string[];
}

interface SmartVisualizationProps {
  data: any;
  type: VisualizationType;
  userPreferences: UserPreferences;
  title?: string;
  description?: string;
  width?: string | number;
  height?: string | number;
  onInsightClick?: (insight: VisualInsight) => void;
}

export function SmartVisualization({
  data,
  type,
  userPreferences,
  title,
  description,
  width = '100%',
  height = '400px',
  onInsightClick
}: SmartVisualizationProps) {
  const [insights, setInsights] = useState<VisualInsight[]>([]);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  // 根据数据类型和用户偏好生成图表配置
  const chartConfig = useMemo(() => {
    const baseConfig = getBaseChartConfig(type, data);
    return adaptVisualizationForUser(baseConfig, userPreferences.level);
  }, [type, data, userPreferences.level]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, userPreferences.theme);
    chart.setOption(chartConfig);
    setChartInstance(chart);

    // 监听窗口大小变化
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [chartConfig, userPreferences.theme]);

  // 生成智能洞察
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const generatedInsights = await generateVisualInsights(data, type);
        setInsights(generatedInsights);
      } catch (error) {
        console.error('生成洞察失败:', error);
      }
    };

    if (userPreferences.notifications) {
      loadInsights();
    }
  }, [data, type, userPreferences.notifications]);

  // 处理图表交互事件
  const handleChartEvents = useMemo(() => {
    return {
      click: (params: any) => {
        console.log('图表点击:', params);
        // 可以在这里添加下钻分析等交互逻辑
      },
      datazoom: (params: any) => {
        console.log('数据缩放:', params);
      }
    };
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (chartInstance) {
      chartInstance.setOption(chartConfig);
    }
  }, [chartInstance, chartConfig]);

  return (
    <div className="smart-visualization-container" style={{ width, height }}>
      {/* 标题和描述 */}
      {(title || description) && (
        <div className="visualization-header">
          {title && <h3 className="visualization-title">{title}</h3>}
          {description && <p className="visualization-description">{description}</p>}
        </div>
      )}

      {/* 图表容器 */}
      <div className="chart-wrapper">
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
        
        {/* 智能洞察面板 */}
        {insights.length > 0 && userPreferences.notifications && (
          <div className="insight-overlay">
            <InsightPanel 
              insights={insights} 
              onInsightClick={onInsightClick}
              maxInsights={3}
            />
          </div>
        )}
      </div>

      {/* 图表控制面板 */}
      <div className="chart-controls">
        <button 
          className="control-btn"
          onClick={() => chartInstance?.dispatchAction({ type: 'restore' })}
        >
          重置视图
        </button>
        <button 
          className="control-btn"
          onClick={() => {
            if (chartInstance) {
              const dataUrl = chartInstance.getDataURL({ type: 'png' });
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `chart_${Date.now()}.png`;
              link.click();
            }
          }}
        >
          保存图片
        </button>
      </div>
    </div>
  );
}

// 基础图表配置生成器
function getBaseChartConfig(type: VisualizationType, data: any): EChartsOption {
  switch (type) {
    case 'structure':
      return getStructureChartConfig(data);
    case 'timeline':
      return getTimelineChartConfig(data);
    case 'relationship':
      return getRelationshipChartConfig(data);
    case 'behavior':
      return getBehaviorChartConfig(data);
    default:
      return {};
  }
}

// 结构图配置
function getStructureChartConfig(data: any): EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item: any) => ({
          name: item.name,
          value: item.value
        }))
      }
    ]
  };
}

// 时间序列图配置
function getTimelineChartConfig(data: any): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis: {
      type: 'time',
      boundaryGap: [0, 0]
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%']
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '数据',
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          color: 'rgb(255, 70, 131)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 158, 68)'
            },
            {
              offset: 1,
              color: 'rgb(255, 70, 131)'
            }
          ])
        },
        data: data
      }
    ]
  };
}

// 关系图配置
function getRelationshipChartConfig(data: any): EChartsOption {
  return {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: data.labels,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: data.labels,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [
      {
        name: '相关性',
        type: 'heatmap',
        data: data.matrix.flatMap((row: number[], i: number) =>
          row.map((value: number, j: number) => [i, j, value])
        ),
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
}

// 行为图配置
function getBehaviorChartConfig(data: any): EChartsOption {
  return {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: data.indicators.map((ind: any) => ({
        name: ind.name,
        max: ind.max
      }))
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data.values,
            name: '行为模式',
            areaStyle: {
              color: 'rgba(255, 228, 52, 0.6)'
            }
          }
        ]
      }
    ]
  };
}

// 样式定义
const styles = `
.smart-visualization-container {
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.visualization-header {
  margin-bottom: 16px;
}

.visualization-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.visualization-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
}

.insight-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.chart-controls {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.control-btn {
  padding: 6px 12px;
  font-size: 14px;
  color: #1890ff;
  background: #fff;
  border: 1px solid #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  color: #fff;
  background: #1890ff;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .smart-visualization-container {
    background: #1f1f1f;
    border-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .visualization-title {
    color: #fff;
  }

  .visualization-description {
    color: #aaa;
  }

  .chart-controls {
    border-top-color: #333;
  }

  .control-btn {
    color: #40a9ff;
    border-color: #40a9ff;
    background: #1f1f1f;
  }

  .control-btn:hover {
    color: #1f1f1f;
    background: #40a9ff;
  }
}
`;

// 添加样式到文档
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default SmartVisualization;