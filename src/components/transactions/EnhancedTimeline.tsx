import { useState, useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/portfolio'

interface Props {
  transactions: Transaction[]
}

function computeCumulativeAvg(grouped: Map<string, Transaction[]>) {
  let cumulativeCost = 0
  let cumulativeQty = 0
  return Array.from(grouped.entries()).reverse().map(([, txs]) => {
    for (const tx of txs) {
      if (tx.type === 'BUY') {
        cumulativeCost += tx.price * tx.quantity
        cumulativeQty += tx.quantity
      } else if (cumulativeQty > 0) {
        const avg = cumulativeCost / cumulativeQty
        cumulativeCost -= avg * tx.quantity
        cumulativeQty -= tx.quantity
      }
    }
    return cumulativeQty > 0 ? Number((cumulativeCost / cumulativeQty).toFixed(2)) : null
  })
}

function computeCostAnalyses(symbolMap: Map<string, Transaction[]>) {
  return Array.from(symbolMap.entries()).map(([symbol, txs]) => {
    const sortedTxs = [...txs].sort((a, b) => a.timestamp - b.timestamp)
    let totalBuyQty = 0
    let totalSellQty = 0
    let totalCost = 0
    let currentQty = 0
    let maxPrice = 0
    let minPrice = Infinity
    let realizedPnL = 0
    
    for (const tx of sortedTxs) {
      if (tx.price > maxPrice) maxPrice = tx.price
      if (tx.price < minPrice) minPrice = tx.price
      
      if (tx.type === 'BUY') {
        totalBuyQty += tx.quantity
        totalCost += tx.price * tx.quantity
        currentQty += tx.quantity
      } else {
        totalSellQty += tx.quantity
        if (currentQty > 0) {
          const avgCost = totalCost / currentQty
          const sellRevenue = tx.price * tx.quantity
          const costBasis = avgCost * tx.quantity
          realizedPnL += sellRevenue - costBasis
          totalCost -= avgCost * tx.quantity
        }
        currentQty -= tx.quantity
      }
    }
    
    const avgCost = currentQty > 0 ? totalCost / currentQty : 0
    const currentPrice = sortedTxs[sortedTxs.length - 1]?.price || avgCost
    const marketValue = currentQty * currentPrice
    const unrealizedPnL = marketValue - totalCost
    const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0
    
    const costDeviation: 'low' | 'medium' | 'high' =
      currentPrice < avgCost * 0.8 ? 'high' :
      currentPrice < avgCost * 0.95 ? 'medium' : 'low'
    
    return {
      symbol,
      name: txs[0].name,
      totalBuyQty,
      totalSellQty,
      currentQty,
      totalCost,
      avgCost,
      currentPrice,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      realizedPnL,
      totalPnL: unrealizedPnL + realizedPnL,
      maxPrice,
      minPrice,
      costDeviation,
    }
  })
}

export default function EnhancedTimeline({ transactions }: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  
  const sorted = useMemo(() => [...transactions].sort((a, b) => b.timestamp - a.timestamp), [transactions])
  
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of sorted) {
      const dateKey = formatDate(tx.timestamp)
      const existing = map.get(dateKey) || []
      existing.push(tx)
      map.set(dateKey, existing)
    }
    return map
  }, [sorted])
  
  const symbolMap = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of transactions) {
      const existing = map.get(tx.symbol) || []
      existing.push(tx)
      map.set(tx.symbol, existing)
    }
    return map
  }, [transactions])
  
  const costAnalyses = useMemo(() => computeCostAnalyses(symbolMap), [symbolMap])
  
  const selectedAnalysis = selectedSymbol ? costAnalyses.find(a => a.symbol === selectedSymbol) : null
  
  const cumulativeAvgData = useMemo(() => computeCumulativeAvg(grouped), [grouped])

  const timelineChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      trigger: 'axis',
    },
    legend: {
      data: ['累计均价', '价格线', '买入点', '卖出点'],
      textStyle: { color: '#9ca3af', fontSize: 11 },
      top: 0,
    },
    grid: { left: 55, right: 20, top: 35, bottom: 30 },
    xAxis: {
      type: 'category',
      data: Array.from(grouped.keys()).reverse(),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: [
      {
        name: '累计均价',
        type: 'line',
        data: cumulativeAvgData,
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        symbol: 'none',
      },
      {
        name: '价格线',
        type: 'line',
        data: Array.from(grouped.entries()).reverse().map(([, txs]) => {
          const lastTx = txs[txs.length - 1]
          return lastTx ? lastTx.price : null
        }),
        lineStyle: { color: '#60a5fa', width: 2 },
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#60a5fa' },
      },
      {
        name: '买入点',
        type: 'scatter',
        data: Array.from(grouped.entries()).reverse().flatMap(([date, txs]) =>
          txs
            .filter(tx => tx.type === 'BUY')
            .map(tx => ({
              value: [date, tx.price],
              quantity: tx.quantity,
            }))
        ),
        symbolSize: (data: { quantity: number }) => Math.max(8, Math.min(20, data.quantity / 100)),
        itemStyle: {
          color: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 1,
        },
        symbol: 'triangle',
      },
      {
        name: '卖出点',
        type: 'scatter',
        data: Array.from(grouped.entries()).reverse().flatMap(([date, txs]) =>
          txs
            .filter(tx => tx.type === 'SELL')
            .map(tx => ({
              value: [date, tx.price],
              quantity: tx.quantity,
            }))
        ),
        symbolSize: (data: { quantity: number }) => Math.max(8, Math.min(20, data.quantity / 100)),
        itemStyle: {
          color: 'rgba(34, 197, 94, 0.8)',
          borderColor: '#22c55e',
          borderWidth: 1,
        },
        symbol: 'path://M0,0L8,16L-8,16Z',
      },
    ],
  }
  
  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">暂无交易记录</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">时间轴可视化</h3>
                <p className="text-[10px] text-gray-600 mt-0.5">交易行为回放，不代表真实净值曲线。价格基于成交价，非实时行情。</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-500" />
                  <span className="text-[10px] text-gray-500">买入</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-green-500" />
                  <span className="text-[10px] text-gray-500">卖出</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-px border-t-2 border-dashed border-amber-500" />
                  <span className="text-[10px] text-gray-500">累计均价</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-px border-t-2 border-blue-500" />
                  <span className="text-[10px] text-gray-500">价格</span>
                </div>
              </div>
            </div>
            <ReactECharts option={timelineChartOption} style={{ height: 320 }} />
          </div>
          
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">详细交易时间轴</h3>
            <div className="relative">
              <div className="absolute left-[120px] top-0 bottom-0 w-px bg-gray-800" />
              <div className="space-y-6">
                {Array.from(grouped.entries()).map(([date, txs]) => {
                  const dayBuyTotal = txs.filter((t) => t.type === 'BUY').reduce((s, t) => s + t.price * t.quantity, 0)
                  const daySellTotal = txs.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.price * t.quantity, 0)
                  const dayCashFlow = daySellTotal - dayBuyTotal
                  
                  return (
                    <div key={date} className="relative flex gap-6">
                      <div className="w-[120px] shrink-0 text-right pr-4 pt-1">
                        <p className="text-xs font-medium text-gray-400">{date}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{txs.length} 笔交易</p>
                        {dayCashFlow !== 0 && (
                          <p className={`text-[10px] mt-0.5 ${dayCashFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {dayCashFlow > 0 ? '+' : ''}{formatCurrency(dayCashFlow)}
                          </p>
                        )}
                      </div>
                      
                      <div className="absolute left-[120px] top-2 -translate-x-1/2">
                        <div className="w-3 h-3 rounded-full bg-gray-800 border-2 border-amber-500/60" />
                      </div>
                      
                      <div className="flex-1 pl-6 space-y-2">
                        {dayBuyTotal > 0 || daySellTotal > 0 ? (
                          <div className="flex items-center gap-3 mb-2">
                            {dayBuyTotal > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10">
                                买入 {formatCurrency(dayBuyTotal)}
                              </span>
                            )}
                            {daySellTotal > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/10">
                                卖出 {formatCurrency(daySellTotal)}
                              </span>
                            )}
                          </div>
                        ) : null}
                        
                        {txs.map((tx) => {
                          const time = new Date(tx.timestamp)
                          const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
                          const isBuy = tx.type === 'BUY'
                          
                          return (
                            <div
                              key={tx.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:scale-[1.01] ${
                                isBuy
                                  ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30'
                                  : 'bg-green-500/5 border-green-500/10 hover:border-green-500/30'
                              }`}
                              onClick={() => setSelectedSymbol(tx.symbol)}
                            >
                              <div className={`p-1.5 rounded-lg ${isBuy ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                {isBuy ? (
                                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-200">{tx.name}</span>
                                  <span className="text-xs text-gray-500">{tx.symbol}</span>
                                  <span className="text-[10px] text-gray-600 ml-auto font-mono">{timeStr}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {formatCurrency(tx.price, tx.currency)} × {tx.quantity}
                                  </span>
                                  <span className={`text-xs font-medium ${isBuy ? 'text-red-400' : 'text-green-400'}`}>
                                    {isBuy ? '-' : '+'}{formatCurrency(tx.price * tx.quantity, tx.currency)}
                                  </span>
                                  {tx.note && (
                                    <span className="text-[10px] text-gray-600 truncate max-w-[200px]">
                                      {tx.note}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">持仓成本分析</h3>
            <div className="space-y-3">
              {costAnalyses
                .sort((a, b) => Math.abs(b.unrealizedPnLPercent) - Math.abs(a.unrealizedPnLPercent))
                .map((analysis) => (
                  <div
                    key={analysis.symbol}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedSymbol === analysis.symbol
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-800/40 border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => setSelectedSymbol(analysis.symbol)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-200">{analysis.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{analysis.symbol}</span>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        analysis.costDeviation === 'high' ? 'bg-red-500/20 text-red-400' :
                        analysis.costDeviation === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {analysis.costDeviation === 'high' ? '高偏离' : 
                         analysis.costDeviation === 'medium' ? '中偏离' : '低偏离'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <p className="text-gray-600">持仓数量</p>
                        <p className="text-gray-300 font-mono">{analysis.currentQty.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">平均成本</p>
                        <p className="text-gray-300 font-mono">{formatCurrency(analysis.avgCost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">当前价格</p>
                        <p className="text-gray-300 font-mono">{formatCurrency(analysis.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">浮动盈亏</p>
                        <p className={`font-mono ${analysis.unrealizedPnL >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {formatCurrency(analysis.unrealizedPnL)} ({analysis.unrealizedPnLPercent >= 0 ? '+' : ''}{analysis.unrealizedPnLPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-600">价格区间</span>
                        <span className="text-gray-400">
                          {formatCurrency(analysis.minPrice)} - {formatCurrency(analysis.maxPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {selectedAnalysis && (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                {selectedAnalysis.name} ({selectedAnalysis.symbol}) 详细分析
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">成本偏离度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedAnalysis.costDeviation === 'high' ? 'bg-red-500' :
                          selectedAnalysis.costDeviation === 'medium' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.abs(selectedAnalysis.unrealizedPnLPercent) * 2)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      selectedAnalysis.unrealizedPnLPercent >= 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {selectedAnalysis.unrealizedPnLPercent >= 0 ? '+' : ''}{selectedAnalysis.unrealizedPnLPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/40 rounded-lg p-2">
                    <p className="text-[10px] text-gray-600">买入总数量</p>
                    <p className="text-sm font-bold text-gray-200">{selectedAnalysis.totalBuyQty.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2">
                    <p className="text-[10px] text-gray-600">卖出总数量</p>
                    <p className="text-sm font-bold text-gray-200">{selectedAnalysis.totalSellQty.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2">
                    <p className="text-[10px] text-gray-600">总成本</p>
                    <p className="text-sm font-bold text-gray-200">{formatCurrency(selectedAnalysis.totalCost)}</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2">
                    <p className="text-[10px] text-gray-600">当前市值</p>
                    <p className="text-sm font-bold text-blue-400">{formatCurrency(selectedAnalysis.marketValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                  <div className="bg-gray-800/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600">未实现收益</p>
                    <p className={`text-xs font-bold ${selectedAnalysis.unrealizedPnL >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(selectedAnalysis.unrealizedPnL)}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600">已实现收益</p>
                    <p className={`text-xs font-bold ${selectedAnalysis.realizedPnL >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(selectedAnalysis.realizedPnL)}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600">总收益</p>
                    <p className={`text-xs font-bold ${selectedAnalysis.totalPnL >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(selectedAnalysis.totalPnL)}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">成本压力提示</p>
                  <p className="text-xs text-gray-400">
                    {selectedAnalysis.costDeviation === 'high' 
                      ? '当前价格显著低于持仓成本（偏离 >20%），成本压力较大，建议关注市场变化。'
                      : selectedAnalysis.costDeviation === 'medium'
                      ? '当前价格略低于持仓成本（偏离 5~20%），存在一定成本压力。'
                      : '当前价格高于或接近持仓成本，成本压力较小。'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}