import { useState, useEffect, useCallback, useRef } from 'react'
import type { Transaction, Holding, PortfolioSummary } from '@/types'
import { getAllTransactions, addTransaction, deleteTransaction, importTransactions, clearAllTransactions } from '@/db'
import { calculateHoldings, calculatePortfolioSummary } from '@/utils/portfolio'
import { DEMO_TRANSACTIONS } from '@/utils/demoData'

export function usePortfolio() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const loadingRef = useRef(true)

  const refresh = useCallback(async () => {
    const txs = await getAllTransactions()
    setTransactions(txs)
    const h = calculateHoldings(txs)
    setHoldings(h)
    setSummary(calculatePortfolioSummary(h))
  }, [])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => {
      if (!cancelled) {
        loadingRef.current = false
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refresh])

  const add = useCallback(async (tx: Transaction) => {
    await addTransaction(tx)
    setIsDemo(false)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await deleteTransaction(id)
    await refresh()
  }, [refresh])

  const loadDemo = useCallback(async () => {
    await clearAllTransactions()
    await importTransactions(DEMO_TRANSACTIONS)
    setIsDemo(true)
    await refresh()
  }, [refresh])

  const clearAll = useCallback(async () => {
    await clearAllTransactions()
    setIsDemo(false)
    await refresh()
  }, [refresh])

  const importFromJSON = useCallback(async (data: Transaction[]) => {
    await importTransactions(data)
    setIsDemo(false)
    await refresh()
  }, [refresh])

  return {
    transactions,
    holdings,
    summary,
    loading,
    isDemo,
    add,
    remove,
    loadDemo,
    clearAll,
    importFromJSON,
    refresh,
  }
}
