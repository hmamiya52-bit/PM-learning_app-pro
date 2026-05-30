import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { afternoonProblems, YEARS } from '../data/afternoonProblems'
import type { AfternoonProblem } from '../data/afternoonProblems'
import { officialAnswers } from '../data/officialAnswers'
import { getAfternoonExplanation } from '../data/afternoonExplanations'
import {
  loadRecords, addRecord, deleteRecord,
  loadPlans, setPlan, removePlan, getMaxScore,
  savedAnswersExists,
} from '../lib/tracker'
import { deleteSavedAnswerSnapshot } from '../lib/afternoonSavedAnswers'
import type { PracticeRecord } from '../lib/tracker'

/**
 * 午後I（PM1）問題一覧画面
 *
 * 設計書 v0.15 §2.4 / §8.1 に従う、PM試験 午後I のサンプル問題一覧。
 * F1-P3 で NW の G1/G2 二分割テーブルを PM1 一本に簡素化。
 */

// ----------------------------------------------------------------
// Types / helpers
// ----------------------------------------------------------------

const ANSWER_IDS = new Set(officialAnswers.map(a => a.id))

interface RowData {
  problem: AfternoonProblem
  hasAnswer: boolean
  records: PracticeRecord[]
  latestScore: number | null
  latestDate: string | null
  roundCount: number
  plannedDate: string | null
  maxScore: number
}

type PracticeFilter = 'all' | 'studied' | 'unstudied'
type SortMode = 'score' | 'year'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [, m, d] = dateStr.split('-')
    return `${parseInt(m)}/${parseInt(d)}`
  }
  return dateStr
}

function scoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return 'text-emerald-600'
  if (pct >= 0.6) return 'text-amber-500'
  return 'text-red-500'
}

const YEAR_ORDER: Record<string, number> = {}
YEARS.forEach((y, i) => { YEAR_ORDER[y] = i })

function buildRows(
  records: PracticeRecord[],
  plans: Record<string, string>,
  sortMode: SortMode,
): RowData[] {
  const maxScore = getMaxScore('PM1')
  const rows: RowData[] = afternoonProblems.map(problem => {
    const problemRecords = records
      .filter(r => r.problemId === problem.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    return {
      problem,
      hasAnswer: ANSWER_IDS.has(problem.id),
      records: problemRecords,
      latestScore: problemRecords.length > 0 ? Math.max(...problemRecords.map(r => r.score)) : null,
      latestDate: problemRecords[0]?.date ?? null,
      roundCount: problemRecords.length,
      plannedDate: plans[problem.id] ?? null,
      maxScore,
    }
  })

  if (sortMode === 'year') {
    return rows.sort((a, b) => {
      const yi = YEAR_ORDER[a.problem.year] - YEAR_ORDER[b.problem.year]
      return yi !== 0 ? yi : a.problem.number - b.problem.number
    })
  }

  // score モード: 演習済み→最高点降順, 未演習→年度順
  const studied = rows
    .filter(r => r.roundCount > 0)
    .sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0))

  const unstudied = rows
    .filter(r => r.roundCount === 0)
    .sort((a, b) => {
      const yi = YEAR_ORDER[a.problem.year] - YEAR_ORDER[b.problem.year]
      return yi !== 0 ? yi : a.problem.number - b.problem.number
    })

  return [...studied, ...unstudied]
}

// ----------------------------------------------------------------
// Record modal
// ----------------------------------------------------------------

interface RecordModalProps {
  problem: AfternoonProblem
  onSave: (data: { date: string; score: number; plannedDate: string; memo: string }) => void
  onClose: () => void
}

function RecordModal({ problem, onSave, onClose }: RecordModalProps) {
  const maxScore = getMaxScore('PM1')
  const [date, setDate] = useState(today())
  const [score, setScore] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [memo, setMemo] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const s = parseInt(score)
    if (isNaN(s) || s < 0 || s > maxScore) return
    onSave({ date, score: s, plannedDate, memo })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          <p className="text-[11px] text-slate-400">
            午後Ⅰ 問{problem.number} · {problem.yearLabel}
          </p>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">{problem.title}</h3>
        </div>
        {ANSWER_IDS.has(problem.id) && (
          <div className="px-5 py-2.5 bg-teal-50 border-b border-teal-100 flex items-center justify-between">
            <span className="text-[11px] text-teal-600">解答欄モードで記入してから記録できます</span>
            <Link
              to={`/afternoon/answers/${problem.id}/myAnswer`}
              onClick={onClose}
              className="text-[11px] font-bold text-teal-700 border border-teal-300 bg-white hover:bg-teal-100 rounded-md px-2 py-1 transition-colors flex-shrink-0 ml-2"
            >
              ✍ 解答欄モードへ
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">演習日</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              点数
              <span className="font-normal text-slate-400 ml-1">（満点 {maxScore} 点）</span>
            </label>
            <input
              type="number"
              min={0}
              max={maxScore}
              step={1}
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder={`0 〜 ${maxScore}`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              次回計画日
              <span className="font-normal text-slate-400 ml-1">（任意）</span>
            </label>
            <input
              type="date"
              value={plannedDate}
              onChange={e => setPlannedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              メモ
              <span className="font-normal text-slate-400 ml-1">（任意）</span>
            </label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark"
            >
              記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// インライン詳細パネル（行タップで展開）
// ----------------------------------------------------------------

interface DetailPanelProps {
  row: RowData
  onRecord: () => void
  onDeleteRecord: (id: string) => void
  onPlanChange: (date: string) => void
}

function DetailPanel({ row, onRecord, onDeleteRecord, onPlanChange }: DetailPanelProps) {
  const { problem, records, hasAnswer, plannedDate, maxScore } = row
  const hasDetail = !!getAfternoonExplanation(problem.id)?.detail
  const [planEditing, setPlanEditing] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  return (
    <div className="px-4 py-3 bg-slate-50/70 border-l-4 border-brand-light space-y-3">
      {/* アクション行：PDF・解答欄・公式解答 */}
      <div className="flex flex-wrap gap-1.5">
        {problem.questionPdfUrl && (
          <a
            href={problem.questionPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors"
          >
            📄 問題PDFを開く
          </a>
        )}
        {hasAnswer && (
          <Link
            to={`/afternoon/answers/${problem.id}/myAnswer`}
            className="text-[11px] font-bold text-teal-700 border border-teal-300 bg-white hover:bg-teal-50 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors"
          >
            ✍ 解答欄モード
          </Link>
        )}
        {hasAnswer && (
          <Link
            to={`/afternoon/answers/${problem.id}`}
            className="text-[11px] font-bold text-brand-dark border border-brand-light bg-white hover:bg-brand-light/40 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors"
          >
            🗒 公式解答
          </Link>
        )}
        {hasDetail && (
          <Link
            to={`/afternoon/answers/${problem.id}/explanation`}
            className="text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors"
          >
            📖 解説ページ
          </Link>
        )}
      </div>

      {/* メタ情報行：周回 / 次回計画日 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
        <div>
          <span className="text-slate-400 font-bold mr-1">周回数</span>
          <span className="text-brand-dark font-bold tabular-nums">{records.length}回</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">次回計画日</span>
          {planEditing ? (
            <input
              type="text"
              placeholder="例: 5/10"
              defaultValue={plannedDate ? formatDate(plannedDate) : ''}
              autoFocus
              className="w-20 border border-brand rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onPlanChange((e.target as HTMLInputElement).value)
                  setPlanEditing(false)
                }
                if (e.key === 'Escape') setPlanEditing(false)
              }}
              onBlur={e => {
                onPlanChange(e.target.value)
                setPlanEditing(false)
              }}
            />
          ) : (
            <button
              onClick={() => setPlanEditing(true)}
              className={`text-[11px] underline-offset-2 hover:underline ${
                plannedDate ? 'text-slate-700 font-bold' : 'text-slate-400'
              }`}
            >
              {plannedDate ? formatDate(plannedDate) : '未設定（タップで入力）'}
            </button>
          )}
        </div>
      </div>

      {/* 各回の点数と実施日 */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 mb-1">演習履歴</p>
        {records.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">まだ記録がありません</p>
        ) : (
          <ul className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100">
            {records.map((r, i) => {
              // F1-P-1 D-UI-03 対応: ハードコード localStorage アクセスを tracker ヘルパー経由に
              const hasSaved = savedAnswersExists(r.id)
              return (
                <li key={r.id} className="flex items-center gap-2 px-2.5 py-1.5">
                  <span className="flex-shrink-0 text-[10px] text-slate-400 w-5 text-right">
                    {records.length - i}
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums w-12">
                    {formatDate(r.date)}
                  </span>
                  <span className={`text-[12px] font-black tabular-nums ${scoreColor(r.score, maxScore)}`}>
                    {r.score}
                    <span className="text-[9px] font-normal text-slate-300">/{maxScore}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((r.score / maxScore) * 100)}%)
                  </span>
                  {r.memo && (
                    <span className="text-[10px] text-slate-500 truncate flex-1 min-w-0">
                      💬 {r.memo}
                    </span>
                  )}
                  {hasSaved && (
                    <Link
                      to={`/afternoon/answers/${problem.id}/myAnswer?recordId=${r.id}`}
                      onClick={e => e.stopPropagation()}
                      className="ml-auto text-[10px] font-bold text-teal-600 hover:text-teal-800 border border-teal-200 rounded px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap transition-colors"
                    >
                      📝 解答を見る
                    </Link>
                  )}
                  <button
                    onClick={() => setDeleteConfirmId(r.id)}
                    className={`${hasSaved ? '' : 'ml-auto'} text-slate-300 hover:text-red-400 transition-colors p-0.5 flex-shrink-0`}
                    aria-label="この記録を削除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <button
          onClick={onRecord}
          className="mt-2 w-full text-[11px] font-bold text-white bg-brand hover:bg-brand-dark rounded-md px-2.5 py-2 inline-flex items-center justify-center gap-1 transition-colors"
        >
          ＋ 記録する
        </button>
      </div>

      {/* 削除確認ダイアログ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl px-6 py-5 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800">この演習記録を削除しますか？</h3>
            <p className="text-xs text-slate-500">削除した記録は元に戻せません。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => { onDeleteRecord(deleteConfirmId); setDeleteConfirmId(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------
// Problem table (PM1 単一)
// ----------------------------------------------------------------

interface ProblemTableProps {
  rows: RowData[]
  studiedCount: number
  sortMode: SortMode
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onRecord: (problem: AfternoonProblem) => void
  onDeleteRecord: (id: string) => void
  onPlanChange: (problemId: string, date: string) => void
}

function ProblemTable({
  rows, studiedCount, sortMode,
  expandedId, onToggleExpand,
  onRecord, onDeleteRecord, onPlanChange,
}: ProblemTableProps) {
  const actualStudied = rows.filter(r => r.roundCount > 0).length
  const COL_SPAN = 8

  return (
    <section>
      <h2 className="text-xs font-bold text-white rounded-t-xl px-4 py-2 bg-brand-dark flex items-center justify-between">
        <span>午後Ⅰ</span>
        <span className="font-normal opacity-80">
          演習済 {actualStudied} / {rows.length}問
        </span>
      </h2>
      <div className="rounded-b-xl border border-slate-200 bg-white overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-xs text-slate-400 text-center">
            条件に一致する問題がありません
          </div>
        ) : (
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col style={{ width: '34px' }} />
              <col style={{ width: '30px' }} />
              <col />
              <col style={{ width: '22px' }} />
              <col style={{ width: '42px' }} />
              <col style={{ width: '34px' }} />
              <col style={{ width: '34px' }} />
              <col style={{ width: '18px' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-1 text-left text-[10px] font-bold text-slate-500">年度</th>
                <th className="py-2 px-1 text-left text-[10px] font-bold text-slate-500">問</th>
                <th className="py-2 px-1.5 text-left text-[10px] font-bold text-slate-500">テーマ</th>
                <th className="py-2 px-0.5 text-center text-[10px] font-bold text-slate-500">回</th>
                <th className="py-2 px-1 text-center text-[10px] font-bold text-slate-500">最高点</th>
                <th className="py-2 px-0.5 text-center text-[9px] font-bold text-slate-500 whitespace-nowrap">実施日</th>
                <th className="py-2 px-0.5 text-center text-[9px] font-bold text-slate-500 whitespace-nowrap">計画日</th>
                <th className="py-2 px-0.5 w-4" aria-label="詳細" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isSeparator = sortMode === 'score' && i === studiedCount && studiedCount > 0 && i < rows.length
                const isExpanded = expandedId === row.problem.id
                return (
                  <Fragment key={row.problem.id}>
                    <tr
                      className={[
                        'align-middle cursor-pointer transition-colors',
                        isExpanded ? 'bg-brand-light/40' : 'hover:bg-brand-light/20',
                        isSeparator ? 'border-t-2 border-brand-light' : 'border-t border-slate-100',
                      ].join(' ')}
                      onClick={() => onToggleExpand(row.problem.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="py-2 px-1 text-[10px] text-slate-500 whitespace-nowrap">
                        {row.problem.year}
                      </td>
                      <td className="py-2 px-1">
                        <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 whitespace-nowrap bg-brand-light text-brand-dark">
                          {row.problem.number}
                        </span>
                      </td>
                      <td className="py-2 px-1.5">
                        <div className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">
                          {row.problem.title}
                        </div>
                        {row.problem.keywords.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-0.5 mt-0.5">
                            {row.problem.keywords.map(kw => (
                              <span key={kw} className="text-[9px] bg-slate-100 text-slate-400 rounded px-1 py-0 leading-tight">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-0.5 text-center">
                        {row.roundCount > 0 ? (
                          <span className="text-[11px] font-bold text-brand-dark tabular-nums">{row.roundCount}</span>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center">
                        {row.latestScore !== null ? (
                          <span className={`text-[11px] font-black tabular-nums ${scoreColor(row.latestScore, row.maxScore)}`}>
                            {row.latestScore}
                            <span className="text-[9px] font-normal text-slate-300">/{row.maxScore}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center text-[10px] text-slate-500 whitespace-nowrap">
                        {row.latestDate ? formatDate(row.latestDate) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center text-[10px] text-slate-500 whitespace-nowrap">
                        {row.plannedDate ? (
                          <span className="text-brand font-medium">{formatDate(row.plannedDate)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2 px-0.5 text-center text-slate-400">
                        <span
                          className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-t border-brand-light/60">
                        <td colSpan={COL_SPAN} className="p-0">
                          <DetailPanel
                            row={row}
                            onRecord={() => onRecord(row.problem)}
                            onDeleteRecord={onDeleteRecord}
                            onPlanChange={(date) => onPlanChange(row.problem.id, date)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function AfternoonProblems() {
  const [records, setRecords] = useState<PracticeRecord[]>(() => loadRecords())
  const [plans, setPlans] = useState<Record<string, string>>(() => loadPlans())
  const [recordModal, setRecordModal] = useState<AfternoonProblem | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [keywordsExpanded, setKeywordsExpanded] = useState(false)
  const [practiceFilter, setPracticeFilter] = useState<PracticeFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('score')

  // F1-P3 PM化: NW の G1/G2 二分割を廃止し、PM1 一本のテーブルへ
  const pm1Rows = useMemo(() => buildRows(records, plans, sortMode), [records, plans, sortMode])

  const allKeywords = useMemo(() => {
    const set = new Set<string>()
    afternoonProblems.forEach(p => p.keywords.forEach(kw => set.add(kw)))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [])

  const filterRows = (rows: RowData[]): RowData[] => {
    return rows.filter(row => {
      if (practiceFilter === 'studied' && row.roundCount === 0) return false
      if (practiceFilter === 'unstudied' && row.roundCount > 0) return false
      if (selectedKeywords.length > 0) {
        if (!selectedKeywords.some(kw => row.problem.keywords.includes(kw))) return false
      }
      return true
    })
  }

  const pm1Filtered = useMemo(() => filterRows(pm1Rows), [pm1Rows, practiceFilter, selectedKeywords]) // eslint-disable-line react-hooks/exhaustive-deps

  const pm1StudiedCount = useMemo(
    () => sortMode === 'score' ? pm1Filtered.filter(r => r.roundCount > 0).length : 0,
    [pm1Filtered, sortMode],
  )

  const totalStudied = useMemo(
    () => pm1Rows.filter(r => r.roundCount > 0).length,
    [pm1Rows],
  )
  const totalProblems = pm1Rows.length

  const hasFilter = selectedKeywords.length > 0 || practiceFilter !== 'all'

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  function handleSaveRecord(data: { date: string; score: number; plannedDate: string; memo: string }) {
    if (!recordModal) return
    const record = addRecord({
      problemId: recordModal.id,
      date: data.date,
      score: data.score,
      memo: data.memo || undefined,
    })
    if (data.plannedDate) {
      setPlan(recordModal.id, data.plannedDate)
    } else {
      removePlan(recordModal.id)
    }
    setPlans(loadPlans())
    setRecords(prev => [...prev, record])
    setRecordModal(null)
  }

  function handleDeleteRecord(id: string) {
    deleteRecord(id)
    deleteSavedAnswerSnapshot(id)
    setRecords(loadRecords())
  }

  function handlePlanChange(problemId: string, date: string) {
    if (date) {
      setPlan(problemId, date)
    } else {
      removePlan(problemId)
    }
    setPlans(loadPlans())
  }

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw],
    )
  }

  const resetFilters = () => {
    setSelectedKeywords([])
    setPracticeFilter('all')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <section>
          <div className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
            <h1 className="text-base font-black leading-snug">午後I問題演習補助ツール</h1>
            <p className="text-xs text-white/80 mt-0.5 whitespace-nowrap">
              PM試験 午後Ⅰ 全{totalProblems}問
              <span className="mx-1.5 opacity-50">|</span>
              演習済 {totalStudied} / {totalProblems}問
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="bg-white rounded-xl border border-slate-200 px-4 py-3 space-y-2.5">
          <div>
            <button
              onClick={() => setKeywordsExpanded(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-brand transition-colors"
            >
              <span>キーワード</span>
              {selectedKeywords.length > 0 && (
                <span className="bg-brand text-white rounded-full px-1.5 py-0 leading-tight text-[9px]">
                  {selectedKeywords.length}
                </span>
              )}
              <span className="text-slate-400">{keywordsExpanded ? '▲' : '絞り込む▼'}</span>
            </button>
            {keywordsExpanded && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allKeywords.map(kw => {
                  const selected = selectedKeywords.includes(kw)
                  return (
                    <button
                      key={kw}
                      onClick={() => toggleKeyword(kw)}
                      className={`flex-shrink-0 text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                        selected
                          ? 'bg-brand text-white'
                          : 'border border-slate-300 text-slate-500 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {kw}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">演習</span>
              {(['all', 'studied', 'unstudied'] as PracticeFilter[]).map(f => {
                const labels: Record<PracticeFilter, string> = {
                  all: 'すべて', studied: '済み', unstudied: '未',
                }
                return (
                  <button
                    key={f}
                    onClick={() => setPracticeFilter(f)}
                    className={`text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                      practiceFilter === f
                        ? 'bg-brand text-white'
                        : 'border border-slate-300 text-slate-500 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {labels[f]}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">並び替え</span>
              {(['score', 'year'] as SortMode[]).map(s => {
                const labels: Record<SortMode, string> = { score: '点数順', year: '年度順' }
                return (
                  <button
                    key={s}
                    onClick={() => setSortMode(s)}
                    className={`text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                      sortMode === s
                        ? 'bg-brand text-white'
                        : 'border border-slate-300 text-slate-500 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>

            {hasFilter && (
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 transition-colors ml-auto"
              >
                絞り込みをリセット
              </button>
            )}
          </div>
        </section>

        <p className="text-[11px] text-slate-500 bg-brand-light/30 border border-brand-light rounded-lg px-3 py-2">
          問題をタップで、記録・解答欄・公式解答・PDFを確認
        </p>

        <ProblemTable
          rows={pm1Filtered}
          studiedCount={practiceFilter === 'all' ? pm1StudiedCount : pm1Filtered.length}
          sortMode={sortMode}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          onRecord={setRecordModal}
          onDeleteRecord={handleDeleteRecord}
          onPlanChange={handlePlanChange}
        />

      </div>

      {recordModal && (
        <RecordModal
          problem={recordModal}
          onSave={handleSaveRecord}
          onClose={() => setRecordModal(null)}
        />
      )}
    </div>
  )
}
