import type { Transaction, Holding, PortfolioSummary, BuildPositionPoint, PortfolioAnalytics } from '@/types'

export function calculateHoldings(transactions: Transaction[]): Holding[] {
  const grouped = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    const existing = grouped.get(tx.symbol) || []
    existing.push(tx)
    grouped.set(tx.symbol, existing)
  }

  const holdings: Holding[] = []

  for (const [symbol, txs] of grouped) {
    const sorted = [...txs].sort((a, b) => a.timestamp - b.timestamp)
    let totalQuantity = 0
    let totalCost = 0
    let realizedPnL = 0
    let totalFees = 0

    for (const tx of sorted) {
      totalFees += tx.commission + tx.tax
      if (tx.type === 'BUY') {
        totalCost += tx.price * tx.quantity + tx.commission + tx.tax
        totalQuantity += tx.quantity
      } else {
        if (totalQuantity > 0) {
          const avgCost = totalCost / totalQuantity
          const sellRevenue = tx.price * tx.quantity - tx.commission - tx.tax
          const costBasis = avgCost * tx.quantity
          realizedPnL += sellRevenue - costBasis
          totalCost -= avgCost * tx.quantity
        }
        totalQuantity -= tx.quantity
      }
    }

    if (totalQuantity <= 0) {
      if (realizedPnL !== 0) {
        holdings.push({
          symbol,
          name: sorted[0].name,
          assetType: sorted[0].assetType,
          currency: sorted[0].currency,
          totalQuantity: 0,
          averageCost: 0,
          totalCost: 0,
          currentPrice: sorted[sorted.length - 1].price,
          marketValue: 0,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          realizedPnL,
          totalFees,
          latestPriceSource: 'transaction',
          priceUpdatedAt: sorted[sorted.length - 1].timestamp,
          transactions: sorted,
        })
      }
      continue
    }

    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0
    const firstTx = sorted[0]
    const currentPrice = sorted[sorted.length - 1].price
    const marketValue = currentPrice * totalQuantity
    const unrealizedPnL = marketValue - totalCost
    const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0

    holdings.push({
      symbol,
      name: firstTx.name,
      assetType: firstTx.assetType,
      currency: firstTx.currency,
      totalQuantity,
      averageCost,
      totalCost,
      currentPrice,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      realizedPnL,
      totalFees,
      latestPriceSource: 'transaction',
      priceUpdatedAt: sorted[sorted.length - 1].timestamp,
      transactions: sorted,
    })
  }

  return holdings.sort((a, b) => b.marketValue - a.marketValue)
}

export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  const totalUnrealizedPnL = totalMarketValue - totalCost
  const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0
  const totalRealizedPnL = holdings.reduce((sum, h) => sum + h.realizedPnL, 0)
  const totalFees = holdings.reduce((sum, h) => sum + h.totalFees, 0)
  const totalPnL = totalUnrealizedPnL + totalRealizedPnL

  return {
    totalCost,
    totalMarketValue,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    totalRealizedPnL,
    totalFees,
    totalPnL,
    holdingsCount: holdings.filter((h) => h.totalQuantity > 0).length,
    lastUpdated: Date.now(),
  }
}

export function calculateBuildPositionPoints(transactions: Transaction[]): BuildPositionPoint[] {
  const sorted = [...transactions]
    .filter((tx) => tx.type === 'BUY' || tx.type === 'SELL')
    .sort((a, b) => a.timestamp - b.timestamp)

  const points: BuildPositionPoint[] = []
  let cumulativeQuantity = 0
  let totalCost = 0

  for (const tx of sorted) {
    if (tx.type === 'BUY') {
      totalCost += tx.price * tx.quantity
      cumulativeQuantity += tx.quantity
    } else {
      if (cumulativeQuantity > 0) {
        const avgCost = totalCost / cumulativeQuantity
        totalCost -= avgCost * tx.quantity
      }
      cumulativeQuantity -= tx.quantity
    }

    points.push({
      timestamp: tx.timestamp,
      price: tx.price,
      quantity: tx.quantity,
      cumulativeQuantity: Math.max(0, cumulativeQuantity),
      type: tx.type,
      averageCostAtPoint: cumulativeQuantity > 0 ? totalCost / cumulativeQuantity : 0,
    })
  }

  return points
}

export function formatCurrency(value: number, currency = 'CNY'): string {
  const symbols: Record<string, string> = { CNY: '¥', USD: '$', HKD: 'HK$' }
  const symbol = symbols[currency] || '¥'
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1e8) {
    return `${sign}${symbol}${(absValue / 1e8).toFixed(2)}亿`
  }
  if (absValue >= 1e4) {
    return `${sign}${symbol}${(absValue / 1e4).toFixed(2)}万`
  }
  return `${sign}${symbol}${absValue.toFixed(2)}`
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${formatDate(timestamp)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function getPnLColor(value: number): string {
  if (value > 0) return 'text-red-500'
  if (value < 0) return 'text-green-500'
  return 'text-gray-400'
}

export function getPnLBgColor(value: number): string {
  if (value > 0) return 'bg-red-500/10 border-red-500/20'
  if (value < 0) return 'bg-green-500/10 border-green-500/20'
  return 'bg-gray-500/10 border-gray-500/20'
}

export function calculatePortfolioAnalytics(transactions: Transaction[], holdings: Holding[]): PortfolioAnalytics {
  const grouped = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const existing = grouped.get(tx.symbol) || []
    existing.push(tx)
    grouped.set(tx.symbol, existing)
  }

  const closedTrades: { pnl: number; holdingDays: number }[] = []

  for (const [, txs] of grouped) {
    const sorted = [...txs].sort((a, b) => a.timestamp - b.timestamp)
    const buyQueue: { price: number; quantity: number; timestamp: number }[] = []

    for (const tx of sorted) {
      if (tx.type === 'BUY') {
        buyQueue.push({ price: tx.price, quantity: tx.quantity, timestamp: tx.timestamp })
      } else {
        let remaining = tx.quantity
        while (remaining > 0 && buyQueue.length > 0) {
          const front = buyQueue[0]
          const matched = Math.min(remaining, front.quantity)
          const costBasis = front.price * matched
          const sellRevenue = tx.price * matched
          const pnl = sellRevenue - costBasis
          const holdingDays = Math.max(1, Math.floor((tx.timestamp - front.timestamp) / (1000 * 60 * 60 * 24)))
          closedTrades.push({ pnl, holdingDays })
          front.quantity -= matched
          remaining -= matched
          if (front.quantity <= 0) buyQueue.shift()
        }
      }
    }
  }

  const winningTrades = closedTrades.filter((t) => t.pnl > 0)
  const losingTrades = closedTrades.filter((t) => t.pnl < 0)

  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
  const avgWinAmount = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length : 0
  const avgLossAmount = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length) : 0
  const profitLossRatio = avgLossAmount > 0 ? avgWinAmount / avgLossAmount : avgWinAmount > 0 ? Infinity : 0
  const avgHoldingDays = closedTrades.length > 0 ? closedTrades.reduce((s, t) => s + t.holdingDays, 0) / closedTrades.length : 0

  const totalSellVolume = transactions.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.price * t.quantity, 0)
  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0)
  const turnoverRate = totalMarketValue > 0 ? (totalSellVolume / totalMarketValue) * 100 : 0

  const maxConcentration = totalMarketValue > 0
    ? Math.max(...holdings.filter((h) => h.totalQuantity > 0).map((h) => (h.marketValue / totalMarketValue) * 100), 0)
    : 0

  return {
    winRate,
    profitLossRatio,
    avgHoldingDays,
    turnoverRate,
    maxConcentration,
    totalClosedTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWinAmount,
    avgLossAmount,
  }
}
