import ReactECharts from 'echarts-for-react'
import type { Holding, AssetType, Currency } from '@/types'

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

const CURRENCY_SYMBOL: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  HKD: 'HK$',
}

function safePnL(value: number): number {
  return Number.isFinite(value) ? value : 0
}

function pnlColor(pnl: number): string {
  const finite = safePnL(pnl)
  const alpha = Math.min(0.9, 0.4 + Math.min(Math.abs(finite), 40) / 50)
  // 中国惯例：红涨绿跌
  return finite >= 0
    ? `rgba(239, 68, 68, ${alpha.toFixed(3)})`
    : `rgba(34, 197, 94, ${alpha.toFixed(3)})`
}

export default function HoldingsTreemap({ holdings }: Props) {
  const open = holdings.filter(
    (h) => h.totalQuantity > 0 && Number.isFinite(h.marketValue) && h.marketValue > 0
  )

  if (open.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 flex items-center justify-center h-80">
        <p className="text-gray-500 text-sm">暂无持仓数据</p>
      </div>
    )
  }

  const total = open.reduce((sum, h) => sum + h.marketValue, 0)
  const data = open.map((h) => {
    const pnl = safePnL(h.unrealizedPnLPercent)
    const weight = total > 0 ? h.marketValue / total : 0
    const sign = pnl >= 0 ? '+' : ''

    return {
      name: h.name,
      symbol: h.symbol,
      value: Number(h.marketValue.toFixed(2)),
      pnlPercent: pnl,
      quantity: h.totalQuantity,
      currency: h.currency,
      unit: ASSET_UNIT[h.assetType] || '份',
      weight,
      itemStyle: {
        color: pnlColor(pnl),
        borderColor: '#0f172a',
        borderWidth: 1,
        gapWidth: 1,
      },
      // 过小的格子只留色块，避免标签互相裁切
      label: {
        show: weight >= 0.03,
        color: '#fff',
        fontSize: 12,
        fontWeight: 600 as const,
        overflow: 'truncate' as const,
        ellipsis: '…',
        padding: [4, 4, 4, 4],
        formatter: () =>
          `{name|${h.name}}\n{sym|${h.symbol}}\n{pnl|${sign}${pnl.toFixed(1)}%}`,
        rich: {
          name: { fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 16 },
          sym: { fontSize: 10, color: 'rgba(255,255,255,0.78)', lineHeight: 14 },
          pnl: {
            fontSize: 11,
            fontWeight: 600,
            color: pnl >= 0 ? '#fecaca' : '#bbf7d0',
            lineHeight: 16,
          },
        },
      },
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      formatter: (params: {
        name: string
        value: number
        data: {
          symbol: string
          pnlPercent: number
          quantity: number
          unit: string
          currency: Currency
        }
      }) => {
        const d = params.data
        const sign = d.pnlPercent >= 0 ? '+' : ''
        const color = d.pnlPercent >= 0 ? '#ef4444' : '#22c55e'
        const sym = CURRENCY_SYMBOL[d.currency] ?? '¥'
        return `<div style="font-weight:600">${params.name} <span style="opacity:.6;font-weight:400">${d.symbol}</span></div>
                <div style="margin-top:4px">市值: ${sym}${params.value.toLocaleString()}</div>
                <div>持有: ${d.quantity.toLocaleString()}${d.unit}</div>
                <div style="color:${color}">${sign}${d.pnlPercent.toFixed(2)}%</div>`
      },
    },
    series: [
      {
        type: 'treemap',
        left: 4,
        right: 4,
        top: 4,
        bottom: 4,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        // 极小值不单独成格，减少碎片空白
        visibleMin: 1000,
        label: {
          show: true,
          overflow: 'truncate',
          ellipsis: '…',
        },
        upperLabel: { show: false },
        itemStyle: {
          borderColor: '#0f172a',
          borderWidth: 1,
          gapWidth: 1,
          color: '#1e293b',
        },
        emphasis: {
          label: { show: true },
          itemStyle: { borderColor: '#f59e0b', borderWidth: 1 },
        },
        data,
      },
    ],
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">持仓热力图</h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <i className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/70" />
            盈利
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500/70" />
            亏损
          </span>
          <span>面积 = 市值</span>
        </div>
      </div>
      <div className="h-[360px] w-full overflow-hidden rounded-lg bg-gray-950/40">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
        />
      </div>
      <p className="mt-2 text-[10px] text-gray-600">
        * 面积按市值；颜色深浅按浮动盈亏幅度（红涨绿跌）。占比 &lt; 3% 的格子只显示色块，悬停可看明细。
      </p>
    </div>
  )
}
