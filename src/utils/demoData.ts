import type { Transaction, CelebrityHolding } from '@/types'

export const DEMO_TRANSACTIONS = generateDemoTransactions()

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function randomDate(start: Date, end: Date): number {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime()
}

function randomPrice(base: number, volatility: number): number {
  const change = base * volatility * (Math.random() - 0.5) * 2
  return Number((base + change).toFixed(2))
}

function randomQuantity(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateDemoTransactions(): Transaction[] {
  const stocks = [
    { symbol: 'AAPL', name: '苹果公司', basePrice: 175.0, volatility: 0.05 },
    { symbol: 'MSFT', name: '微软公司', basePrice: 420.0, volatility: 0.04 },
    { symbol: 'GOOGL', name: '谷歌', basePrice: 145.0, volatility: 0.06 },
    { symbol: 'TSLA', name: '特斯拉', basePrice: 180.0, volatility: 0.08 },
    { symbol: 'NVDA', name: '英伟达', basePrice: 120.0, volatility: 0.10 },
    { symbol: 'AMZN', name: '亚马逊', basePrice: 180.0, volatility: 0.05 },
    { symbol: 'META', name: 'Meta', basePrice: 480.0, volatility: 0.07 },
    { symbol: 'TSM', name: '台积电', basePrice: 140.0, volatility: 0.04 },
    { symbol: 'BABA', name: '阿里巴巴', basePrice: 75.0, volatility: 0.06 },
    { symbol: 'PDD', name: '拼多多', basePrice: 150.0, volatility: 0.09 },
  ]

  const startDate = new Date(2024, 0, 1)
  const endDate = new Date()
  const transactions: Transaction[] = []

  for (const stock of stocks) {
    let currentPrice = stock.basePrice
    let currentQuantity = 0
    let totalCost = 0
    const transactionCount = Math.floor(Math.random() * 8) + 3
    
    for (let i = 0; i < transactionCount; i++) {
      const timestamp = randomDate(startDate, endDate)
      const price = randomPrice(currentPrice, stock.volatility)
      const quantity = randomQuantity(10, 100)
      const isBuy = Math.random() > 0.4 || currentQuantity === 0
      
      if (isBuy) {
        currentQuantity += quantity
        totalCost += price * quantity
        
        transactions.push({
          id: generateId(),
          assetType: 'STOCK_US',
          symbol: stock.symbol,
          name: stock.name,
          type: 'BUY',
          price,
          quantity,
          commission: Number((price * quantity * 0.001).toFixed(2)),
          tax: Number((price * quantity * 0.001).toFixed(2)),
          currency: 'USD',
          timestamp,
          note: i === 0 ? '首次建仓' : Math.random() > 0.7 ? '加仓' : undefined,
        })
      } else {
        if (currentQuantity > quantity) {
          const avgCost = totalCost / currentQuantity
          currentQuantity -= quantity
          totalCost -= avgCost * quantity
          
          transactions.push({
            id: generateId(),
            assetType: 'STOCK_US',
            symbol: stock.symbol,
            name: stock.name,
            type: 'SELL',
            price,
            quantity,
            commission: Number((price * quantity * 0.001).toFixed(2)),
            tax: Number((price * quantity * 0.001).toFixed(2)),
            currency: 'USD',
            timestamp,
            note: Math.random() > 0.7 ? '部分止盈' : undefined,
          })
        }
      }
      
      currentPrice = price
    }
  }

  const aStocks = [
    { symbol: '000858', name: '五粮液', basePrice: 150.0, volatility: 0.04 },
    { symbol: '600519', name: '贵州茅台', basePrice: 1700.0, volatility: 0.03 },
    { symbol: '000333', name: '美的集团', basePrice: 55.0, volatility: 0.04 },
    { symbol: '002415', name: '海康威视', basePrice: 32.0, volatility: 0.05 },
    { symbol: '300750', name: '宁德时代', basePrice: 180.0, volatility: 0.06 },
  ]

  for (const stock of aStocks) {
    let currentPrice = stock.basePrice
    let currentQuantity = 0
    let totalCost = 0
    const transactionCount = Math.floor(Math.random() * 6) + 2
    
    for (let i = 0; i < transactionCount; i++) {
      const timestamp = randomDate(startDate, endDate)
      const price = randomPrice(currentPrice, stock.volatility)
      const quantity = randomQuantity(100, 1000)
      const isBuy = Math.random() > 0.5 || currentQuantity === 0
      
      if (isBuy) {
        currentQuantity += quantity
        totalCost += price * quantity
        
        transactions.push({
          id: generateId(),
          assetType: 'STOCK_CN',
          symbol: stock.symbol,
          name: stock.name,
          type: 'BUY',
          price,
          quantity,
          commission: Number((price * quantity * 0.0003).toFixed(2)),
          tax: Number((price * quantity * 0.001).toFixed(2)),
          currency: 'CNY',
          timestamp,
          note: i === 0 ? '建仓' : Math.random() > 0.7 ? '金字塔加仓' : undefined,
        })
      } else {
        if (currentQuantity > quantity) {
          const avgCost = totalCost / currentQuantity
          currentQuantity -= quantity
          totalCost -= avgCost * quantity
          
          transactions.push({
            id: generateId(),
            assetType: 'STOCK_CN',
            symbol: stock.symbol,
            name: stock.name,
            type: 'SELL',
            price,
            quantity,
            commission: Number((price * quantity * 0.0003).toFixed(2)),
            tax: Number((price * quantity * 0.001).toFixed(2)),
            currency: 'CNY',
            timestamp,
            note: Math.random() > 0.7 ? '减仓' : undefined,
          })
        }
      }
      
      currentPrice = price
    }
  }

  const crypto = [
    { symbol: 'BTC', name: '比特币', basePrice: 45000, volatility: 0.08 },
    { symbol: 'ETH', name: '以太坊', basePrice: 2500, volatility: 0.10 },
    { symbol: 'SOL', name: 'Solana', basePrice: 100, volatility: 0.15 },
  ]

  for (const coin of crypto) {
    let currentPrice = coin.basePrice
    let currentQuantity = 0
    let totalCost = 0
    const transactionCount = Math.floor(Math.random() * 5) + 2
    
    for (let i = 0; i < transactionCount; i++) {
      const timestamp = randomDate(startDate, endDate)
      const price = randomPrice(currentPrice, coin.volatility)
      const quantity = randomQuantity(0.1, 2)
      const isBuy = Math.random() > 0.6 || currentQuantity === 0
      
      if (isBuy) {
        currentQuantity += quantity
        totalCost += price * quantity
        
        transactions.push({
          id: generateId(),
          assetType: 'CRYPTO',
          symbol: coin.symbol,
          name: coin.name,
          type: 'BUY',
          price,
          quantity,
          commission: Number((price * quantity * 0.001).toFixed(2)),
          tax: 0,
          currency: 'USD',
          timestamp,
          note: i === 0 ? '首次买入' : Math.random() > 0.7 ? '定投' : undefined,
        })
      } else {
        if (currentQuantity > quantity) {
          const avgCost = totalCost / currentQuantity
          currentQuantity -= quantity
          totalCost -= avgCost * quantity
          
          transactions.push({
            id: generateId(),
            assetType: 'CRYPTO',
            symbol: coin.symbol,
            name: coin.name,
            type: 'SELL',
            price,
            quantity,
            commission: Number((price * quantity * 0.001).toFixed(2)),
            tax: 0,
            currency: 'USD',
            timestamp,
            note: Math.random() > 0.7 ? '获利了结' : undefined,
          })
        }
      }
      
      currentPrice = price
    }
  }

  return transactions.sort((a, b) => a.timestamp - b.timestamp)
}

export function getDemoSummary() {
  const transactions = generateDemoTransactions()
  
  const holdings = new Map<string, {
    symbol: string
    name: string
    totalQuantity: number
    totalCost: number
    currentPrice: number
    marketValue: number
    unrealizedPnL: number
    unrealizedPnLPercent: number
  }>()
  
  for (const tx of transactions) {
    const existing = holdings.get(tx.symbol) || {
      symbol: tx.symbol,
      name: tx.name,
      totalQuantity: 0,
      totalCost: 0,
      currentPrice: tx.price,
      marketValue: 0,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
    }
    
    if (tx.type === 'BUY') {
      existing.totalQuantity += tx.quantity
      existing.totalCost += tx.price * tx.quantity
    } else {
      if (existing.totalQuantity > 0) {
        const avgCost = existing.totalCost / existing.totalQuantity
        existing.totalCost -= avgCost * tx.quantity
      }
      existing.totalQuantity -= tx.quantity
    }
    
    existing.currentPrice = tx.price
    holdings.set(tx.symbol, existing)
  }
  
  for (const [symbol, holding] of holdings) {
    if (holding.totalQuantity > 0) {
      holding.marketValue = holding.currentPrice * holding.totalQuantity
      holding.unrealizedPnL = holding.marketValue - holding.totalCost
      holding.unrealizedPnLPercent = holding.totalCost > 0 ? (holding.unrealizedPnL / holding.totalCost) * 100 : 0
    } else {
      holdings.delete(symbol)
    }
  }
  
  const totalCost = Array.from(holdings.values()).reduce((sum, h) => sum + h.totalCost, 0)
  const totalMarketValue = Array.from(holdings.values()).reduce((sum, h) => sum + h.marketValue, 0)
  const totalUnrealizedPnL = totalMarketValue - totalCost
  const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0
  
  return {
    transactions,
    holdings: Array.from(holdings.values()),
    summary: {
      totalCost,
      totalMarketValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      holdingsCount: holdings.size,
      lastUpdated: Date.now(),
    },
  }
}

export const DEMO_CELEBRITY_HOLDINGS: CelebrityHolding[] = [
  {
    id: 'warren-buffett-2024q1',
    name: '沃伦·巴菲特',
    source: '伯克希尔哈撒韦 13F',
    reportDate: '2024-03-31',
    holdings: [
      { symbol: 'AAPL', name: '苹果公司', shares: 905560000, value: 156000000000, portfolioPercent: 40.2, changePercent: -1.2 },
      { symbol: 'BAC', name: '美国银行', shares: 1025000000, value: 34000000000, portfolioPercent: 8.8, changePercent: 0 },
      { symbol: 'AXP', name: '美国运通', shares: 151610000, value: 28000000000, portfolioPercent: 7.2, changePercent: 0 },
      { symbol: 'KO', name: '可口可乐', shares: 400000000, value: 24000000000, portfolioPercent: 6.2, changePercent: 0 },
      { symbol: 'CVX', name: '雪佛龙', shares: 126093119, value: 19000000000, portfolioPercent: 4.9, changePercent: -0.3 },
      { symbol: 'OXY', name: '西方石油', shares: 243724146, value: 14000000000, portfolioPercent: 3.6, changePercent: 0.5 },
      { symbol: 'KHC', name: '卡夫亨氏', shares: 325634818, value: 11000000000, portfolioPercent: 2.8, changePercent: 0 },
      { symbol: 'MCO', name: '穆迪', shares: 24669778, value: 9000000000, portfolioPercent: 2.3, changePercent: 0 },
      { symbol: 'V', name: 'Visa', shares: 8280000, value: 2000000000, portfolioPercent: 0.5, changePercent: 0 },
      { symbol: 'MA', name: '万事达卡', shares: 396466, value: 150000000, portfolioPercent: 0.04, changePercent: 0 },
    ],
  },
  {
    id: 'cathie-wood-2024q1',
    name: '凯西·伍德',
    source: 'ARK Invest 13F',
    reportDate: '2024-03-31',
    holdings: [
      { symbol: 'TSLA', name: '特斯拉', shares: 8500000, value: 1500000000, portfolioPercent: 9.8, changePercent: -2.1 },
      { symbol: 'COIN', name: 'Coinbase', shares: 11000000, value: 1200000000, portfolioPercent: 7.8, changePercent: 3.2 },
      { symbol: 'ROKU', name: 'Roku', shares: 15000000, value: 900000000, portfolioPercent: 5.9, changePercent: -1.5 },
      { symbol: 'SQ', name: 'Block', shares: 12000000, value: 800000000, portfolioPercent: 5.2, changePercent: 0.8 },
      { symbol: 'ZM', name: 'Zoom', shares: 8000000, value: 500000000, portfolioPercent: 3.3, changePercent: -0.7 },
      { symbol: 'TDOC', name: 'Teladoc', shares: 10000000, value: 400000000, portfolioPercent: 2.6, changePercent: 0 },
      { symbol: 'U', name: 'Unity', shares: 6000000, value: 300000000, portfolioPercent: 2.0, changePercent: -0.5 },
      { symbol: 'HOOD', name: 'Robinhood', shares: 15000000, value: 250000000, portfolioPercent: 1.6, changePercent: 1.2 },
      { symbol: 'PATH', name: 'UiPath', shares: 5000000, value: 200000000, portfolioPercent: 1.3, changePercent: 0.3 },
      { symbol: 'TWLO', name: 'Twilio', shares: 3000000, value: 150000000, portfolioPercent: 1.0, changePercent: -0.2 },
    ],
  },
  {
    id: 'ray-dalio-2024q1',
    name: '瑞·达利欧',
    source: '桥水基金 13F',
    reportDate: '2024-03-31',
    holdings: [
      { symbol: 'SPY', name: '标普500 ETF', shares: 2500000, value: 1200000000, portfolioPercent: 12.5, changePercent: 0.5 },
      { symbol: 'VTI', name: '全市场 ETF', shares: 1800000, value: 450000000, portfolioPercent: 4.7, changePercent: 0.2 },
      { symbol: 'QQQ', name: '纳斯达克 ETF', shares: 800000, value: 350000000, portfolioPercent: 3.6, changePercent: 1.1 },
      { symbol: 'GLD', name: '黄金 ETF', shares: 1200000, value: 220000000, portfolioPercent: 2.3, changePercent: 0.8 },
      { symbol: 'TLT', name: '长期国债 ETF', shares: 1000000, value: 90000000, portfolioPercent: 0.9, changePercent: -0.3 },
      { symbol: 'IWM', name: '小盘股 ETF', shares: 600000, value: 120000000, portfolioPercent: 1.3, changePercent: 0.1 },
      { symbol: 'EEM', name: '新兴市场 ETF', shares: 1500000, value: 60000000, portfolioPercent: 0.6, changePercent: -0.2 },
      { symbol: 'VNQ', name: '房地产 ETF', shares: 500000, value: 40000000, portfolioPercent: 0.4, changePercent: 0 },
      { symbol: 'DBC', name: '商品 ETF', shares: 1000000, value: 20000000, portfolioPercent: 0.2, changePercent: 0.1 },
      { symbol: 'BND', name: '债券 ETF', shares: 300000, value: 25000000, portfolioPercent: 0.3, changePercent: 0 },
    ],
  },
  {
    id: 'duan-yongping-2024q1',
    name: '段永平',
    source: '公开持仓',
    reportDate: '2024-03-31',
    holdings: [
      { symbol: 'AAPL', name: '苹果公司', shares: 5000000, value: 850000000, portfolioPercent: 65.0, changePercent: 0 },
      { symbol: 'BRK.B', name: '伯克希尔B股', shares: 2000000, value: 350000000, portfolioPercent: 26.8, changePercent: 0 },
      { symbol: 'GOOGL', name: '谷歌', shares: 500000, value: 70000000, portfolioPercent: 5.4, changePercent: 0 },
      { symbol: 'TSM', name: '台积电', shares: 300000, value: 42000000, portfolioPercent: 3.2, changePercent: 0 },
      { symbol: 'META', name: 'Meta', shares: 100000, value: 48000000, portfolioPercent: 3.7, changePercent: 0 },
      { symbol: 'PDD', name: '拼多多', shares: 200000, value: 30000000, portfolioPercent: 2.3, changePercent: 0 },
      { symbol: 'NIO', name: '蔚来', shares: 500000, value: 4000000, portfolioPercent: 0.3, changePercent: 0 },
      { symbol: 'BABA', name: '阿里巴巴', shares: 100000, value: 7500000, portfolioPercent: 0.6, changePercent: 0 },
      { symbol: 'JD', name: '京东', shares: 50000, value: 1500000, portfolioPercent: 0.1, changePercent: 0 },
      { symbol: 'TCEHY', name: '腾讯', shares: 20000, value: 600000, portfolioPercent: 0.05, changePercent: 0 },
    ],
  },
]