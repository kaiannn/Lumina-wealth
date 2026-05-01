import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/portfolio'

interface Props {
  transactions: Transaction[]
}

interface Snapshot {
  date: string
  timestamp: number
  totalCost: number
  totalValue: number
  holdingsCount: number
  events: { type: 'BUY' | 'SELL'; name: string; symbol: string; price: number; quantity: number }[]
  holdings: Map<string, { name: string; qty: number; cost: number; lastPrice: number }>
}

function buildSnapshots(transactions: Transaction[]): Snapshot[] {
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
  if (sorted.length === 0) return []

  const dateSet = new Set(sorted.map((t) => formatDate(t.timestamp)))
  const dates = Array.from(dateSet).sort()

  const holdings = new Map<string, { name: string; qty: number; cost: number; lastPrice: number }>()
  const snapshots: Snapshot[] = []

  for (const date of dates) {
    const dayTxs = sorted.filter((t) => formatDate(t.timestamp) === date)
    const events: Snapshot['events'] = []

    for (const tx of dayTxs) {
      const existing = holdings.get(tx.symbol) || { name: tx.name, qty: 0, cost: 0, lastPrice: tx.price }

      if (tx.type === 'BUY') {
        existing.cost += tx.price * tx.quantity
        existing.qty += tx.quantity
      } else {
        if (existing.qty > 0) {
          const avgCost = existing.cost / existing.qty
          existing.cost -= avgCost * tx.quantity
        }
        existing.qty -= tx.quantity
      }
      existing.lastPrice = tx.price
      holdings.set(tx.symbol, existing)

      events.push({
        type: tx.type,
        name: tx.name,
        symbol: tx.symbol,
        price: tx.price,
        quantity: tx.quantity,
      })
    }

    if (holdings.size > 0) {
      for (const [sym, h] of holdings) {
        if (h.qty <= 0) holdings.delete(sym)
      }
    }

    let totalCost = 0
    let totalValue = 0
    for (const [, h] of holdings) {
      totalCost += h.cost
      totalValue += h.lastPrice * h.qty
    }

    snapshots.push({
      date,
      timestamp: dayTxs[0].timestamp,
      totalCost,
      totalValue,
      holdingsCount: holdings.size,
      events,
      holdings: new Map(holdings),
    })
  }

  return snapshots
}

export default function PortfolioPlayback({ transactions }: Props) {
  const snapshots = useMemo(() => buildSnapshots(transactions), [transactions])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    stop()
    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          stop()
          return prev
        }
        return prev + 1
      })
    }, 1200 / speed)
  }, [snapshots.length, speed, stop])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      play()
    }
  }, [speed, isPlaying, play])

  if (snapshots.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
        <p className="text-gray-500 text-sm">暂无交易数据，无法生成回放</p>
      </div>
    )
  }

  const current = snapshots[currentIndex]
  const visibleSnapshots = snapshots.slice(0, currentIndex + 1)
  const pnl = current.totalValue - current.totalCost
  const pnlPercent = current.totalCost > 0 ? (pnl / current.totalCost) * 100 : 0

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      trigger: 'axis',
    },
    legend: {
      data: ['总市值', '总成本'],
      textStyle: { color: '#9ca3af', fontSize: 11 },
      top: 0,
    },
    grid: { left: 55, right: 20, top: 35, bottom: 30 },
    xAxis: {
      type: 'category',
      data: visibleSnapshots.map((s) => s.date),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10, rotate: visibleSnapshots.length > 6 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: [
      {
        name: '总市值',
        type: 'line',
        data: visibleSnapshots.map((s) => Number(s.totalValue.toFixed(2))),
        lineStyle: { color: '#60a5fa', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(96, 165, 250, 0.15)' },
              { offset: 1, color: 'rgba(96, 165, 250, 0)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#60a5fa' },
        animationDuration: 300,
      },
      {
        name: '总成本',
        type: 'line',
        data: visibleSnapshots.map((s) => Number(s.totalCost.toFixed(2))),
        lineStyle: { color: '#6b7280', width: 1.5, type: 'dashed' },
        symbol: 'none',
        animationDuration: 300,
      },
    ],
  }

  const holdingsArray = Array.from(current.holdings.entries())
    .map(([symbol, h]) => ({
      symbol,
      name: h.name,
      qty: h.qty,
      value: h.lastPrice * h.qty,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">时间轴回放</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600">速度</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                speed === s
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/40 rounded-lg p-3">
          <p className="text-[10px] text-gray-600">日期</p>
          <p className="text-sm font-bold text-gray-200 font-mono">{current.date}</p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3">
          <p className="text-[10px] text-gray-600">总市值</p>
          <p className="text-sm font-bold text-blue-400">{formatCurrency(current.totalValue)}</p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3">
          <p className="text-[10px] text-gray-600">浮动盈亏</p>
          <p className={`text-sm font-bold ${pnl >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {formatCurrency(pnl)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
          </p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3">
          <p className="text-[10px] text-gray-600">持仓数</p>
          <p className="text-sm font-bold text-gray-200">{current.holdingsCount}</p>
        </div>
      </div>

      {current.events.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {current.events.map((ev, i) => (
            <span
              key={i}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                ev.type === 'BUY'
                  ? 'bg-red-500/10 text-red-400 border-red-500/10'
                  : 'bg-green-500/10 text-green-400 border-green-500/10'
              }`}
            >
              {ev.type === 'BUY' ? '买入' : '卖出'} {ev.name} ×{ev.quantity} @{ev.price}
            </span>
          ))}
        </div>
      )}

      <ReactECharts option={chartOption} style={{ height: 260 }} />

      {holdingsArray.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {holdingsArray.map((h) => (
            <div key={h.symbol} className="bg-gray-800/40 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-300">{h.name}</span>
              <span className="text-[10px] text-gray-500 ml-1">{h.qty}股</span>
              <span className="text-[10px] text-gray-400 ml-2">{formatCurrency(h.value)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              stop()
              setCurrentIndex(0)
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              stop()
              setCurrentIndex((prev) => Math.max(0, prev - 1))
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              if (isPlaying) {
                stop()
              } else {
                if (currentIndex >= snapshots.length - 1) setCurrentIndex(0)
                play()
              }
            }}
            className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-amber-400" />
            ) : (
              <Play className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <button
            onClick={() => {
              stop()
              setCurrentIndex((prev) => Math.min(snapshots.length - 1, prev + 1))
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] text-gray-600 font-mono w-20 shrink-0">{snapshots[0]?.date}</span>
          <input
            type="range"
            min={0}
            max={snapshots.length - 1}
            value={currentIndex}
            onChange={(e) => {
              stop()
              setCurrentIndex(Number(e.target.value))
            }}
            className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] text-gray-600 font-mono w-20 text-right shrink-0">{snapshots[snapshots.length - 1]?.date}</span>
        </div>

        <span className="text-[10px] text-gray-600 font-mono">
          {currentIndex + 1}/{snapshots.length}
        </span>
      </div>
    </div>
  )
}
