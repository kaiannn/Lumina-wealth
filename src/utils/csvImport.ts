import type { Transaction, TransactionType, AssetType, Currency } from '@/types'

export type CsvField =
  | 'timestamp'
  | 'type'
  | 'symbol'
  | 'name'
  | 'price'
  | 'quantity'
  | 'commission'
  | 'tax'
  | 'currency'
  | 'assetType'
  | 'ignore'

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

export interface FieldMapping {
  [header: string]: CsvField
}

export interface MappedRow {
  raw: string[]
  tx: Transaction | null
  error?: string
}

export interface ImportPreview {
  rows: MappedRow[]
  validCount: number
  errorCount: number
  duplicateCount: number
}

const REQUIRED_FIELDS: CsvField[] = ['timestamp', 'type', 'symbol', 'price', 'quantity']

const HEADER_HINTS: Record<CsvField, string[]> = {
  timestamp: ['时间', '日期', '成交日期', '交易日期', 'date', 'time', 'datetime', 'trade_date', '成交时间'],
  type: ['方向', '买卖', '类型', '操作', 'type', 'side', 'action', 'bs', '买卖方向'],
  symbol: ['代码', '证券代码', '股票代码', '合约', 'symbol', 'ticker', 'code', '证券号码'],
  name: ['名称', '证券名称', '股票名称', '品种', 'name', '证券简称'],
  price: ['价格', '成交价', '均价', 'price', '成交价格', '委托价'],
  quantity: ['数量', '股数', '份额', '成交量', 'quantity', 'shares', 'volume', '成交数量'],
  commission: ['佣金', '手续费', '费用', 'commission', 'fee', '手续费合计'],
  tax: ['印花税', '税', 'tax', '过户费', '规费'],
  currency: ['币种', '货币', 'currency', 'ccy'],
  assetType: ['资产类型', '市场', 'assetType', '品种类型'],
  ignore: [],
}

export function parseCsvText(text: string): ParsedCsv {
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const next = cleaned[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field.trim())
      field = ''
    } else if (char === '\n') {
      row.push(field.trim())
      field = ''
      if (row.some((c) => c !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  row.push(field.trim())
  if (row.some((c) => c !== '')) rows.push(row)

  if (rows.length === 0) return { headers: [], rows: [] }

  const headers = rows[0]
  return { headers, rows: rows.slice(1) }
}

export function autoMapHeaders(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {}
  const used = new Set<CsvField>()

  for (const header of headers) {
    const lower = header.toLowerCase()
    let matched: CsvField | null = null

    for (const [field, hints] of Object.entries(HEADER_HINTS) as [CsvField, string[]][]) {
      if (field === 'ignore' || used.has(field)) continue
      if (hints.some((h) => lower === h.toLowerCase() || lower.includes(h.toLowerCase()))) {
        matched = field
        break
      }
    }

    mapping[header] = matched && !used.has(matched) ? matched : 'ignore'
    if (mapping[header] !== 'ignore') used.add(mapping[header] as CsvField)
  }

  return mapping
}

export function validateMapping(mapping: FieldMapping): string[] {
  const selected = Object.values(mapping)
  return REQUIRED_FIELDS.filter((f) => !selected.includes(f))
}

function parseNumber(value: string): number {
  if (!value) return 0
  const normalized = value.replace(/[,，\s¥$HK]/g, '').replace(/^\+/, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : NaN
}

function parseType(value: string): TransactionType | null {
  const v = value.trim().toUpperCase()
  if (['BUY', 'B', '买入', '买', '证券买入', '融资买入', 'LONG'].includes(v)) return 'BUY'
  if (['SELL', 'S', '卖出', '卖', '证券卖出', '融券卖出', 'SHORT'].includes(v)) return 'SELL'
  return null
}

function parseTimestamp(value: string): number | null {
  if (!value) return null
  const raw = value.trim()

  // 2024-01-15 09:30:00 / 2024/01/15 09:30
  const normalized = raw.replace(/\//g, '-').replace(/年|月/g, '-').replace(/日/g, ' ')
  const d1 = new Date(normalized.replace(' ', 'T'))
  if (!Number.isNaN(d1.getTime())) return d1.getTime()

  // 20240115 / 20240115093000
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 8) {
    const d = new Date(
      Number(digits.slice(0, 4)),
      Number(digits.slice(4, 6)) - 1,
      Number(digits.slice(6, 8))
    )
    if (!Number.isNaN(d.getTime())) return d.getTime()
  }
  if (digits.length >= 14) {
    const d = new Date(
      Number(digits.slice(0, 4)),
      Number(digits.slice(4, 6)) - 1,
      Number(digits.slice(6, 8)),
      Number(digits.slice(8, 10)),
      Number(digits.slice(10, 12)),
      Number(digits.slice(12, 14))
    )
    if (!Number.isNaN(d.getTime())) return d.getTime()
  }

  const d2 = new Date(raw)
  if (!Number.isNaN(d2.getTime())) return d2.getTime()
  return null
}

function guessAssetType(symbol: string, currency?: string): AssetType {
  const s = symbol.toUpperCase()
  if (/^\d{6}$/.test(s)) return 'STOCK_CN'
  if (/^\d{5}$/.test(s)) return 'STOCK_CN' // HK often 5 digits
  if (/^[A-Z]{1,5}$/.test(s) && s.length <= 5) return 'STOCK_US'
  if (currency === 'USD') return 'STOCK_US'
  if (currency === 'HKD') return 'STOCK_US'
  return 'STOCK_CN'
}

function parseCurrency(value: string, assetType: AssetType): Currency {
  const v = value.trim().toUpperCase()
  if (v.includes('USD') || v === '$') return 'USD'
  if (v.includes('HKD') || v.includes('HK')) return 'HKD'
  if (v.includes('CNY') || v.includes('RMB') || v === '¥') return 'CNY'
  if (assetType === 'STOCK_US') return 'USD'
  return 'CNY'
}

function parseAssetType(value: string, symbol: string): AssetType {
  const v = value.trim().toUpperCase()
  if (v.includes('US') || v.includes('美股')) return 'STOCK_US'
  if (v.includes('CRYPTO') || v.includes('加密')) return 'CRYPTO'
  if (v.includes('FUND') || v.includes('基金')) return 'FUND'
  if (v.includes('BOND') || v.includes('债')) return 'BOND'
  return guessAssetType(symbol, undefined)
}

export function mapRows(
  parsed: ParsedCsv,
  mapping: FieldMapping,
  existingKeys: Set<string>
): ImportPreview {
  const headerIndex = new Map<string, number>()
  parsed.headers.forEach((h, i) => headerIndex.set(h, i))

  const getValue = (raw: string[], header: string): string => {
    const idx = headerIndex.get(header)
    return idx === undefined ? '' : (raw[idx] ?? '')
  }

  const fieldToHeader = new Map<CsvField, string>()
  for (const [header, field] of Object.entries(mapping)) {
    if (field !== 'ignore') fieldToHeader.set(field, header)
  }

  const get = (field: CsvField, raw: string[]): string => {
    const header = fieldToHeader.get(field)
    return header ? getValue(raw, header) : ''
  }

  const rows: MappedRow[] = []
  const seen = new Set(existingKeys)
  let validCount = 0
  let errorCount = 0
  let duplicateCount = 0

  for (const raw of parsed.rows) {
    const timestampRaw = get('timestamp', raw)
    const typeRaw = get('type', raw)
    const symbol = get('symbol', raw).trim()
    const name = get('name', raw).trim() || symbol
    const price = parseNumber(get('price', raw))
    const quantity = parseNumber(get('quantity', raw))
    const commission = parseNumber(get('commission', raw)) || 0
    const tax = parseNumber(get('tax', raw)) || 0

    const timestamp = parseTimestamp(timestampRaw)
    const type = parseType(typeRaw)

    let error: string | undefined
    if (!symbol) error = '缺少代码'
    else if (timestamp === null) error = '时间无法解析'
    else if (!type) error = '方向无法识别（买入/卖出）'
    else if (!Number.isFinite(price) || price <= 0) error = '价格无效'
    else if (!Number.isFinite(quantity) || quantity <= 0) error = '数量无效'

    if (error || type === null || timestamp === null) {
      rows.push({ raw, tx: null, error: error ?? '字段无效' })
      errorCount++
      continue
    }

    const assetTypeHeader = get('assetType', raw)
    const assetType = assetTypeHeader
      ? parseAssetType(assetTypeHeader, symbol)
      : guessAssetType(symbol)
    const currency = parseCurrency(get('currency', raw), assetType)

    const dedupKey = `${type}|${symbol}|${timestamp}|${price}|${quantity}`
    if (seen.has(dedupKey)) {
      rows.push({ raw, tx: null, error: '与已有记录重复' })
      duplicateCount++
      continue
    }
    seen.add(dedupKey)

    const tx: Transaction = {
      id: crypto.randomUUID(),
      assetType,
      symbol: symbol.toUpperCase(),
      name,
      type,
      price,
      quantity,
      commission: Number.isFinite(commission) ? Math.abs(commission) : 0,
      tax: Number.isFinite(tax) ? Math.abs(tax) : 0,
      currency,
      timestamp,
      note: 'CSV 导入',
    }

    rows.push({ raw, tx, error: undefined })
    validCount++
  }

  return { rows, validCount, errorCount, duplicateCount }
}

export function buildSampleCsv(): string {
  return [
    '成交日期,方向,证券代码,证券名称,成交价格,成交数量,佣金,印花税',
    '2024-03-15 10:30:00,买入,600519,贵州茅台,1680.00,100,5.00,0',
    '2024-04-02 14:00:00,卖出,600519,贵州茅台,1720.00,50,5.00,8.60',
    '2024-05-08 09:45:00,买入,AAPL,苹果公司,182.50,20,1.00,0',
  ].join('\n')
}
