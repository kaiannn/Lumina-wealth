import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Transaction, CelebrityHolding } from '../types'

interface LuminaDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction
    indexes: {
      'by-symbol': string
      'by-timestamp': number
      'by-type': string
    }
  }
  celebrities: {
    key: string
    value: CelebrityHolding
  }
}

const DB_NAME = 'lumina-wealth'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<LuminaDB> | null = null

export async function getDB(): Promise<IDBPDatabase<LuminaDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<LuminaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
        txStore.createIndex('by-symbol', 'symbol')
        txStore.createIndex('by-timestamp', 'timestamp')
        txStore.createIndex('by-type', 'type')
      }
      if (!db.objectStoreNames.contains('celebrities')) {
        db.createObjectStore('celebrities', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const db = await getDB()
  await db.put('transactions', tx)
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('transactions', id)
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDB()
  return db.getAll('transactions')
}

export async function getTransactionsBySymbol(symbol: string): Promise<Transaction[]> {
  const db = await getDB()
  return db.getAllFromIndex('transactions', 'by-symbol', symbol)
}

export async function clearAllTransactions(): Promise<void> {
  const db = await getDB()
  await db.clear('transactions')
}

export async function importTransactions(txs: Transaction[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('transactions', 'readwrite')
  for (const item of txs) {
    await tx.store.put(item)
  }
  await tx.done
}

export async function exportAllData(): Promise<{ transactions: Transaction[]; celebrities: CelebrityHolding[] }> {
  const db = await getDB()
  const transactions = await db.getAll('transactions')
  const celebrities = await db.getAll('celebrities')
  return { transactions, celebrities }
}

export async function saveCelebrityHolding(data: CelebrityHolding): Promise<void> {
  const db = await getDB()
  await db.put('celebrities', data)
}

export async function getAllCelebrityHoldings(): Promise<CelebrityHolding[]> {
  const db = await getDB()
  return db.getAll('celebrities')
}
