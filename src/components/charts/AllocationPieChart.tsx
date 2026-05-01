import ReactECharts from 'echarts-for-react'
import type { Holding } from '@/types'

interface Props {
  holdings: Holding[]
}

export default function AllocationPieChart({ holdings }: Props) {
  if (holdings.length === 0) return null

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)

  const data = holdings.map((h) => ({
    name: h.name,
    value: Number(h.marketValue.toFixed(2)),
    percent: ((h.marketValue / totalValue) * 100).toFixed(1),
  }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      formatter: (params: { name: string; value: number; data: { percent: string } }) => {
        return `<div style="font-weight:600">${params.name}</div>
                <div>¥${params.value.toLocaleString()}</div>
                <div>${params.data.percent}%</div>`
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'rgba(17, 24, 39, 0.8)',
          borderWidth: 2,
        },
        label: {
          show: true,
          color: '#9ca3af',
          fontSize: 11,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: { color: '#4b5563' },
        },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' },
        },
        data,
        color: [
          '#f59e0b', '#60a5fa', '#a78bfa', '#34d399',
          '#f472b6', '#fb923c', '#38bdf8', '#c084fc',
          '#4ade80', '#fbbf24',
        ],
      },
    ],
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">持仓占比</h3>
      <ReactECharts option={option} style={{ height: 320 }} />
    </div>
  )
}
