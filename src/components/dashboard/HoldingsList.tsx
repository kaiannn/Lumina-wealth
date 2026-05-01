import { ChevronRight } from 'lucide-react'
import type { Holding, AssetType } from '@/types'
import { formatCurrency, formatPercent, getPnLColor } from '@/utils/portfolio'

interface Props {
  holdings: Holding[]
  onSelect: (holding: Holding) => void
  selectedSymbol?: string
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK_CN: 'A股',
  STOCK_US: '美股',
  FUND: '基金',
  CRYPTO: '加密',
  BOND: '债券',
  CASH: '现金',
}

const ASSET_UNIT: Record<AssetType, string> = {
  STOCK_CN: '股',
  STOCK_US: '股',
  FUND: '份',
  CRYPTO: '枚',
  BOND: '张',
  CASH: '',
}

export default function HoldingsList({ holdings, onSelect, selectedSymbol }: Props) {
  if (holdings.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center">
        <p className="text-gray-500 text-sm">暂无持仓，请添加交易记录或加载演示数据</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400">持仓明细</h3>
      </div>
      <div className="divide-y divide-gray-800/50">
        {holdings.filter((h) => h.totalQuantity > 0).map((h) => (
          <button
            key={h.symbol}
            onClick={() => onSelect(h)}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors text-left ${
              selectedSymbol === h.symbol ? 'bg-gray-800/40 border-l-2 border-amber-400' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                {ASSET_TYPE_LABELS[h.assetType] || h.assetType}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-200">{h.name}</p>
                <p className="text-xs text-gray-500">{h.symbol} · {h.totalQuantity}{ASSET_UNIT[h.assetType] || '份'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-300">{formatCurrency(h.marketValue, h.currency)}</p>
                <p className="text-xs text-gray-500">单位成本 {formatCurrency(h.averageCost, h.currency)}</p>
              </div>
              <div className="text-right min-w-[70px]">
                <p className={`text-sm font-medium ${getPnLColor(h.unrealizedPnL)}`}>
                  {formatCurrency(h.unrealizedPnL, h.currency)}
                </p>
                <p className={`text-xs ${getPnLColor(h.unrealizedPnLPercent)}`}>
                  {formatPercent(h.unrealizedPnLPercent)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
