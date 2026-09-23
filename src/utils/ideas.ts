import type { Transaction, Holding, PortfolioAnalytics } from '@/types'

export type IdeaVerdict = 'pass' | 'warn' | 'fail' | 'neutral'

export interface ConcentrationPoint {
  timestamp: number
  maxWeight: number
  holdingsCount: number
  topSymbol: string
}

export interface ConcentrationAnalysis {
  points: ConcentrationPoint[]
  currentMaxWeight: number
  avgMaxWeight: number
  peakMaxWeight: number
  holdingsCount: number
  threshold: number
  timeAboveThresholdPct: number
  verdict: IdeaVerdict
  summary: string
}

export interface TurnoverAnalysis {
  turnoverRate: number
  monthlyTradeCounts: { month: string; count: number; buy: number; sell: number }[]
  tradeDays: number
  avgTradesPerMonth: number
  totalClosedTrades: number
  avgHoldingDays: number
  winRate: number
  lowTurnoverThreshold: number
  verdict: IdeaVerdict
  summary: string
}

const DAY = 24 * 60 * 60 * 1000

/** 用历史成本近似「当时市值」：买入加成本，卖出按均价减 */
function buildConcentrationSeries(transactions: Transaction[]): ConcentrationPoint[] {
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
  const costBySymbol = new Map<string, { cost: number; name: string }>()
  const points: ConcentrationPoint[] = []

  for (const tx of sorted) {
    const entry = costBySymbol.get(tx.symbol) ?? { cost: 0, name: tx.name }
    if (tx.type === 'BUY') {
      entry.cost += tx.price * tx.quantity + tx.commission + tx.tax
    } else {
      const sellNotional = tx.price * tx.quantity
      entry.cost = Math.max(0, entry.cost - Math.min(entry.cost, sellNotional))
    }
    costBySymbol.set(tx.symbol, entry)

    let total = 0
    let maxCost = 0
    let topSymbol = ''
    for (const [sym, e] of costBySymbol) {
      if (e.cost <= 0) continue
      total += e.cost
      if (e.cost > maxCost) {
        maxCost = e.cost
        topSymbol = sym
      }
    }

    if (total > 0) {
      points.push({
        timestamp: tx.timestamp,
        maxWeight: (maxCost / total) * 100,
        holdingsCount: [...costBySymbol.values()].filter((e) => e.cost > 0).length,
        topSymbol,
      })
    }
  }

  return points
}

export function analyzeConcentration(
  transactions: Transaction[],
  holdings: Holding[],
  threshold = 30
): ConcentrationAnalysis {
  const points = buildConcentrationSeries(transactions)
  const openHoldings = holdings.filter((h) => h.totalQuantity > 0 && h.marketValue > 0)
  const totalMV = openHoldings.reduce((s, h) => s + h.marketValue, 0)

  const currentMaxWeight =
    totalMV > 0 && openHoldings.length > 0
      ? Math.max(...openHoldings.map((h) => (h.marketValue / totalMV) * 100))
      : 0

  const topHolding =
    totalMV > 0 && openHoldings.length > 0
      ? openHoldings.reduce((a, b) => (a.marketValue >= b.marketValue ? a : b))
      : null

  if (points.length > 0 && topHolding && totalMV > 0) {
    // refresh last point with live market values
    points[points.length - 1] = {
      ...points[points.length - 1],
      maxWeight: currentMaxWeight,
      holdingsCount: openHoldings.length,
      topSymbol: topHolding.symbol,
    }
  }

  const weights = points.map((p) => p.maxWeight)
  const avgMaxWeight = weights.length ? weights.reduce((s, w) => s + w, 0) / weights.length : 0
  const peakMaxWeight = weights.length ? Math.max(...weights) : 0
  const above = weights.filter((w) => w > threshold).length
  const timeAboveThresholdPct = weights.length ? (above / weights.length) * 100 : 0

  let verdict: IdeaVerdict = 'neutral'
  let summary = '交易数据不足，无法评估集中度。'

  if (points.length >= 2) {
    if (currentMaxWeight <= threshold && timeAboveThresholdPct < 30) {
      verdict = 'pass'
      summary = `当前单票占比 ${currentMaxWeight.toFixed(1)}%，历史多数时间低于 ${threshold}% 阈值，分散相对充分。`
    } else if (currentMaxWeight > threshold * 1.5 || timeAboveThresholdPct > 60) {
      verdict = 'fail'
      summary = `单票长期偏高：当前 ${currentMaxWeight.toFixed(1)}%，历史 ${timeAboveThresholdPct.toFixed(0)}% 的时点超过 ${threshold}%。集中度风险需警惕。`
    } else {
      verdict = 'warn'
      summary = `当前最大持仓 ${currentMaxWeight.toFixed(1)}%（${topHolding?.name ?? '—'}），处于阈值附近，建议继续观察。`
    }
  }

  return {
    points,
    currentMaxWeight,
    avgMaxWeight,
    peakMaxWeight,
    holdingsCount: openHoldings.length,
    threshold,
    timeAboveThresholdPct,
    verdict,
    summary,
  }
}

export function analyzeTurnover(
  transactions: Transaction[],
  analytics: PortfolioAnalytics
): TurnoverAnalysis {
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
  const monthlyMap = new Map<string, { count: number; buy: number; sell: number }>()

  for (const tx of sorted) {
    const d = new Date(tx.timestamp)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = monthlyMap.get(key) ?? { count: 0, buy: 0, sell: 0 }
    entry.count++
    if (tx.type === 'BUY') entry.buy++
    else entry.sell++
    monthlyMap.set(key, entry)
  }

  const monthlyTradeCounts = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }))

  const tradeDaysSet = new Set(sorted.map((tx) => new Date(tx.timestamp).toDateString()))
  const tradeDays = tradeDaysSet.size
  const months = Math.max(1, monthlyTradeCounts.length)
  const avgTradesPerMonth = sorted.length / months

  // 低换手理念阈值：年化换手率 < 200% 且月均交易 < 4 笔
  const lowTurnoverThreshold = 200
  const isLowTurnover = analytics.turnoverRate < lowTurnoverThreshold && avgTradesPerMonth < 4

  let verdict: IdeaVerdict = 'neutral'
  let summary = '交易样本不足，换手评估仅供参考。'

  if (sorted.length >= 5) {
    if (isLowTurnover && analytics.avgHoldingDays >= 30) {
      verdict = 'pass'
      summary = `换手率 ${analytics.turnoverRate.toFixed(0)}%、月均 ${avgTradesPerMonth.toFixed(1)} 笔、平均持有 ${Math.round(analytics.avgHoldingDays)} 天，符合「低换手 / 长期持有」理念。`
    } else if (analytics.turnoverRate > 400 || avgTradesPerMonth > 8) {
      verdict = 'fail'
      summary = `换手偏高：换手率 ${analytics.turnoverRate.toFixed(0)}%、月均 ${avgTradesPerMonth.toFixed(1)} 笔。高频交易可能侵蚀收益，与低换手理念相悖。`
    } else {
      verdict = 'warn'
      summary = `换手率 ${analytics.turnoverRate.toFixed(0)}%、月均 ${avgTradesPerMonth.toFixed(1)} 笔，介于高低之间。可结合胜率 ${analytics.winRate.toFixed(0)}% 一起看交易是否创造价值。`
    }
  }

  return {
    turnoverRate: analytics.turnoverRate,
    monthlyTradeCounts,
    tradeDays,
    avgTradesPerMonth,
    totalClosedTrades: analytics.totalClosedTrades,
    avgHoldingDays: analytics.avgHoldingDays,
    winRate: analytics.winRate,
    lowTurnoverThreshold,
    verdict,
    summary,
  }
}

export function verdictLabel(v: IdeaVerdict): string {
  if (v === 'pass') return '理念相符'
  if (v === 'warn') return '部分相符'
  if (v === 'fail') return '理念相悖'
  return '数据不足'
}

export function verdictClass(v: IdeaVerdict): string {
  if (v === 'pass') return 'text-green-400 bg-green-500/10 border-green-500/20'
  if (v === 'warn') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  if (v === 'fail') return 'text-red-400 bg-red-500/10 border-red-500/20'
  return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
}

/** 供理念页使用的交易跨度天数 */
export function transactionSpanDays(transactions: Transaction[]): number {
  if (transactions.length < 2) return 0
  const ts = transactions.map((t) => t.timestamp)
  return Math.max(1, Math.round((Math.max(...ts) - Math.min(...ts)) / DAY))
}
