import { useState } from 'react'
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, List, Clock, BarChart3, Play, TrendingUp } from 'lucide-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatCurrency, formatDateTime } from '@/utils/portfolio'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionTimeline from '@/components/transactions/TransactionTimeline'
import EnhancedTimeline from '@/components/transactions/EnhancedTimeline'
import TradeMarkChart from '@/components/charts/TradeMarkChart'
import PortfolioPlayback from '@/components/charts/PortfolioPlayback'

type ViewMode = 'table' | 'timeline' | 'enhanced' | 'chart' | 'playback'

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK_CN: 'A股',
  STOCK_US: '美股',
  FUND: '基金',
  CRYPTO: '加密',
  BOND: '债券',
  CASH: '现金',
}

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof List }[] = [
  { value: 'table', label: '表格', icon: List },
  { value: 'timeline', label: '时间轴', icon: Clock },
  { value: 'enhanced', label: '增强视图', icon: TrendingUp },
  { value: 'chart', label: '买卖标注', icon: BarChart3 },
  { value: 'playback', label: '回放', icon: Play },
]

export default function TransactionsPage() {
  const { transactions, add, remove } = usePortfolio()
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">交易记录</h1>
          <p className="text-sm text-gray-500 mt-1">共 {transactions.length} 笔交易</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          添加交易
        </button>
      </div>

      {transactions.length > 0 && (
        <>
          <div className="flex items-center gap-1 p-1 bg-gray-900/50 rounded-lg border border-gray-800 w-fit">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setViewMode(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === opt.value
                    ? 'bg-gray-800 text-amber-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <opt.icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 px-1">
            * 所有时间轴与图表展示基于历史交易记录，价格为成交价而非实时行情。
          </p>
        </>
      )}

      {viewMode === 'table' && (
        <>
          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">暂无交易记录</p>
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">时间</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">类型</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">标的</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">价格</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">数量</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">金额</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">费用</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {sorted.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {formatDateTime(tx.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          tx.type === 'BUY'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {tx.type === 'BUY' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type === 'BUY' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1 py-0.5 rounded bg-gray-800 text-gray-500">
                            {ASSET_TYPE_LABELS[tx.assetType]}
                          </span>
                          <div>
                            <span className="text-sm text-gray-200">{tx.name}</span>
                            <span className="text-xs text-gray-500 ml-1">{tx.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300 font-mono">
                        {formatCurrency(tx.price, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300 font-mono">
                        {tx.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300 font-mono">
                        {formatCurrency(tx.price * tx.quantity, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500 font-mono">
                        {formatCurrency(tx.commission + tx.tax, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => remove(tx.id)}
                          className="p-1 hover:bg-gray-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {viewMode === 'timeline' && (
        <TransactionTimeline transactions={transactions} />
      )}

      {viewMode === 'enhanced' && (
        <EnhancedTimeline transactions={transactions} />
      )}

      {viewMode === 'chart' && (
        <TradeMarkChart transactions={transactions} />
      )}

      {viewMode === 'playback' && (
        <PortfolioPlayback transactions={transactions} />
      )}

      {showForm && (
        <TransactionForm
          onSubmit={async (tx) => {
            await add(tx)
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
