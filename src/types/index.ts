export type TransactionType = 'BUY' | 'SELL'

export type AssetType = 'STOCK_CN' | 'STOCK_US' | 'FUND' | 'CRYPTO' | 'BOND' | 'CASH'

export type Currency = 'CNY' | 'USD' | 'HKD'

export interface Transaction {
  id: string
  assetType: AssetType
  symbol: string
  name: string
  type: TransactionType
  price: number
  quantity: number
  commission: number
  tax: number
  currency: Currency
  timestamp: number
  note?: string
}

export interface Holding {
  symbol: string
  name: string
  assetType: AssetType
  currency: Currency
  totalQuantity: number
  averageCost: number
  totalCost: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  realizedPnL: number
  totalFees: number
  latestPriceSource: 'transaction' | 'market'
  priceUpdatedAt: number
  transactions: Transaction[]
}

export interface PortfolioSummary {
  totalCost: number
  totalMarketValue: number
  totalUnrealizedPnL: number
  totalUnrealizedPnLPercent: number
  totalRealizedPnL: number
  totalFees: number
  totalPnL: number
  holdingsCount: number
  lastUpdated: number
}

export interface BuildPositionPoint {
  timestamp: number
  price: number
  quantity: number
  cumulativeQuantity: number
  type: TransactionType
  averageCostAtPoint: number
}

export interface CelebrityHolding {
  id: string
  name: string
  source: string
  reportDate: string
  holdings: CelebrityPosition[]
  /** SEC CIK when sourced from EDGAR 13F */
  cik?: string
  sourceUrl?: string
  metrics?: CelebrityPortfolioMetrics
  quarterDelta?: CelebrityQuarterDelta
  /** Total long line items in the filing (holdings may be truncated to top N) */
  fullPositionCount?: number
}

export interface CelebrityPosition {
  symbol: string
  name: string
  shares: number
  value: number
  portfolioPercent: number
  changePercent?: number
  /** SEC CUSIP (13F identifier; symbol is best-effort mapped) */
  cusip?: string
}

export interface CelebrityPortfolioMetrics {
  top1Weight: number
  top3Weight: number
  top5Weight: number
  hhi: number
  effectiveHoldings: number
  entropyBits: number
  maxEntropyBits: number
  normalizedEntropy: number
}

export interface CelebrityQuarterDelta {
  from: string
  to: string
  weightTurnoverPct: number
  nAdded: number
  nRemoved: number
  added: string[]
  removed: string[]
}

export interface PortfolioAnalytics {
  winRate: number
  profitLossRatio: number
  avgHoldingDays: number
  turnoverRate: number
  maxConcentration: number
  totalClosedTrades: number
  winningTrades: number
  losingTrades: number
  avgWinAmount: number
  avgLossAmount: number
}
