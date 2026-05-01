import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { getAllCelebrityHoldings, saveCelebrityHolding } from '@/db'
import { DEMO_CELEBRITY_HOLDINGS } from '@/utils/demoData'
import type { CelebrityHolding } from '@/types'

export default function ComparePage() {
  const { holdings } = usePortfolio()
  const [celebrities, setCelebrities] = useState<CelebrityHolding[]>([])
  const [selected, setSelected] = useState<CelebrityHolding | null>(null)

  useEffect(() => {
    getAllCelebrityHoldings().then((data) => {
      if (data.length === 0) {
        Promise.all(DEMO_CELEBRITY_HOLDINGS.map((c) => saveCelebrityHolding(c))).then(() => {
          setCelebrities(DEMO_CELEBRITY_HOLDINGS)
          setSelected(DEMO_CELEBRITY_HOLDINGS[0])
        })
      } else {
        setCelebrities(data)
        setSelected(data[0])
      }
    })
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

    const allSymbols = [
      ...new Set([
        ...myPositions.map((p) => p.symbol),
        ...selected.holdings.map((h) => h.symbol),
      ]),
    ].slice(0, 10)

    const indicator = allSymbols.map((s) => {
      const myPos = myPositions.find((p) => p.symbol === s)
      const celPos = selected.holdings.find((h) => h.symbol === s)
      return {
        name: myPos?.name || celPos?.name || s,
        max: Math.max(
          myPos?.percent || 0,
          celPos?.portfolioPercent || 0,
          10
        ) * 1.3,
      }
    })

    const myData = allSymbols.map((s) => {
      const pos = myPositions.find((p) => p.symbol === s)
      return pos ? Number(pos.percent.toFixed(1)) : 0
    })

    const celData = allSymbols.map((s) => {
      const pos = selected.holdings.find((h) => h.symbol === s)
      return pos ? pos.portfolioPercent : 0
    })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        textStyle: { color: '#e5e7eb', fontSize: 12 },
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
        axisName: { color: '#9ca3af', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937' } },
        splitArea: { areaStyle: { color: ['transparent', 'rgba(31, 41, 55, 0.3)'] } },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: myData,
              name: '我的持仓',
              lineStyle: { color: '#f59e0b', width: 2 },
              areaStyle: { color: 'rgba(245, 158, 11, 0.1)' },
              itemStyle: { color: '#f59e0b' },
            },
            {
              value: celData,
              name: selected.name,
              lineStyle: { color: '#60a5fa', width: 2 },
              areaStyle: { color: 'rgba(96, 165, 250, 0.1)' },
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
        <p className="text-[10px] text-gray-600 mt-1">名人持仓数据来源于公开 13F 披露文件（模拟数据），仅供参考。</p>
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
              <p className="text-3xl font-bold text-blue-400">{selected.holdings.length}</p>
              <p className="text-xs text-gray-500 mt-1">来源: {selected.source}</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">持仓对比雷达图</h3>
              {myPositions.length > 0 ? (
                <ReactECharts option={getRadarOption()} style={{ height: 360 }} />
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
