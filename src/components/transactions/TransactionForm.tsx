import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Plus, X } from 'lucide-react'
import type { Transaction, TransactionType, AssetType, Currency } from '@/types'

interface Props {
  onSubmit: (tx: Transaction) => void
  onClose: () => void
}

export default function TransactionForm({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    assetType: 'STOCK_CN' as AssetType,
    symbol: '',
    name: '',
    type: 'BUY' as TransactionType,
    price: '',
    quantity: '',
    commission: '5',
    tax: '0',
    currency: 'CNY' as Currency,
    date: new Date().toISOString().slice(0, 16),
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.symbol || !form.name || !form.price || !form.quantity) return

    const tx: Transaction = {
      id: uuidv4(),
      assetType: form.assetType,
      symbol: form.symbol.toUpperCase(),
      name: form.name,
      type: form.type,
      price: Number(form.price),
      quantity: Number(form.quantity),
      commission: Number(form.commission),
      tax: Number(form.tax),
      currency: form.currency,
      timestamp: new Date(form.date).getTime(),
      note: form.note || undefined,
    }

    onSubmit(tx)
  }

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20'
  const labelClass = 'block text-xs text-gray-500 mb-1'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-gray-200">添加交易</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>交易类型</label>
              <div className="flex gap-2">
                {(['BUY', 'SELL'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.type === t
                        ? t === 'BUY'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {t === 'BUY' ? '买入' : '卖出'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>资产类型</label>
              <select
                className={inputClass}
                value={form.assetType}
                onChange={(e) => {
                  const at = e.target.value as AssetType
                  const currencyMap: Record<AssetType, Currency> = {
                    STOCK_CN: 'CNY', STOCK_US: 'USD', FUND: 'CNY',
                    CRYPTO: 'USD', BOND: 'CNY', CASH: 'CNY',
                  }
                  setForm((f) => ({ ...f, assetType: at, currency: currencyMap[at] }))
                }}
              >
                <option value="STOCK_CN">A股</option>
                <option value="STOCK_US">美股</option>
                <option value="FUND">基金</option>
                <option value="CRYPTO">加密货币</option>
                <option value="BOND">债券</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>代码</label>
              <input
                className={inputClass}
                placeholder="如 600519 / AAPL"
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>名称</label>
              <input
                className={inputClass}
                placeholder="如 贵州茅台"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>价格</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>数量</label>
              <input
                className={inputClass}
                type="number"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>时间</label>
              <input
                className={inputClass}
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>佣金</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={form.commission}
                onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>印花税</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={form.tax}
                onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>币种</label>
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
              >
                <option value="CNY">CNY ¥</option>
                <option value="USD">USD $</option>
                <option value="HKD">HKD HK$</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>备注（可选）</label>
            <input
              className={inputClass}
              placeholder="交易理由、市场判断等"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            确认添加
          </button>
        </form>
      </div>
    </div>
  )
}
