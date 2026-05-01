import { useState } from 'react'
import { Plus, Database, Trash2 } from 'lucide-react'
import type { Holding } from '@/types'
import { usePortfolio } from '@/hooks/usePortfolio'
import SummaryCards from '@/components/dashboard/SummaryCards'
import HoldingsList from '@/components/dashboard/HoldingsList'
import HoldingsTreemap from '@/components/charts/HoldingsTreemap'
import AllocationPieChart from '@/components/charts/AllocationPieChart'
import BuildPositionChart from '@/components/charts/BuildPositionChart'
import TransactionForm from '@/components/transactions/TransactionForm'

export default function DashboardPage() {
  const { holdings, summary, loading, add, loadDemo, clearAll, isDemo } = usePortfolio()
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">投资总览</h1>
          <p className="text-sm text-gray-500 mt-1">实时持仓分析与可视化</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            加载演示数据
          </button>
          {holdings.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加交易
          </button>
        </div>
      </div>

      <SummaryCards summary={summary} />

      {isDemo && holdings.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">模拟数据</span>
          <p className="text-xs text-gray-500">当前为演示数据，用于展示功能，不代表真实市场行情。</p>
        </div>
      )}

      {holdings.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <HoldingsTreemap holdings={holdings} />
            </div>
            <AllocationPieChart holdings={holdings} />
          </div>

          <HoldingsList
            holdings={holdings}
            onSelect={(h) => setSelectedHolding(h)}
            selectedSymbol={selectedHolding?.symbol}
          />

          {selectedHolding && (
            <BuildPositionChart holding={selectedHolding} />
          )}
        </>
      )}

      {holdings.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
            <Database className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">开始追踪你的投资</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            添加你的第一笔交易记录，或加载演示数据来体验 Lumina Wealth 的可视化分析功能
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadDemo}
              className="px-5 py-2.5 text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
            >
              加载演示数据
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              添加第一笔交易
            </button>
          </div>
        </div>
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
