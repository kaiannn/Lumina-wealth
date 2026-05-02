import type { VisualInsight } from '../components/visualization/SmartVisualization';

export type VisualizationType = 'structure' | 'timeline' | 'relationship' | 'behavior';

export async function generateVisualInsights(
  visualizationData: any,
  type: VisualizationType
): Promise<VisualInsight[]> {
  const insights: VisualInsight[] = [];

  try {
    // 根据可视化类型调用不同的洞察生成器
    switch (type) {
      case 'structure':
        insights.push(...await generateStructureInsights(visualizationData));
        break;
      case 'timeline':
        insights.push(...await generateTimelineInsights(visualizationData));
        break;
      case 'relationship':
        insights.push(...await generateRelationshipInsights(visualizationData));
        break;
      case 'behavior':
        insights.push(...await generateBehaviorInsights(visualizationData));
        break;
    }

    // 按严重程度排序
    insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

  } catch (error) {
    console.error('生成洞察失败:', error);
  }

  return insights;
}

// 结构图洞察生成
async function generateStructureInsights(data: any): Promise<VisualInsight[]> {
  const insights: VisualInsight[] = [];

  if (!data || !Array.isArray(data)) {
    return insights;
  }

  // 计算集中度
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));

  // 检查过度集中
  if (sortedData.length > 0) {
    const topItem = sortedData[0];
    const concentration = (topItem.value || 0) / totalValue;

    if (concentration > 0.3) {
      insights.push({
        id: `concentration-${Date.now()}`,
        type: 'risk',
        severity: concentration > 0.5 ? 'high' : 'medium',
        title: '资产过度集中',
        description: `${topItem.name} 占比 ${(concentration * 100).toFixed(1)}%，建议分散投资以降低风险`,
        visualizationId: 'structure',
        dataPoints: [concentration],
        actionItems: [
          '考虑减少该资产的持仓比例',
          '增加其他资产的配置',
          '评估相关风险敞口'
        ]
      });
    }
  }

  // 检查资产类别分布
  const assetTypes = new Set(data.map((item: any) => item.type || '未知'));
  if (assetTypes.size < 3 && data.length > 5) {
    insights.push({
      id: `diversification-${Date.now()}`,
      type: 'opportunity',
      severity: 'medium',
      title: '资产类别单一',
      description: `当前仅包含 ${assetTypes.size} 种资产类别，建议增加资产类别以实现更好的分散化`,
      visualizationId: 'structure',
      dataPoints: [assetTypes.size],
      actionItems: [
        '考虑增加债券、现金等其他资产类别',
        '评估当前资产配置的合理性',
        '研究不同资产类别的相关性'
      ]
    });
  }

  return insights;
}

// 时间序列图洞察生成
async function generateTimelineInsights(data: any): Promise<VisualInsight[]> {
  const insights: VisualInsight[] = [];

  if (!data || !Array.isArray(data) || data.length < 2) {
    return insights;
  }

  // 计算趋势
  const values = data.map((point: any) => {
    if (Array.isArray(point)) {
      return point[1];
    }
    return point.value || point;
  });

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / firstValue) * 100;

  // 趋势洞察
  if (Math.abs(change) > 10) {
    insights.push({
      id: `trend-${Date.now()}`,
      type: change > 0 ? 'opportunity' : 'risk',
      severity: Math.abs(change) > 20 ? 'high' : 'medium',
      title: change > 0 ? '显著上涨趋势' : '显著下跌趋势',
      description: `期间变化 ${change.toFixed(1)}%，从 ${formatNumber(firstValue)} 到 ${formatNumber(lastValue)}`,
      visualizationId: 'timeline',
      dataPoints: [change],
      actionItems: change > 0 ? [
        '考虑锁定部分利润',
        '评估是否继续持有',
        '设置止盈点'
      ] : [
        '评估下跌原因',
        '考虑止损或减仓',
        '检查基本面是否变化'
      ]
    });
  }

  // 波动性分析
  const volatility = calculateVolatility(values);
  if (volatility > 0.15) {
    insights.push({
      id: `volatility-${Date.now()}`,
      type: 'risk',
      severity: volatility > 0.25 ? 'high' : 'medium',
      title: '高波动性警告',
      description: `期间波动率 ${(volatility * 100).toFixed(1)}%，表明价格波动较大`,
      visualizationId: 'timeline',
      dataPoints: [volatility],
      actionItems: [
        '评估风险承受能力',
        '考虑降低仓位',
        '设置更宽的止损点'
      ]
    });
  }

  return insights;
}

// 关系图洞察生成
async function generateRelationshipInsights(data: any): Promise<VisualInsight[]> {
  const insights: VisualInsight[] = [];

  if (!data || !data.matrix || !Array.isArray(data.matrix)) {
    return insights;
  }

  const matrix = data.matrix;
  const labels = data.labels || [];

  // 检查高相关性
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      const correlation = matrix[i][j];
      
      if (correlation > 0.8) {
        insights.push({
          id: `correlation-${i}-${j}-${Date.now()}`,
          type: 'risk',
          severity: correlation > 0.9 ? 'high' : 'medium',
          title: '高度相关资产',
          description: `${labels[i] || '资产' + i} 与 ${labels[j] || '资产' + j} 相关性高达 ${correlation.toFixed(2)}`,
          visualizationId: 'relationship',
          dataPoints: [correlation],
          actionItems: [
            '考虑降低相关资产的配置',
            '增加不相关资产的配置',
            '评估系统性风险'
          ]
        });
      }
    }
  }

  // 检查分散化效果
  const avgCorrelation = calculateAverageCorrelation(matrix);
  if (avgCorrelation > 0.5) {
    insights.push({
      id: `diversification-${Date.now()}`,
      type: 'opportunity',
      severity: 'medium',
      title: '分散化效果有限',
      description: `平均相关性 ${avgCorrelation.toFixed(2)}，表明资产间相关性较高，分散化效果有限`,
      visualizationId: 'relationship',
      dataPoints: [avgCorrelation],
      actionItems: [
        '考虑增加不相关资产',
        '评估不同行业/地区的配置',
        '研究资产间的相关性模式'
      ]
    });
  }

  return insights;
}

// 行为图洞察生成
async function generateBehaviorInsights(data: any): Promise<VisualInsight[]> {
  const insights: VisualInsight[] = [];

  if (!data || !data.values || !Array.isArray(data.values)) {
    return insights;
  }

  const values = data.values;
  const indicators = data.indicators || [];

  // 分析行为模式
  const patterns: { [key: string]: number } = {};

  values.forEach((value: number, index: number) => {
    const indicator = indicators[index];
    if (indicator && value < 50) {
      patterns[indicator.name] = value;
    }
  });

  // 生成改进建议
  Object.entries(patterns).forEach(([name, score]) => {
    if (score < 30) {
      insights.push({
        id: `behavior-${name}-${Date.now()}`,
        type: 'pattern',
        severity: 'high',
        title: `${name}需要改进`,
        description: `${name}得分 ${score}，低于平均水平，需要重点关注`,
        visualizationId: 'behavior',
        dataPoints: [score],
        actionItems: getBehaviorActionItems(name)
      });
    } else if (score < 50) {
      insights.push({
        id: `behavior-${name}-${Date.now()}`,
        type: 'pattern',
        severity: 'medium',
        title: `${name}有待提升`,
        description: `${name}得分 ${score}，有提升空间`,
        visualizationId: 'behavior',
        dataPoints: [score],
        actionItems: getBehaviorActionItems(name)
      });
    }
  });

  return insights;
}

// 辅助函数
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    const returnVal = (values[i] - values[i - 1]) / values[i - 1];
    returns.push(returnVal);
  }
  
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}

function calculateAverageCorrelation(matrix: number[][]): number {
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      sum += Math.abs(matrix[i][j]);
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
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

function getBehaviorActionItems(behaviorName: string): string[] {
  const actionMap: { [key: string]: string[] } = {
    '交易频率': [
      '避免过度交易',
      '制定明确的交易计划',
      '记录交易决策原因'
    ],
    '时机选择': [
      '研究市场周期',
      '避免追涨杀跌',
      '等待合适的买入时机'
    ],
    '风险控制': [
      '设置止损点',
      '控制单笔交易风险',
      '定期评估风险暴露'
    ],
    '情绪管理': [
      '避免情绪化交易',
      '保持投资纪律',
      '定期复盘交易决策'
    ],
    '学习能力': [
      '持续学习投资知识',
      '分析成功和失败的交易',
      '向优秀投资者学习'
    ]
  };

  return actionMap[behaviorName] || [
    '记录相关行为',
    '分析行为模式',
    '制定改进计划'
  ];
}

// 批量洞察生成（用于多个图表）
export async function generateBatchInsights(
  visualizations: Array<{ data: any; type: VisualizationType }>
): Promise<VisualInsight[]> {
  const allInsights: VisualInsight[] = [];

  for (const viz of visualizations) {
    const insights = await generateVisualInsights(viz.data, viz.type);
    allInsights.push(...insights);
  }

  // 去重和排序
  const uniqueInsights = Array.from(
    new Map(allInsights.map(insight => [insight.id, insight])).values()
  );

  return uniqueInsights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

// 实时洞察更新
export function createInsightStream(
  dataStream: AsyncIterable<any>,
  type: VisualizationType,
  callback: (insights: VisualInsight[]) => void
): () => void {
  let isRunning = true;

  const processStream = async () => {
    for await (const data of dataStream) {
      if (!isRunning) break;
      
      const insights = await generateVisualInsights(data, type);
      if (insights.length > 0) {
        callback(insights);
      }
      
      // 控制更新频率
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  processStream();

  return () => {
    isRunning = false;
  };
}