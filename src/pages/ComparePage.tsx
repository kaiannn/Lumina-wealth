import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { getAllCelebrityHoldings, saveCelebrityHolding, clearAllCelebrityHoldings } from '@/db'
import { REAL_CELEBRITY_HOLDINGS, CELEBRITY_DATA_META } from '@/utils/celebrityData'
import type { CelebrityHolding } from '@/types'

export default function ComparePage() {
  const { holdings } = usePortfolio()
  const [celebrities, setCelebrities] = useState<CelebrityHolding[]>([])
  const [selected, setSelected] = useState<CelebrityHolding | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const bundled = REAL_CELEBRITY_HOLDINGS
      const stored = await getAllCelebrityHoldings()
      const storedIds = new Set(stored.map((c) => c.id))
      const bundledIds = new Set(bundled.map((c) => c.id))
      const needsRefresh =
        stored.length === 0 ||
        [...bundledIds].some((id) => !storedIds.has(id)) ||
        stored.every((c) => !c.source.includes('13F') || c.reportDate < '2025-01-01')

      if (needsRefresh) {
        await clearAllCelebrityHoldings()
        await Promise.all(bundled.map((c) => saveCelebrityHolding(c)))
        if (cancelled) return
        setCelebrities(bundled)
        setSelected(bundled[0] ?? null)
        return
      }

      // Prefer bundled real 13F when ids match (keeps app in sync with code updates)
      const merged = bundled.length > 0 ? bundled : stored
      if (!cancelled) {
        setCelebrities(merged)
        setSelected(merged[0] ?? null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const myTotalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  const myPositions = holdings.map((h) => ({
    symbol: h.symbol,
    name: h.name,
    percent: myTotalValue > 0 ? (h.marketValue / myTotalValue) * 100 : 0,
  }))

  const overlapSymbols = selected
    ? selected.holdings
        .filter((ch) => myPositions.some((mp) => mp.symbol === ch.symbol))
        .map((ch) => ch.symbol)
    : []

  const overlapRate = selected && myPositions.length > 0
    ? ((overlapSymbols.length / myPositions.length) * 100).toFixed(1)
    : '0'

  const weightSimilarity = (() => {
    if (!selected || myPositions.length === 0) return '0'
    let sumMinWeight = 0
    for (const mp of myPositions) {
      const celPos = selected.holdings.find((h) => h.symbol === mp.symbol)
      if (celPos) {
        sumMinWeight += Math.min(mp.percent, celPos.portfolioPercent)
      }
    }
    return sumMinWeight.toFixed(1)
  })()

  const getRadarOption = () => {
    if (!selected || myPositions.length === 0) return {}

    const nameBySymbol = new Map<string, string>()
    for (const p of myPositions) nameBySymbol.set(p.symbol, p.name)
    for (const h of selected.holdings) {
      if (!nameBySymbol.has(h.symbol)) nameBySymbol.set(h.symbol, h.name)
    }

    // 双方各取 Top，再合并去重——避免只按总权重排序时大牛独有标的被挤掉
    const myTop = [...myPositions]
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 7)
      .map((p) => p.symbol)
    const celTop = [...selected.holdings]
      .sort((a, b) => b.portfolioPercent - a.portfolioPercent)
      .slice(0, 7)
      .map((h) => h.symbol)

    const allSymbols = [...new Set([...myTop, ...celTop])].slice(0, 12)

    const rawMax = Math.max(
      10,
      ...allSymbols.flatMap((s) => {
        const myPos = myPositions.find((p) => p.symbol === s)
        const celPos = selected.holdings.find((h) => h.symbol === s)
        return [myPos?.percent ?? 0, celPos?.portfolioPercent ?? 0]
      })
    )
    const sharedMax = Math.ceil(rawMax * 1.15)

    const indicator = allSymbols.map((s) => ({
      name: nameBySymbol.get(s) || s,
      max: sharedMax,
    }))

    const myData = allSymbols.map((s) => {
      const pos = myPositions.find((p) => p.symbol === s)
      return pos ? Number(pos.percent.toFixed(2)) : 0
    })

    const celData = allSymbols.map((s) => {
      const pos = selected.holdings.find((h) => h.symbol === s)
      return pos ? Number(pos.portfolioPercent.toFixed(2)) : 0
    })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        textStyle: { color: '#e5e7eb', fontSize: 12 },
        formatter: () => {
          return allSymbols
            .map((s, i) => {
              const label = nameBySymbol.get(s) || s
              return `${label}: 我 ${myData[i]}% / ${selected.name} ${celData[i]}%`
            })
            .join('<br/>')
        },
      },
      legend: {
        data: ['我的持仓', selected.name],
        textStyle: { color: '#9ca3af', fontSize: 11 },
        bottom: 0,
      },
      radar: {
        indicator,
        shape: 'circle',
        splitNumber: 4,
        radius: '62%',
        axisName: { color: '#9ca3af', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937' } },
        splitArea: { areaStyle: { color: ['transparent', 'rgba(31, 41, 55, 0.3)'] } },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      series: [
        {
          type: 'radar',
          symbol: 'circle',
          symbolSize: 5,
          data: [
            {
              value: myData,
              name: '我的持仓',
              lineStyle: { color: '#f59e0b', width: 2 },
              areaStyle: { color: 'rgba(245, 158, 11, 0.12)' },
              itemStyle: { color: '#f59e0b' },
            },
            {
              value: celData,
              name: selected.name,
              lineStyle: { color: '#60a5fa', width: 2 },
              areaStyle: { color: 'rgba(96, 165, 250, 0.12)' },
              itemStyle: { color: '#60a5fa' },
            },
          ],
        },
      ],
    }
  }

  const getBarOption = () => {
    if (!selected) return {}

    const top10 = [...selected.holdings]
      .sort((a, b) => b.portfolioPercent - a.portfolioPercent)
      .slice(0, 10)

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        textStyle: { color: '#e5e7eb', fontSize: 12 },
      },
      grid: { left: 80, right: 40, top: 10, bottom: 30 },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#1f2937' } },
      },
      yAxis: {
        type: 'category',
        data: top10.map((h) => h.name).reverse(),
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      series: [
        {
          type: 'bar',
          data: top10.map((h) => ({
            value: h.portfolioPercent,
            itemStyle: {
              color: overlapSymbols.includes(h.symbol)
                ? '#f59e0b'
                : '#374151',
              borderRadius: [0, 4, 4, 0],
            },
          })).reverse(),
          barMaxWidth: 24,
          label: {
            show: true,
            position: 'right',
            color: '#9ca3af',
            fontSize: 10,
            formatter: '{c}%',
          },
        },
      ],
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">大牛对比</h1>
        <p className="text-sm text-gray-500 mt-1">与知名投资者的持仓进行对比分析</p>
        <p className="text-[10px] text-gray-600 mt-1">
          数据来源：{CELEBRITY_DATA_META.source} · 截至最近披露季 · 生成 {CELEBRITY_DATA_META.generatedAt.slice(0, 10)}。
          权重为季末市值占比，非实时行情。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {celebrities.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected?.id === c.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800'
            }`}
          >
            {c.name}
            <span className="text-xs ml-1 opacity-60">{c.reportDate}</span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">标的重合率</p>
              <p className="text-3xl font-bold text-amber-400">{overlapRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {overlapSymbols.length} / {myPositions.length} 只重合
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">权重相似度</p>
              <p className="text-3xl font-bold text-purple-400">{weightSimilarity}%</p>
              <p className="text-xs text-gray-500 mt-1">
                重合标的最小权重之和
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">对方持仓数</p>
              <p className="text-3xl font-bold text-blue-400">
                {selected.fullPositionCount ?? selected.holdings.length}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate" title={selected.source}>
                {selected.source}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">我的持仓数</p>
              <p className="text-3xl font-bold text-gray-200">{myPositions.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {myPositions.length === 0 ? '请先添加交易' : '活跃持仓'}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 px-1">
            * 当前仅基于持仓名称与权重对比，不代表完整投资风格相似度。行业分布、风险因子等维度暂未纳入。
          </p>

          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-400">结构指纹（真实 13F）</h3>
              {selected.metrics && (
                <span className="text-[10px] text-gray-600">报告期 {selected.reportDate}</span>
              )}
            </div>
            {selected.metrics ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <MiniMetric label="Top1 权重" value={`${selected.metrics.top1Weight.toFixed(1)}%`} />
                <MiniMetric label="Top3 权重" value={`${selected.metrics.top3Weight.toFixed(1)}%`} />
                <MiniMetric label="有效持仓" value={selected.metrics.effectiveHoldings.toFixed(1)} />
                <MiniMetric label="HHI" value={selected.metrics.hhi.toFixed(3)} />
                <MiniMetric label="熵归一" value={selected.metrics.normalizedEntropy.toFixed(2)} />
                <MiniMetric
                  label="季换手"
                  value={
                    selected.quarterDelta
                      ? `${selected.quarterDelta.weightTurnoverPct.toFixed(1)}%`
                      : '—'
                  }
                  accent={!!selected.quarterDelta && selected.quarterDelta.weightTurnoverPct > 20}
                />
              </div>
            ) : (
              <p className="text-xs text-gray-500">无结构指标</p>
            )}
            {selected.quarterDelta && (
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {selected.quarterDelta.from} → {selected.quarterDelta.to}：
                新进 {selected.quarterDelta.nAdded} / 移出 {selected.quarterDelta.nRemoved}
                {selected.quarterDelta.added.length > 0 && (
                  <>
                    <br />
                    新进示例：{selected.quarterDelta.added.slice(0, 3).join('、')}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">持仓对比雷达图</h3>
              {myPositions.length > 0 ? (
                <ReactECharts
                  key={`radar-${selected.id}-${myPositions.length}`}
                  option={getRadarOption()}
                  style={{ height: 360 }}
                  notMerge
                  lazyUpdate
                />
              ) : (
                <div className="flex items-center justify-center h-80">
                  <p className="text-gray-500 text-sm">请先添加交易记录以启用对比</p>
                </div>
              )}
            </div>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                {selected.name} · Top 10 持仓
                <span className="text-xs text-amber-400 ml-2">（金色 = 与你重合）</span>
              </h3>
              <ReactECharts option={getBarOption()} style={{ height: 360 }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MiniMetric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="bg-gray-800/40 rounded-lg border border-gray-800 px-2.5 py-2">
      <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-amber-400' : 'text-gray-200'}`}>
        {value}
      </p>
    </div>
  )
}
