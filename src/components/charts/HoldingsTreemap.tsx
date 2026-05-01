import ReactECharts from 'echarts-for-react'
import type { Holding, AssetType } from '@/types'

interface Props {
  holdings: Holding[]
}

const ASSET_UNIT: Record<AssetType, string> = {
  STOCK_CN: '股',
  STOCK_US: '股',
  FUND: '份',
  CRYPTO: '枚',
  BOND: '张',
  CASH: '',
}

export default function HoldingsTreemap({ holdings }: Props) {
  if (holdings.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 flex items-center justify-center h-80">
        <p className="text-gray-500 text-sm">暂无持仓数据</p>
      </div>
    )
  }

  const data = holdings.filter((h) => h.totalQuantity > 0).map((h) => ({
    name: `${h.name}\n${h.symbol}`,
    value: h.marketValue,
    pnlPercent: h.unrealizedPnLPercent,
    quantity: h.totalQuantity,
    unit: ASSET_UNIT[h.assetType] || '份',
    itemStyle: {
      color: h.unrealizedPnLPercent >= 0
        ? `rgba(239, 68, 68, ${Math.min(0.9, 0.3 + Math.abs(h.unrealizedPnLPercent) / 50)})`
        : `rgba(34, 197, 94, ${Math.min(0.9, 0.3 + Math.abs(h.unrealizedPnLPercent) / 50)})`,
      borderColor: 'rgba(17, 24, 39, 0.8)',
      borderWidth: 2,
    },
  }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      formatter: (params: { name: string; value: number; data: { pnlPercent: number; quantity: number; unit: string } }) => {
        const sign = params.data.pnlPercent >= 0 ? '+' : ''
        const color = params.data.pnlPercent >= 0 ? '#ef4444' : '#22c55e'
        return `<div style="font-weight:600">${params.name.replace('\n', ' ')}</div>
                <div style="margin-top:4px">市值: ¥${params.value.toLocaleString()}</div>
                <div>持有: ${params.data.quantity.toLocaleString()}${params.data.unit}</div>
                <div style="color:${color}">${sign}${params.data.pnlPercent.toFixed(2)}%</div>`
      },
    },
    series: [
      {
        type: 'treemap',
        width: '100%',
        height: '100%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          formatter: (params: { name: string; data: { pnlPercent: number } }) => {
            const sign = params.data.pnlPercent >= 0 ? '+' : ''
            return `${params.name}\n${sign}${params.data.pnlPercent.toFixed(1)}%`
          },
        },
        upperLabel: { show: false },
        data,
      },
    ],
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">持仓热力图</h3>
      <ReactECharts option={option} style={{ height: 320 }} />
    </div>
  )
}
