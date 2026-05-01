import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types'
import { formatDate, formatCurrency } from '@/utils/portfolio'

interface Props {
  transactions: Transaction[]
}

export default function TradeMarkChart({ transactions }: Props) {
  const symbolMap = new Map<string, { name: string; txs: Transaction[] }>()
  for (const tx of transactions) {
    const existing = symbolMap.get(tx.symbol)
    if (existing) {
      existing.txs.push(tx)
    } else {
      symbolMap.set(tx.symbol, { name: tx.name, txs: [tx] })
    }
  }

  const symbols = Array.from(symbolMap.entries())
    .filter(([, v]) => v.txs.length >= 1)
    .sort((a, b) => b[1].txs.length - a[1].txs.length)

  const [selected, setSelected] = useState<string>(symbols[0]?.[0] || '')

  if (symbols.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
        <p className="text-gray-500 text-sm">暂无交易数据</p>
      </div>
    )
  }

  const data = symbolMap.get(selected)
  if (!data) return null

  const sortedTxs = [...data.txs].sort((a, b) => a.timestamp - b.timestamp)

  const allDates = sortedTxs.map((tx) => formatDate(tx.timestamp))
  const uniqueDates = [...new Set(allDates)]

  const minPrice = Math.min(...sortedTxs.map((t) => t.price))
  const maxPrice = Math.max(...sortedTxs.map((t) => t.price))
  const priceRange = maxPrice - minPrice || maxPrice * 0.1
  const pricePadding = priceRange * 0.15

  let cumQty = 0
  let cumCost = 0
  const avgCostLine: (number | null)[] = []

  for (const date of uniqueDates) {
    const dayTxs = sortedTxs.filter((t) => formatDate(t.timestamp) === date)
    for (const tx of dayTxs) {
      if (tx.type === 'BUY') {
        cumCost += tx.price * tx.quantity
        cumQty += tx.quantity
      } else {
        if (cumQty > 0) {
          const avg = cumCost / cumQty
          cumCost -= avg * tx.quantity
        }
        cumQty -= tx.quantity
      }
    }
    avgCostLine.push(cumQty > 0 ? Number((cumCost / cumQty).toFixed(2)) : null)
  }

  const buyScatter = sortedTxs
    .filter((t) => t.type === 'BUY')
    .map((tx) => ({
      value: [formatDate(tx.timestamp), tx.price],
      quantity: tx.quantity,
      amount: tx.price * tx.quantity,
      currency: tx.currency,
      symbolSize: Math.max(14, Math.min(40, Math.sqrt(tx.quantity) * 4)),
    }))

  const sellScatter = sortedTxs
    .filter((t) => t.type === 'SELL')
    .map((tx) => ({
      value: [formatDate(tx.timestamp), tx.price],
      quantity: tx.quantity,
      amount: tx.price * tx.quantity,
      currency: tx.currency,
      symbolSize: Math.max(14, Math.min(40, Math.sqrt(tx.quantity) * 4)),
    }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      trigger: 'item',
      formatter: (params: {
        seriesName: string
        value: [string, number]
        data: { quantity: number; amount: number; currency: string }
      }) => {
        if (params.seriesName === '持仓均价') {
          return `<div>持仓均价: ${params.value[1]}</div><div style="color:#6b7280;font-size:11px">${params.value[0]}</div>`
        }
        const isBuy = params.seriesName === '买入'
        const color = isBuy ? '#ef4444' : '#22c55e'
        const label = isBuy ? '买入' : '卖出'
        return `<div style="font-weight:600;color:${color}">${label}</div>
                <div style="margin-top:4px">价格: ${formatCurrency(params.value[1], params.data.currency)}</div>
                <div>数量: ${params.data.quantity}</div>
                <div>金额: ${formatCurrency(params.data.amount, params.data.currency)}</div>
                <div style="color:#6b7280;font-size:11px;margin-top:2px">${params.value[0]}</div>`
      },
    },
    legend: {
      data: ['买入', '卖出', '持仓均价'],
      textStyle: { color: '#9ca3af', fontSize: 11 },
      top: 0,
      right: 0,
    },
    grid: { left: 55, right: 20, top: 45, bottom: 40 },
    xAxis: {
      type: 'category',
      data: uniqueDates,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10, rotate: uniqueDates.length > 8 ? 30 : 0 },
      axisTick: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      min: Math.floor(minPrice - pricePadding),
      max: Math.ceil(maxPrice + pricePadding),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: [
      {
        name: '持仓均价',
        type: 'line',
        data: avgCostLine,
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        symbol: 'none',
        z: 1,
      },
      {
        name: '买入',
        type: 'scatter',
        data: buyScatter,
        symbolSize: (data: { symbolSize: number }) => data.symbolSize,
        itemStyle: {
          color: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(239, 68, 68, 0.3)',
        },
        symbol: 'triangle',
        z: 10,
      },
      {
        name: '卖出',
        type: 'scatter',
        data: sellScatter,
        symbolSize: (data: { symbolSize: number }) => data.symbolSize,
        itemStyle: {
          color: 'rgba(34, 197, 94, 0.8)',
          borderColor: '#22c55e',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(34, 197, 94, 0.3)',
        },
        symbol: 'path://M0,0L8,16L-8,16Z',
        z: 10,
      },
      {
        name: '价格区间',
        type: 'line',
        data: uniqueDates.map(() => null),
        markArea: {
          silent: true,
          data: [
            [
              {
                yAxis: minPrice,
                itemStyle: { color: 'rgba(245, 158, 11, 0.03)' },
              },
              { yAxis: maxPrice },
            ],
          ],
        },
      },
    ],
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">买卖点标注</h3>
        <div className="flex flex-wrap gap-1.5">
          {symbols.map(([sym, val]) => (
            <button
              key={sym}
              onClick={() => setSelected(sym)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selected === sym
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 hover:text-gray-300'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-500" />
          <span className="text-[10px] text-gray-500">买入（越大 = 数量越多）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-green-500" />
          <span className="text-[10px] text-gray-500">卖出</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px border-t-2 border-dashed border-amber-500" />
          <span className="text-[10px] text-gray-500">持仓均价</span>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: 380 }} />
    </div>
  )
}
