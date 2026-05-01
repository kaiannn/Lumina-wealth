import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/portfolio'

interface Props {
  transactions: Transaction[]
}

export default function TransactionTimeline({ transactions }: Props) {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

  const grouped = new Map<string, Transaction[]>()
  for (const tx of sorted) {
    const dateKey = formatDate(tx.timestamp)
    const existing = grouped.get(dateKey) || []
    existing.push(tx)
    grouped.set(dateKey, existing)
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">暂无交易记录</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[120px] top-0 bottom-0 w-px bg-gray-800" />

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([date, txs]) => {
          const dayBuyTotal = txs.filter((t) => t.type === 'BUY').reduce((s, t) => s + t.price * t.quantity, 0)
          const daySellTotal = txs.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.price * t.quantity, 0)

          return (
            <div key={date} className="relative flex gap-6">
              <div className="w-[120px] shrink-0 text-right pr-4 pt-1">
                <p className="text-xs font-medium text-gray-400">{date}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{txs.length} 笔交易</p>
              </div>

              <div className="absolute left-[120px] top-2 -translate-x-1/2">
                <div className="w-3 h-3 rounded-full bg-gray-800 border-2 border-amber-500/60" />
              </div>

              <div className="flex-1 pl-6 space-y-2">
                {dayBuyTotal > 0 || daySellTotal > 0 ? (
                  <div className="flex items-center gap-3 mb-2">
                    {dayBuyTotal > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10">
                        买入 {formatCurrency(dayBuyTotal)}
                      </span>
                    )}
                    {daySellTotal > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/10">
                        卖出 {formatCurrency(daySellTotal)}
                      </span>
                    )}
                  </div>
                ) : null}

                {txs.map((tx) => {
                  const time = new Date(tx.timestamp)
                  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
                  const isBuy = tx.type === 'BUY'

                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isBuy
                          ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/20'
                          : 'bg-green-500/5 border-green-500/10 hover:border-green-500/20'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isBuy ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        {isBuy ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{tx.name}</span>
                          <span className="text-xs text-gray-500">{tx.symbol}</span>
                          <span className="text-[10px] text-gray-600 ml-auto font-mono">{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatCurrency(tx.price, tx.currency)} × {tx.quantity}
                          </span>
                          <span className={`text-xs font-medium ${isBuy ? 'text-red-400' : 'text-green-400'}`}>
                            {isBuy ? '-' : '+'}{formatCurrency(tx.price * tx.quantity, tx.currency)}
                          </span>
                          {tx.note && (
                            <span className="text-[10px] text-gray-600 truncate max-w-[200px]">
                              {tx.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
