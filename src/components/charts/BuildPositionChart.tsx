import ReactECharts from 'echarts-for-react'
import type { Holding } from '@/types'
import { calculateBuildPositionPoints, formatDate } from '@/utils/portfolio'

interface Props {
  holding: Holding
}

export default function BuildPositionChart({ holding }: Props) {
  const points = calculateBuildPositionPoints(holding.transactions)

  if (points.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 flex items-center justify-center h-80">
        <p className="text-gray-500 text-sm">暂无交易数据</p>
      </div>
    )
  }

  const buyPoints = points.filter((p) => p.type === 'BUY')

  const maxQuantity = Math.max(...buyPoints.map((p) => p.quantity))
  const minQuantity = Math.min(...buyPoints.map((p) => p.quantity))

  let pyramidType = '均匀建仓'
  if (buyPoints.length >= 2) {
    const firstHalf = buyPoints.slice(0, Math.ceil(buyPoints.length / 2))
    const secondHalf = buyPoints.slice(Math.ceil(buyPoints.length / 2))
    const firstAvg = firstHalf.reduce((s, p) => s + p.quantity, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, p) => s + p.quantity, 0) / secondHalf.length

    if (firstAvg < secondAvg * 0.7) {
      pyramidType = '🔺 正金字塔（稳健加仓）'
    } else if (firstAvg > secondAvg * 1.3) {
      pyramidType = '🔻 倒金字塔（冲动追高）'
    }
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['买入数量', '卖出数量', '持仓均价', '累计持仓'],
      textStyle: { color: '#9ca3af', fontSize: 11 },
      top: 0,
    },
    grid: { left: 60, right: 60, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: points.map((p) => formatDate(p.timestamp)),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6b7280', fontSize: 10, rotate: 30 },
    },
    yAxis: [
      {
        type: 'value',
        name: '价格',
        nameTextStyle: { color: '#6b7280', fontSize: 10 },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937' } },
      },
      {
        type: 'value',
        name: '数量',
        nameTextStyle: { color: '#6b7280', fontSize: 10 },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '买入数量',
        type: 'bar',
        yAxisIndex: 1,
        data: points.map((p) => (p.type === 'BUY' ? p.quantity : 0)),
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const point = buyPoints.find((_, i) => {
              let idx = 0
              for (let j = 0; j < points.length; j++) {
                if (points[j].type === 'BUY') {
                  if (idx === i) return j === params.dataIndex
                  idx++
                }
              }
              return false
            })
            if (!point) return 'rgba(239, 68, 68, 0.4)'
            const ratio = maxQuantity === minQuantity ? 0.5 : (point.quantity - minQuantity) / (maxQuantity - minQuantity)
            return `rgba(239, 68, 68, ${0.3 + ratio * 0.6})`
          },
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 40,
      },
      {
        name: '卖出数量',
        type: 'bar',
        yAxisIndex: 1,
        data: points.map((p) => (p.type === 'SELL' ? -p.quantity : 0)),
        itemStyle: {
          color: 'rgba(34, 197, 94, 0.6)',
          borderRadius: [0, 0, 4, 4],
        },
        barMaxWidth: 40,
      },
      {
        name: '持仓均价',
        type: 'line',
        yAxisIndex: 0,
        data: points.map((p) => p.averageCostAtPoint.toFixed(2)),
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 6,
        itemStyle: { color: '#f59e0b' },
      },
      {
        name: '累计持仓',
        type: 'line',
        yAxisIndex: 1,
        data: points.map((p) => p.cumulativeQuantity),
        lineStyle: { color: '#60a5fa', width: 2 },
        areaStyle: { color: 'rgba(96, 165, 250, 0.08)' },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#60a5fa' },
      },
    ],
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">
          建仓形状 · {holding.name} ({holding.symbol})
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
          {pyramidType}
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 360 }} />
    </div>
  )
}
