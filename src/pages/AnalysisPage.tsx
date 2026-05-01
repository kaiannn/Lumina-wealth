import { useState, useMemo } from 'react'
import { Target, TrendingUp, Clock, Repeat, PieChart } from 'lucide-react'
import type { Holding } from '@/types'
import { usePortfolio } from '@/hooks/usePortfolio'
import { calculatePortfolioAnalytics, formatCurrency } from '@/utils/portfolio'
import BuildPositionChart from '@/components/charts/BuildPositionChart'

export default function AnalysisPage() {
  const { holdings, transactions } = usePortfolio()
  const [selected, setSelected] = useState<Holding | null>(null)
  const [now] = useState(() => Date.now())

  const analytics = useMemo(
    () => calculatePortfolioAnalytics(transactions, holdings),
    [transactions, holdings]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">持仓分析</h1>
        <p className="text-sm text-gray-500 mt-1">查看每只标的的建仓形状与成本分析</p>
      </div>

      <p className="text-[10px] text-gray-600 px-1">
        * 建仓图基于交易记录计算，价格取成交价而非实时行情。收益率 = (市值 - 成本) / 成本。
      </p>

      {holdings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">请先添加交易记录</p>
        </div>
      ) : (
        <>
          {analytics.totalClosedTrades > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">胜率</span>
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xl font-bold text-amber-400">{analytics.winRate.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-600 mt-1">{analytics.winningTrades}胜 / {analytics.losingTrades}负</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">盈亏比</span>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-blue-400">
                  {analytics.profitLossRatio === Infinity ? '∞' : analytics.profitLossRatio.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  均赢 {formatCurrency(analytics.avgWinAmount)} / 均亏 {formatCurrency(analytics.avgLossAmount)}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">平均持有天数</span>
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-purple-400">{Math.round(analytics.avgHoldingDays)}</p>
                <p className="text-[10px] text-gray-600 mt-1">已平仓 {analytics.totalClosedTrades} 笔</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">周转率</span>
                  <Repeat className="w-3.5 h-3.5 text-green-400" />
                </div>
                <p className="text-xl font-bold text-green-400">{analytics.turnoverRate.toFixed(0)}%</p>
                <p className="text-[10px] text-gray-600 mt-1">卖出额 / 总市值</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">最大集中度</span>
                  <PieChart className="w-3.5 h-3.5 text-red-400" />
                </div>
                <p className="text-xl font-bold text-red-400">{analytics.maxConcentration.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-600 mt-1">单票最高占比</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {holdings.filter((h) => h.totalQuantity > 0).map((h) => (
              <button
                key={h.symbol}
                onClick={() => setSelected(h)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selected?.symbol === h.symbol
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800'
                }`}
              >
                {h.name}
                <span className="text-xs ml-1 opacity-60">{h.symbol}</span>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="space-y-4">
              <BuildPositionChart holding={selected} />

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-1">交易次数</p>
                  <p className="text-xl font-bold text-gray-200">{selected.transactions.length}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-1">买入次数</p>
                  <p className="text-xl font-bold text-red-400">
                    {selected.transactions.filter((t) => t.type === 'BUY').length}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-1">卖出次数</p>
                  <p className="text-xl font-bold text-green-400">
                    {selected.transactions.filter((t) => t.type === 'SELL').length}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-1">持仓天数</p>
                  <p className="text-xl font-bold text-gray-200">
                    {Math.floor(
                      (now - Math.min(...selected.transactions.map((t) => t.timestamp))) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800/50">
              <p className="text-gray-500 text-sm">选择一个持仓标的查看建仓分析</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
