import { useMemo, useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertTriangle, Copy, Download, X } from 'lucide-react'
import type { Transaction } from '@/types'
import {
  parseCsvText,
  autoMapHeaders,
  validateMapping,
  mapRows,
  buildSampleCsv,
  type CsvField,
  type FieldMapping,
} from '@/utils/csvImport'
import { formatDateTime, formatCurrency } from '@/utils/portfolio'

interface Props {
  existingTransactions: Transaction[]
  onImport: (txs: Transaction[]) => Promise<void> | void
  onClose: () => void
}

const FIELD_OPTIONS: { value: CsvField; label: string }[] = [
  { value: 'timestamp', label: '成交时间 *' },
  { value: 'type', label: '买卖方向 *' },
  { value: 'symbol', label: '代码 *' },
  { value: 'name', label: '名称' },
  { value: 'price', label: '价格 *' },
  { value: 'quantity', label: '数量 *' },
  { value: 'commission', label: '佣金' },
  { value: 'tax', label: '税费' },
  { value: 'currency', label: '币种' },
  { value: 'assetType', label: '资产类型' },
  { value: 'ignore', label: '忽略' },
]

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50'

export default function CsvImportDialog({ existingTransactions, onImport, onClose }: Props) {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<FieldMapping>({})
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)

  const existingKeys = useMemo(() => {
    const set = new Set<string>()
    for (const tx of existingTransactions) {
      set.add(`${tx.type}|${tx.symbol}|${tx.timestamp}|${tx.price}|${tx.quantity}`)
    }
    return set
  }, [existingTransactions])

  const mappingIssues = useMemo(() => validateMapping(mapping), [mapping])

  const preview = useMemo(() => {
    if (headers.length === 0 || mappingIssues.length > 0) return null
    return mapRows({ headers, rows }, mapping, existingKeys)
  }, [headers, rows, mapping, mappingIssues, existingKeys])

  const handleFile = async (file: File) => {
    setParseError('')
    try {
      const text = await file.text()
      const parsed = parseCsvText(text)
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setParseError('未能解析出表头或数据行，请确认是标准 CSV 文件')
        return
      }
      setHeaders(parsed.headers)
      setRows(parsed.rows)
      setMapping(autoMapHeaders(parsed.headers))
      setFileName(file.name)
    } catch {
      setParseError('文件读取失败')
    }
  }

  const handleSample = () => {
    const parsed = parseCsvText(buildSampleCsv())
    setHeaders(parsed.headers)
    setRows(parsed.rows)
    setMapping(autoMapHeaders(parsed.headers))
    setFileName('示例成交单.csv')
    setParseError('')
  }

  const handleDownloadSample = () => {
    const blob = new Blob(['﻿' + buildSampleCsv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'broker-trades-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!preview || preview.validCount === 0) return
    const txs = preview.rows.map((r) => r.tx).filter((t): t is Transaction => t !== null)
    setImporting(true)
    try {
      await onImport(txs)
      onClose()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-200">导入券商 CSV</h2>
            <p className="text-xs text-gray-500 mt-0.5">支持字段自动映射、预览校验与重复去重</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {headers.length === 0 ? (
            <div className="space-y-4">
              <label
                className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-500" />
                <div className="text-center">
                  <p className="text-sm text-gray-300">点击选择 CSV 文件</p>
                  <p className="text-xs text-gray-600 mt-1">或拖拽文件到此处</p>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </label>

              {parseError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {parseError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSample}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg"
                >
                  <FileText className="w-3.5 h-3.5" />
                  加载示例
                </button>
                <button
                  onClick={handleDownloadSample}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 bg-transparent border border-gray-800 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载模板
                </button>
                <p className="text-[11px] text-gray-600">
                  需包含：时间、方向、代码、价格、数量（名称可选）
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{fileName}</span>
                  <span className="text-xs text-gray-600 shrink-0">{rows.length} 行</span>
                </div>
                <button
                  onClick={() => {
                    setHeaders([])
                    setRows([])
                    setMapping({})
                    setFileName('')
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  重新选择
                </button>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2">字段映射</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {headers.map((h) => (
                    <div key={h} className="bg-gray-800/50 rounded-lg p-2 border border-gray-800">
                      <p className="text-[10px] text-gray-500 mb-1 truncate" title={h}>{h}</p>
                      <select
                        className={`${inputClass} !py-1.5 !text-xs`}
                        value={mapping[h] ?? 'ignore'}
                        onChange={(e) =>
                          setMapping((m) => ({ ...m, [h]: e.target.value as CsvField }))
                        }
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {mappingIssues.length > 0 && (
                  <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    还需映射：{mappingIssues.join('、')}
                  </p>
                )}
              </div>

              {preview && (
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xs font-medium text-gray-400">预览</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      可导入 {preview.validCount}
                    </span>
                    {preview.duplicateCount > 0 && (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        重复 {preview.duplicateCount}
                      </span>
                    )}
                    {preview.errorCount > 0 && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        无效 {preview.errorCount}
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-gray-800 rounded-lg max-h-56 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-800/60 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left text-gray-500 font-medium">状态</th>
                          <th className="px-2 py-2 text-left text-gray-500 font-medium">时间</th>
                          <th className="px-2 py-2 text-left text-gray-500 font-medium">方向</th>
                          <th className="px-2 py-2 text-left text-gray-500 font-medium">标的</th>
                          <th className="px-2 py-2 text-right text-gray-500 font-medium">价格</th>
                          <th className="px-2 py-2 text-right text-gray-500 font-medium">数量</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {preview.rows.slice(0, 50).map((row, i) => (
                          <tr key={i} className={row.tx ? '' : 'opacity-60'}>
                            <td className="px-2 py-1.5">
                              {row.tx ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-red-400 text-[10px]" title={row.error}>
                                  {row.error}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-gray-400 font-mono">
                              {row.tx ? formatDateTime(row.tx.timestamp) : '—'}
                            </td>
                            <td className="px-2 py-1.5">
                              {row.tx ? (
                                <span className={row.tx.type === 'BUY' ? 'text-red-400' : 'text-green-400'}>
                                  {row.tx.type === 'BUY' ? '买入' : '卖出'}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-2 py-1.5 text-gray-300">
                              {row.tx ? `${row.tx.name} (${row.tx.symbol})` : '—'}
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-300 font-mono">
                              {row.tx ? formatCurrency(row.tx.price, row.tx.currency) : '—'}
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-300 font-mono">
                              {row.tx ? row.tx.quantity : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.rows.length > 50 && (
                    <p className="mt-1 text-[10px] text-gray-600">
                      仅预览前 50 行，导入时处理全部 {preview.rows.length} 行
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 bg-gray-800/50 border border-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || preview.validCount === 0 || importing}
            className="px-4 py-2 text-xs font-semibold text-gray-900 bg-amber-500 hover:bg-amber-400 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? '导入中…' : preview ? `导入 ${preview.validCount} 笔` : '导入'}
          </button>
        </div>
      </div>
    </div>
  )
}
