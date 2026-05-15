import { useState } from 'react'
import type { DaySummary, ActivityEvent } from '../../lib/activityLog'

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const [, m, d] = dateStr.split('-')
  const label = `${parseInt(m)}/${parseInt(d)}`
  if (dateStr === today) return `今日 (${label})`
  if (dateStr === yesterday) return `昨日 (${label})`
  return label
}

function buildSummaryText(day: DaySummary): string {
  const parts: string[] = []
  const totalQs = day.events
    .filter(e => e.type === 'quiz-session')
    .reduce((s, e) => s + (e.type === 'quiz-session' ? e.payload.questionCount : 0), 0)
  const afternoonCount = day.events.filter(e => e.type === 'afternoon-record').length
  const badgeCount = day.events.filter(e => e.type === 'badge-unlock').length
  const noteCount = day.events.filter(e => e.type === 'note-check').length
  if (totalQs > 0) parts.push(`クイズ${totalQs}問`)
  if (afternoonCount > 0) parts.push(`午後${afternoonCount}回`)
  if (badgeCount > 0) parts.push(`バッジ${badgeCount}個`)
  if (noteCount > 0) parts.push(`ノート${noteCount}項目`)
  if ((day.syncedOnlyXp ?? 0) > 0) parts.push(`同期XP +${day.syncedOnlyXp}XP`)
  return parts.join(' / ') || '活動あり'
}

// ----------------------------------------------------------------
// ActivityEventItem
// ----------------------------------------------------------------

const MODE_LABELS: Record<string, string> = {
  topic: 'カテゴリ別', weakness: '弱点克服', random: 'ランダム', important: '重要問題',
}

const LEVEL_CONFIG = {
  green:  { label: '理解できた', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  yellow: { label: 'なんとなく', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  red:    { label: '要復習',     color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
}

const TIER_LABELS: Record<string, string> = {
  bronze: 'ブロンズ', silver: 'シルバー', gold: 'ゴールド', legendary: 'レジェンド',
}

function XpBadge({ xp }: { xp: number }) {
  if (xp <= 0) return null
  return <span className="text-[10px] font-bold text-amber-500 flex-shrink-0">+{xp} XP</span>
}

function SyncedXpItem({ xp }: { xp: number }) {
  if (xp <= 0) return null
  return (
    <div className="flex items-center gap-2.5 py-2">
      <span className="text-sm flex-shrink-0">↔</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-slate-700 leading-snug">別端末の学習記録を同期</p>
        <p className="text-[10px] text-slate-400 mt-0.5">詳細な操作履歴は同期対象外です</p>
      </div>
      <XpBadge xp={xp} />
    </div>
  )
}

function ActivityEventItem({ event }: { event: ActivityEvent }) {
  if (event.type === 'quiz-session') {
    const p = event.payload
    const rate = p.questionCount > 0 ? Math.round((p.correctCount / p.questionCount) * 100) : 0
    const modeStr = MODE_LABELS[p.mode] ?? p.mode
    const nameStr = p.categoryName ? ` (${p.categoryName})` : ''
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className="text-sm flex-shrink-0">📝</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-slate-700 leading-snug">
            {modeStr}{nameStr}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {p.questionCount}問 · 正答率{rate}% · {p.answerMode === 'multiple-choice' ? '4択' : '記述'}
          </p>
        </div>
        <XpBadge xp={event.xp} />
      </div>
    )
  }

  if (event.type === 'note-check') {
    const p = event.payload
    const cfg = LEVEL_CONFIG[p.level]
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className="text-sm flex-shrink-0">📖</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-slate-700 leading-snug">{p.noteName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">「{p.sectionLabel}」</p>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${cfg.color} ${cfg.bg}`}>
          {cfg.label}
        </span>
      </div>
    )
  }

  if (event.type === 'badge-unlock') {
    const p = event.payload
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className="text-sm flex-shrink-0">🎖️</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-slate-700 leading-snug">
            「{p.badgeName}」
            <span className="text-slate-400 ml-1">{TIER_LABELS[p.tier] ?? p.tier}</span>
          </p>
        </div>
        <XpBadge xp={event.xp} />
      </div>
    )
  }

  if (event.type === 'afternoon-record') {
    const p = event.payload
    // F1-P3: PMでは PM1 のみ → 「午後Ⅰ」固定
    const sectionLabel = '午後Ⅰ'
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className="text-sm flex-shrink-0">📋</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-slate-700 leading-snug">
            {p.year}年 {sectionLabel} 問{p.number}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">「{p.title}」· {p.score}点</p>
        </div>
      </div>
    )
  }

  return null
}

// ----------------------------------------------------------------
// DaySummaryRow
// ----------------------------------------------------------------

function DaySummaryRow({ day }: { day: DaySummary }) {
  const [open, setOpen] = useState(false)
  const summary = buildSummaryText(day)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-[12px] font-bold text-slate-700 w-24 flex-shrink-0 leading-tight">
          {formatDate(day.date)}
        </span>
        <span className="flex-1 text-[11px] text-slate-500 truncate">{summary}</span>
        {day.totalXp > 0 && (
          <span className="text-[11px] font-bold text-amber-500 flex-shrink-0 mr-1">
            +{day.totalXp} XP
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-slate-300 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-1 border-t border-slate-100 divide-y divide-slate-50">
          {day.events.map(e => <ActivityEventItem key={e.id} event={e} />)}
          <SyncedXpItem xp={day.syncedOnlyXp ?? 0} />
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------
// StudyHistoryList (exported)
// ----------------------------------------------------------------

export function StudyHistoryList({ daySummaries }: { daySummaries: DaySummary[] }) {
  if (daySummaries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm">まだ学習履歴がありません</p>
        <p className="text-slate-300 text-xs mt-1">問題を解くと記録が追加されます</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
      {daySummaries.map(day => <DaySummaryRow key={day.date} day={day} />)}
    </div>
  )
}
