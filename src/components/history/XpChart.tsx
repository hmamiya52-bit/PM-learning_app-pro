import { useMemo, useState } from 'react'
import type { DaySummary } from '../../lib/activityLog'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface ChartDay {
  date: string
  dailyXp: number
  cumulativeXp: number
}

// ----------------------------------------------------------------
// Chart constants
// ----------------------------------------------------------------

const W = 600
const H = 190
const M = { top: 15, right: 38, bottom: 32, left: 48 }
const PW = W - M.left - M.right   // 514
const PH = H - M.top - M.bottom   // 143

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function fmtDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}

function fmtLabel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

function niceMax(val: number): number {
  if (val <= 0) return 10
  const mag = Math.pow(10, Math.floor(Math.log10(val)))
  const norm = val / mag
  if (norm <= 1) return mag
  if (norm <= 2) return 2 * mag
  if (norm <= 5) return 5 * mag
  return 10 * mag
}

// ----------------------------------------------------------------
// XpChart
// ----------------------------------------------------------------

interface Props {
  daySummaries: DaySummary[]
}

export function XpChart({ daySummaries }: Props) {
  const [showAll, setShowAll] = useState(false)

  // Sort oldest-first, compute cumulative XP
  const allDays = useMemo((): ChartDay[] => {
    const sorted = [...daySummaries].sort((a, b) => a.date.localeCompare(b.date))
    let cum = 0
    return sorted.map(s => {
      cum += s.totalXp
      return { date: s.date, dailyXp: s.totalXp, cumulativeXp: cum }
    })
  }, [daySummaries])

  // Empty state
  if (allDays.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        経験値の記録はまだありません
      </div>
    )
  }

  const displayDays = showAll ? allDays : allDays.slice(-30)
  const n = displayDays.length
  const hasMore = allDays.length > 30

  const maxDaily = Math.max(...displayDays.map(d => d.dailyXp), 1)
  const maxCum = displayDays[n - 1]?.cumulativeXp ?? 1

  const maxDailyNice = niceMax(maxDaily)
  const maxCumNice = niceMax(maxCum)

  // Coordinate helpers
  const xPos = (i: number) => M.left + (i + 0.5) * (PW / n)
  const barW = Math.max(2, (PW / n) * 0.55)
  const cumY = (v: number) => M.top + PH - (v / maxCumNice) * PH
  const dailyY = (v: number) => M.top + PH - (v / maxDailyNice) * PH

  // X-axis label interval (~6 labels)
  const labelInterval = Math.max(1, Math.ceil(n / 6))

  // Left y-axis ticks (cumulative)
  const cumTicks = [0, 0.5, 1].map(f => Math.round(maxCumNice * f))
  // Right y-axis ticks (daily)
  const dailyTicks = [0, 1].map(f => Math.round(maxDailyNice * f))

  // Line polyline points
  const linePoints = displayDays
    .map((d, i) => `${xPos(i)},${dailyY(d.dailyXp)}`)
    .join(' ')

  const showDots = n <= 20

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 pt-4 pb-3 space-y-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600">経験値推移</p>
        {hasMore && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            {showAll ? `直近30日` : `全期間（${allDays.length}日）▾`}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-indigo-300" />
          <span className="text-[10px] text-slate-500">累計XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="10" className="overflow-visible">
            <line x1="0" y1="5" x2="16" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8" cy="5" r="2" fill="#f59e0b" />
          </svg>
          <span className="text-[10px] text-slate-500">日次XP</span>
        </div>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        aria-label="経験値推移グラフ"
        style={{ overflow: 'visible' }}
      >

        {/* Horizontal grid lines */}
        {cumTicks.map(tick => {
          const y = cumY(tick)
          return (
            <g key={`grid-${tick}`}>
              <line
                x1={M.left} y1={y} x2={M.left + PW} y2={y}
                stroke="#e2e8f0" strokeWidth={0.5}
              />
              {/* Left axis label (cumulative) */}
              <text
                x={M.left - 5} y={y}
                textAnchor="end" dominantBaseline="middle"
                fontSize={9} fill="#94a3b8"
              >
                {fmtLabel(tick)}
              </text>
            </g>
          )
        })}

        {/* Right axis labels (daily) */}
        {dailyTicks.map(tick => (
          <text
            key={`rtick-${tick}`}
            x={M.left + PW + 5} y={dailyY(tick)}
            textAnchor="start" dominantBaseline="middle"
            fontSize={9} fill="#f59e0b" opacity={0.9}
          >
            {fmtLabel(tick)}
          </text>
        ))}

        {/* Bars — cumulative XP */}
        {displayDays.map((d, i) => {
          const x = xPos(i)
          const bh = (d.cumulativeXp / maxCumNice) * PH
          return (
            <rect
              key={`bar-${d.date}`}
              x={x - barW / 2}
              y={M.top + PH - bh}
              width={barW}
              height={bh}
              fill="#a5b4fc"
              rx={1.5}
            />
          )
        })}

        {/* Line — daily XP */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots on line (only when not too many points) */}
        {showDots && displayDays.map((d, i) => (
          <circle
            key={`dot-${d.date}`}
            cx={xPos(i)}
            cy={dailyY(d.dailyXp)}
            r={2.5}
            fill="#f59e0b"
          />
        ))}

        {/* X-axis labels */}
        {displayDays.map((d, i) => {
          const showLabel = i % labelInterval === 0 || i === n - 1
          if (!showLabel) return null
          return (
            <text
              key={`xlabel-${d.date}`}
              x={xPos(i)}
              y={M.top + PH + 14}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
            >
              {fmtDate(d.date)}
            </text>
          )
        })}

        {/* Axis lines */}
        <line
          x1={M.left} y1={M.top}
          x2={M.left} y2={M.top + PH}
          stroke="#cbd5e1" strokeWidth={0.5}
        />
        <line
          x1={M.left} y1={M.top + PH}
          x2={M.left + PW} y2={M.top + PH}
          stroke="#cbd5e1" strokeWidth={0.5}
        />

      </svg>
    </div>
  )
}
