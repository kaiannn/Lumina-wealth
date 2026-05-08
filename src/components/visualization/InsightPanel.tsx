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

interface InsightPanelProps {
  insights: VisualInsight[];
  onInsightClick?: (insight: VisualInsight) => void;
  maxInsights?: number;
}

export function InsightPanel({ insights, onInsightClick, maxInsights = 5 }: InsightPanelProps) {
  const visibleInsights = insights.slice(0, maxInsights);

  const getSeverityColor = (severity: VisualInsight['severity']) => {
    switch (severity) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getTypeIcon = (type: VisualInsight['type']) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'anomaly': return '⚠️';
      case 'opportunity': return '💡';
      case 'risk': return '🚨';
      default: return 'ℹ️';
    }
  };

  const handleInsightClick = (insight: VisualInsight) => {
    if (onInsightClick) {
      onInsightClick(insight);
    }
  };

  return (
    <div className="insight-panel">
      <div className="insight-header">
        <h4 className="insight-title">智能洞察</h4>
        <span className="insight-count">{insights.length}</span>
      </div>
      
      <div className="insight-list">
        {visibleInsights.map((insight) => (
          <div 
            key={insight.id}
            className="insight-item"
            onClick={() => handleInsightClick(insight)}
            style={{ cursor: onInsightClick ? 'pointer' : 'default' }}
          >
            <div className="insight-icon">
              {getTypeIcon(insight.type)}
            </div>
            
            <div className="insight-content">
              <div className="insight-header-row">
                <span className="insight-type">{insight.type}</span>
                <span 
                  className="insight-severity"
                  style={{ backgroundColor: getSeverityColor(insight.severity) }}
                >
                  {insight.severity}
                </span>
              </div>
              
              <h5 className="insight-item-title">{insight.title}</h5>
              <p className="insight-description">{insight.description}</p>
              
              {insight.actionItems && insight.actionItems.length > 0 && (
                <div className="insight-actions">
                  <span className="actions-label">建议行动:</span>
                  <ul className="action-list">
                    {insight.actionItems.slice(0, 2).map((action, index) => (
                      <li key={index} className="action-item">{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {insights.length > maxInsights && (
        <div className="insight-footer">
          <span className="more-insights">
            还有 {insights.length - maxInsights} 个洞察
          </span>
        </div>
      )}
    </div>
  );
}

// 样式定义
const styles = `
.insight-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  max-height: 400px;
  overflow: hidden;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.insight-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.insight-count {
  background: #1890ff;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.insight-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.insight-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: white;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.insight-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.insight-item:last-child {
  margin-bottom: 0;
}

.insight-icon {
  float: left;
  margin-right: 12px;
  font-size: 20px;
}

.insight-content {
  overflow: hidden;
}

.insight-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.insight-type {
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
}

.insight-severity {
  font-size: 10px;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: 500;
}

.insight-item-title {
  margin: 4px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.insight-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.insight-actions {
  border-top: 1px solid #f5f5f5;
  padding-top: 8px;
  margin-top: 8px;
}

.actions-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.action-list {
  margin: 0;
  padding-left: 16px;
}

.action-item {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 2px;
}

.action-item:last-child {
  margin-bottom: 0;
}

.insight-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  background: #fafafa;
}

.more-insights {
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.more-insights:hover {
  color: #1890ff;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .insight-panel {
    background: rgba(30, 30, 30, 0.95);
    border-color: #444;
  }

  .insight-header {
    background: #1f1f1f;
    border-bottom-color: #333;
  }

  .insight-title {
    color: #fff;
  }

  .insight-item {
    background: #2a2a2a;
    border-color: #333;
  }

  .insight-item-title {
    color: #fff;
  }

  .insight-description {
    color: #aaa;
  }

  .insight-type {
    color: #aaa;
  }

  .insight-actions {
    border-top-color: #333;
  }

  .actions-label {
    color: #888;
  }

  .action-item {
    color: #ddd;
  }

  .insight-footer {
    background: #1f1f1f;
    border-top-color: #333;
  }

  .more-insights {
    color: #aaa;
  }

  .more-insights:hover {
    color: #40a9ff;
  }
}
`;

// 添加样式到文档
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default InsightPanel;