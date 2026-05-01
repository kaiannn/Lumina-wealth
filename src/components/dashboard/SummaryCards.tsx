import { TrendingUp, TrendingDown, Wallet, BarChart3, Target, CircleDollarSign } from 'lucide-react'
import type { PortfolioSummary } from '@/types'
import { formatCurrency, formatPercent, getPnLColor } from '@/utils/portfolio'

interface Props {
  summary: PortfolioSummary | null
}

export default function SummaryCards({ summary }: Props) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800 p-5 animate-pulse">
            <div className="h-4 w-20 bg-gray-800 rounded mb-3" />
            <div className="h-7 w-28 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: '总市值',
      value: formatCurrency(summary.totalMarketValue),
      icon: Wallet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      tooltip: '按最近成交价估值',
    },
    {
      label: '总成本',
      value: formatCurrency(summary.totalCost),
      icon: Target,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      tooltip: '含手续费与税费',
    },
    {
      label: '浮动盈亏',
      value: formatCurrency(summary.totalUnrealizedPnL),
      icon: summary.totalUnrealizedPnL >= 0 ? TrendingUp : TrendingDown,
      color: getPnLColor(summary.totalUnrealizedPnL),
      bgColor: summary.totalUnrealizedPnL >= 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      tooltip: '未实现盈亏 = 市值 - 持仓成本',
    },
    {
      label: '已实现收益',
      value: formatCurrency(summary.totalRealizedPnL),
      icon: CircleDollarSign,
      color: getPnLColor(summary.totalRealizedPnL),
      bgColor: summary.totalRealizedPnL >= 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      tooltip: '卖出收益 - 卖出部分成本',
    },
    {
      label: '总收益率',
      value: formatPercent(summary.totalUnrealizedPnLPercent),
      icon: BarChart3,
      color: getPnLColor(summary.totalUnrealizedPnLPercent),
      bgColor: summary.totalUnrealizedPnLPercent >= 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      tooltip: '浮动盈亏 / 总成本',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors group relative"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
            {card.tooltip && (
              <div className="absolute bottom-1 left-0 right-0 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-gray-600">{card.tooltip}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-600 px-1">
        * 估值基于最近一次成交价格，不代表实时市场价格。多币种资产未做汇率统一折算。
      </p>
    </div>
  )
}
