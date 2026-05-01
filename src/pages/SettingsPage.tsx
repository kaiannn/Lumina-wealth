import { Download, Upload, Trash2, Info } from 'lucide-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { exportAllData } from '@/db'
import type { Transaction } from '@/types'

export default function SettingsPage() {
  const { clearAll, importFromJSON, transactions } = usePortfolio()

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lumina-wealth-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        if (data.transactions && Array.isArray(data.transactions)) {
          await importFromJSON(data.transactions as Transaction[])
          alert('导入成功')
        }
      } catch {
        alert('导入失败：文件格式错误')
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">设置</h1>
        <p className="text-sm text-gray-500 mt-1">数据管理与应用配置</p>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 divide-y divide-gray-800">
        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-1">数据概览</h3>
          <p className="text-xs text-gray-500">所有数据存储在浏览器本地 (IndexedDB)</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="bg-gray-800/50 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">交易记录</p>
              <p className="text-lg font-bold text-gray-200">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-300">导出数据</h3>
            <p className="text-xs text-gray-500">下载 JSON 备份文件</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-300">导入数据</h3>
            <p className="text-xs text-gray-500">从 JSON 文件恢复数据</p>
          </div>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            导入
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-400">清空所有数据</h3>
            <p className="text-xs text-gray-500">此操作不可恢复，请先导出备份</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
                clearAll()
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">数据口径说明</h3>
            <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
              <p><span className="text-gray-400">价格来源：</span>当前所有估值基于最近一次成交价格，暂不支持实时行情。</p>
              <p><span className="text-gray-400">汇率来源：</span>多币种资产暂未做汇率统一折算，各币种独立展示。</p>
              <p><span className="text-gray-400">估值时间：</span>每只标的的估值时间为该标的最后一笔交易时间。</p>
              <p><span className="text-gray-400">收益计算：</span>已实现收益 = 卖出所得 - 对应成本。未实现收益 = 市值 - 剩余成本。</p>
              <p><span className="text-gray-400">成本方法：</span>采用移动加权平均法计算持仓成本。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">关于 Lumina Wealth</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              萤火财富是一个极细粒度的个人资产"显微镜"与 AI 驱动的"投资镜像仪"。
              所有数据完全保存在你的浏览器本地，隐私优先。
            </p>
            <p className="text-xs text-gray-600 mt-2">v0.1.0 · MIT License</p>
          </div>
        </div>
      </div>
    </div>
  )
}
