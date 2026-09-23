import ReactECharts from 'echarts-for-react'
import { FlaskConical, Layers, Repeat } from 'lucide-react'
import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { calculatePortfolioAnalytics, formatDate } from '@/utils/portfolio'
import {
  analyzeConcentration,
  analyzeTurnover,
  verdictLabel,
  verdictClass,
} from '@/utils/ideas'

type IdeaId = 'concentration' | 'turnover'

const IDEAS: {
  id: IdeaId
  title: string
  icon: typeof Layers
  thesis: string
  question: string
}[] = [
  {
    id: 'concentration',
    title: '集中 vs 分散',
    icon: Layers,
    thesis:
      '把大部分仓位压在少数标的上，长期风险收益比通常劣于适度分散；单票占比是可检验的集中度代理。',
    question: '你的单票权重是否长期控制在合理阈值内？',
  },
  {
    id: 'turnover',
    title: '低换手 / 长期持有',
    icon: Repeat,
    thesis:
      '过度换手会抬高摩擦成本并放大行为偏差；低换手理念主张减少无优势的频繁交易。',
    question: '你的换手与交易频率，是否匹配「少动、拿住」？',
  },
]

export default function IdeasPage() {
  const { transactions, holdings, loading } = usePortfolio()
  const [active, setActive] = useState<IdeaId>('concentration')
  const [threshold, setThreshold] = useState(30)

  const analytics = useMemo(
    () => calculatePortfolioAnalytics(transactions, holdings),
    [transactions, holdings]
  )

  const concentration = useMemo(
    () => analyzeConcentration(transactions, holdings, threshold),
    [transactions, holdings, threshold]
  )

  const turnover = useMemo(
    () => analyzeTurnover(transactions, analytics),
    [transactions, analytics]
  )

  const current = IDEAS.find((i) => i.id === active)!
  const result = active === 'concentration' ? concentration : turnover

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">理念验证</h1>
          <p className="text-sm text-gray-500 mt-1">假设 → 指标 → 你的数据对照</p>
        </div>
        <div className="text-center py-20 bg-gray-900/40 rounded-xl border border-gray-800">
          <FlaskConical className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg text-gray-300 mb-2">还没有交易数据</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            先导入券商 CSV 或添加交易，再用集中度、换手等理念检验你的账户行为。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">理念验证</h1>
        <p className="text-sm text-gray-500 mt-1">
          把公认投资理念拆成可计算指标，对照你的真实交易
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {IDEAS.map((idea) => {
          const Icon = idea.icon
          const isActive = active === idea.id
          const verdict = idea.id === 'concentration' ? concentration.verdict : turnover.verdict
          return (
            <button
              key={idea.id}
              onClick={() => setActive(idea.id)}
              className={`text-left rounded-xl border p-4 transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-sm shadow-amber-500/5'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                  <h3 className="text-sm font-semibold text-gray-200">{idea.title}</h3>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${verdictClass(verdict)}`}
                >
                  {verdictLabel(verdict)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{idea.question}</p>
            </button>
          )
        })}
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-gray-200">{current.title}</h2>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${verdictClass(result.verdict)}`}
              >
                {verdictLabel(result.verdict)}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-gray-400">理念：</span>
              {current.thesis}
            </p>
          </div>

          {active === 'concentration' && (
            <label className="flex items-center gap-2 text-xs text-gray-500">
              单票阈值
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200"
              >
                {[20, 25, 30, 40, 50].map((t) => (
                  <option key={t} value={t}>
                    {t}%
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="px-3 py-2.5 bg-gray-800/40 border border-gray-800 rounded-lg mb-4">
          <p className="text-xs text-gray-300 leading-relaxed">{result.summary}</p>
        </div>

        {active === 'concentration' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard label="当前最大单票" value={`${concentration.currentMaxWeight.toFixed(1)}%`} />
              <MetricCard label="历史均值" value={`${concentration.avgMaxWeight.toFixed(1)}%`} />
              <MetricCard label="历史峰值" value={`${concentration.peakMaxWeight.toFixed(1)}%`} danger={concentration.peakMaxWeight > threshold * 1.5} />
              <MetricCard
                label="超阈值时点占比"
                value={`${concentration.timeAboveThresholdPct.toFixed(0)}%`}
                danger={concentration.timeAboveThresholdPct > 50}
              />
            </div>
            <ConcentrationChart points={concentration.points} threshold={threshold} />
            <p className="text-[10px] text-gray-600">
              * 历史集中度用累计成本近似当时市值（暂无逐日行情）；当前值用最后一笔成交价市值。
            </p>
          </div>
        )}

        {active === 'turnover' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="换手率"
                value={`${turnover.turnoverRate.toFixed(0)}%`}
                danger={turnover.turnoverRate > turnover.lowTurnoverThreshold}
              />
              <MetricCard label="月均交易" value={turnover.avgTradesPerMonth.toFixed(1)} />
              <MetricCard label="平均持有天数" value={String(Math.round(turnover.avgHoldingDays))} />
              <MetricCard label="胜率" value={`${turnover.winRate.toFixed(0)}%`} />
            </div>
            <TurnoverChart months={turnover.monthlyTradeCounts} />
            <p className="text-[10px] text-gray-600">
              * 判定参考：换手率 &lt; {turnover.lowTurnoverThreshold}% 且月均交易 &lt; 4 笔、平均持有 ≥ 30 天视为符合低换手理念。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  danger,
}: {
  label: string
  value: string
  danger?: boolean
}) {
  return (
    <div className="bg-gray-800/40 rounded-lg border border-gray-800 p-3">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${danger ? 'text-red-400' : 'text-gray-200'}`}>{value}</p>
    </div>
  )
}

function ConcentrationChart({
  points,
  threshold,
}: {
  points: { timestamp: number; maxWeight: number }[]
  threshold: number
}) {
  if (points.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-800/50">
        <p className="text-sm text-gray-500">暂无足够交易构建集中度曲线</p>
      </div>
    )
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      valueFormatter: (v: number) => `${Number(v).toFixed(1)}%`,
    },
    grid: { left: 48, right: 24, top: 36, bottom: 40 },
    xAxis: {
      type: 'category',
      data: points.map((p) => formatDate(p.timestamp)),
      axisLabel: { color: '#6b7280', fontSize: 10 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      name: '单票%',
      nameTextStyle: { color: '#6b7280', fontSize: 10 },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(55, 65, 81, 0.5)' } },
    },
    series: [
      {
        name: '最大单票权重',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: points.map((p) => Number(p.maxWeight.toFixed(2))),
        lineStyle: { color: '#f59e0b', width: 2 },
        areaStyle: { color: 'rgba(245, 158, 11, 0.12)' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#ef4444', type: 'dashed' },
          label: {
            color: '#ef4444',
            fontSize: 10,
            formatter: `阈值 ${threshold}%`,
          },
          data: [{ yAxis: threshold }],
        },
      },
    ],
  }

  return (
    <div className="bg-gray-900/30 rounded-xl border border-gray-800/50 p-2">
      <ReactECharts option={option} style={{ height: 280 }} notMerge />
    </div>
  )
}

function TurnoverChart({
  months,
}: {
  months: { month: string; count: number; buy: number; sell: number }[]
}) {
  if (months.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-800/50">
        <p className="text-sm text-gray-500">暂无交易</p>
      </div>
    )
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(17, 24, 39, 0.95)', textStyle: { color: '#e5e7eb', fontSize: 12 } },
    legend: {
      data: ['买入', '卖出'],
      textStyle: { color: '#9ca3af', fontSize: 11 },
      top: 0,
    },
    grid: { left: 40, right: 16, top: 36, bottom: 40 },
    xAxis: {
      type: 'category',
      data: months.map((m) => m.month),
      axisLabel: { color: '#6b7280', fontSize: 10, rotate: months.length > 8 ? 40 : 0 },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(55, 65, 81, 0.5)' } },
    },
    series: [
      {
        name: '买入',
        type: 'bar',
        stack: 'tx',
        data: months.map((m) => m.buy),
        itemStyle: { color: '#ef4444' },
      },
      {
        name: '卖出',
        type: 'bar',
        stack: 'tx',
        data: months.map((m) => m.sell),
        itemStyle: { color: '#22c55e' },
      },
    ],
  }

  return (
    <div className="bg-gray-900/30 rounded-xl border border-gray-800/50 p-2">
      <ReactECharts option={option} style={{ height: 260 }} notMerge />
    </div>
  )
}
