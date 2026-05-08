import { useState } from 'react';
import SmartVisualization from '../components/visualization/SmartVisualization';
import type { UserPreferences, VisualInsight } from '../components/visualization/SmartVisualization';
import './VisualizationDemo.css';

export default function VisualizationDemo() {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    level: 'intermediate',
    theme: 'light',
    chartComplexity: 'standard',
    notifications: true
  });

  // 示例数据：持仓结构
  const portfolioStructureData = [
    { name: '腾讯控股', value: 150000, type: '科技' },
    { name: '贵州茅台', value: 120000, type: '消费' },
    { name: '招商银行', value: 80000, type: '金融' },
    { name: '宁德时代', value: 60000, type: '新能源' },
    { name: '中国平安', value: 50000, type: '保险' },
    { name: '美的集团', value: 40000, type: '家电' },
    { name: '其他资产', value: 100000, type: '其他' }
  ];

  // 示例数据：价格走势
  const priceTimelineData = [
    ['2024-01-01', 100],
    ['2024-02-01', 105],
    ['2024-03-01', 98],
    ['2024-04-01', 112],
    ['2024-05-01', 108],
    ['2024-06-01', 115],
    ['2024-07-01', 120],
    ['2024-08-01', 118],
    ['2024-09-01', 125],
    ['2024-10-01', 130],
    ['2024-11-01', 128],
    ['2024-12-01', 135]
  ];

  // 示例数据：相关性矩阵
  const correlationData = {
    labels: ['腾讯', '茅台', '招行', '宁德', '平安', '美的'],
    matrix: [
      [1.00, 0.15, 0.25, 0.30, 0.20, 0.10],
      [0.15, 1.00, 0.10, 0.05, 0.15, 0.20],
      [0.25, 0.10, 1.00, 0.35, 0.40, 0.25],
      [0.30, 0.05, 0.35, 1.00, 0.30, 0.35],
      [0.20, 0.15, 0.40, 0.30, 1.00, 0.20],
      [0.10, 0.20, 0.25, 0.35, 0.20, 1.00]
    ]
  };

  // 示例数据：行为模式
  const behaviorData = {
    indicators: [
      { name: '交易频率', max: 100 },
      { name: '时机选择', max: 100 },
      { name: '风险控制', max: 100 },
      { name: '情绪管理', max: 100 },
      { name: '学习能力', max: 100 }
    ],
    values: [65, 45, 70, 60, 80]
  };

  const handleInsightClick = (insight: VisualInsight) => {
    alert(`洞察点击: ${insight.title}\n${insight.description}`);
  };

  const handleLevelChange = (level: UserPreferences['level']) => {
    setUserPreferences(prev => ({ ...prev, level }));
  };

  const handleThemeChange = (theme: UserPreferences['theme']) => {
    setUserPreferences(prev => ({ ...prev, theme }));
  };

  const handleNotificationsChange = (notifications: boolean) => {
    setUserPreferences(prev => ({ ...prev, notifications }));
  };

  return (
    <div className="visualization-demo">
      <header className="demo-header">
        <h1>投资可视化演示</h1>
        <p className="demo-subtitle">智能洞察驱动的投资决策辅助系统</p>
      </header>

      <div className="controls-panel">
        <div className="control-group">
          <label>用户级别:</label>
          <div className="button-group">
            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
              <button
                key={level}
                className={`level-btn ${userPreferences.level === level ? 'active' : ''}`}
                onClick={() => handleLevelChange(level)}
              >
                {level === 'beginner' ? '新手' : level === 'intermediate' ? '中级' : '高级'}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>主题:</label>
          <div className="button-group">
            {(['light', 'dark'] as const).map(theme => (
              <button
                key={theme}
                className={`theme-btn ${userPreferences.theme === theme ? 'active' : ''}`}
                onClick={() => handleThemeChange(theme)}
              >
                {theme === 'light' ? '浅色' : '深色'}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>智能洞察:</label>
          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={userPreferences.notifications}
                onChange={(e) => handleNotificationsChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">
              {userPreferences.notifications ? '开启' : '关闭'}
            </span>
          </div>
        </div>
      </div>

      <div className="visualization-grid">
        {/* 持仓结构可视化 */}
        <div className="visualization-card">
          <div className="card-header">
            <h3>持仓结构分析</h3>
            <p className="card-description">展示资产层级结构，识别过度集中风险</p>
          </div>
          <SmartVisualization
            data={portfolioStructureData}
            type="structure"
            userPreferences={userPreferences}
            title="持仓分布"
            description="按市值排序的持仓结构"
            height="400px"
            onInsightClick={handleInsightClick}
          />
        </div>

        {/* 价格走势可视化 */}
        <div className="visualization-card">
          <div className="card-header">
            <h3>价格走势分析</h3>
            <p className="card-description">对比持仓成本与市场价格，评估买入时机</p>
          </div>
          <SmartVisualization
            data={priceTimelineData}
            type="timeline"
            userPreferences={userPreferences}
            title="价格走势"
            description="过去12个月的价格变化"
            height="400px"
            onInsightClick={handleInsightClick}
          />
        </div>

        {/* 相关性分析 */}
        <div className="visualization-card">
          <div className="card-header">
            <h3>相关性分析</h3>
            <p className="card-description">展示资产间相关性，评估分散化效果</p>
          </div>
          <SmartVisualization
            data={correlationData}
            type="relationship"
            userPreferences={userPreferences}
            title="资产相关性"
            description="各资产间的相关系数矩阵"
            height="400px"
            onInsightClick={handleInsightClick}
          />
        </div>

        {/* 行为模式分析 */}
        <div className="visualization-card">
          <div className="card-header">
            <h3>行为模式分析</h3>
            <p className="card-description">综合评估投资行为特征和改进方向</p>
          </div>
          <SmartVisualization
            data={behaviorData}
            type="behavior"
            userPreferences={userPreferences}
            title="投资行为评估"
            description="五个维度的行为模式分析"
            height="400px"
            onInsightClick={handleInsightClick}
          />
        </div>
      </div>

      <div className="demo-info">
        <div className="info-card">
          <h4>💡 智能洞察功能</h4>
          <ul>
            <li>自动识别资产过度集中风险</li>
            <li>检测价格趋势和波动性异常</li>
            <li>分析资产相关性，优化分散化</li>
            <li>评估投资行为模式，提供改进建议</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>🎯 个性化适配</h4>
          <ul>
            <li>新手用户：简化图表，突出关键信息</li>
            <li>中级用户：标准配置，增加基础功能</li>
            <li>高级用户：完整功能，支持深度分析</li>
            <li>主题切换：支持浅色/深色模式</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>🚀 技术特性</h4>
          <ul>
            <li>基于ECharts的高性能渲染</li>
            <li>响应式设计，支持多设备</li>
            <li>实时数据更新和交互</li>
            <li>完整的TypeScript类型安全</li>
          </ul>
        </div>
      </div>

      <footer className="demo-footer">
        <p>© 2025 Lumina Wealth - 智能投资可视化平台</p>
        <p className="footer-note">
          本演示展示了基于认知科学和用户体验原则的可视化体系，
          让图表不仅是数据展示，更是认知工具和决策辅助。
        </p>
      </footer>
    </div>
  );
}