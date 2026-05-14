import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { afternoonProblems, YEARS } from '../data/afternoonProblems'
import type { AfternoonProblem, ProblemSection } from '../data/afternoonProblems'
import { officialAnswers } from '../data/officialAnswers'
import {
  loadRecords, addRecord, deleteRecord,
  loadPlans, setPlan, removePlan, getMaxScore,
} from '../lib/tracker'
import type { PracticeRecord } from '../lib/tracker'

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
  // "YYYY-MM-DD" → "M/D"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [, m, d] = dateStr.split('-')
    return `${parseInt(m)}/${parseInt(d)}`
  }
  // already "M/D" or custom string
  return dateStr
}

function scoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return 'text-emerald-600'
  if (pct >= 0.6) return 'text-amber-500'
  return 'text-red-500'
}

// 年度インデックス（YEARS の順序を保持）
const YEAR_ORDER: Record<string, number> = {}
YEARS.forEach((y, i) => { YEAR_ORDER[y] = i })

function buildRows(
  section: ProblemSection,
  records: PracticeRecord[],
  plans: Record<string, string>,
  sortMode: SortMode,
): RowData[] {
  const maxScore = getMaxScore(section)
  const problems = afternoonProblems.filter(p => p.section === section)

  const rows: RowData[] = problems.map(problem => {
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

  // score mode: 演習済み→最高点降順, 未演習→YEARS 順
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
  const maxScore = getMaxScore(problem.section)
  const sectionLabel = problem.section === 'G1' ? '午後Ⅰ' : '午後Ⅱ'
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
            {sectionLabel} 問{problem.number} · {problem.yearLabel}
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
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
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
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
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
  const [planEditing, setPlanEditing] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  return (
    <div className="px-4 py-3 bg-slate-50/70 border-l-4 border-indigo-200 space-y-3">
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
            className="text-[11px] font-bold text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors"
          >
            🗒 公式解答を表示
          </Link>
        )}
      </div>

      {/* メタ情報行：周回 / 次回計画日 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
        <div>
          <span className="text-slate-400 font-bold mr-1">周回数</span>
          <span className="text-indigo-700 font-bold tabular-nums">{records.length}回</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">次回計画日</span>
          {planEditing ? (
            <input
              type="text"
              placeholder="例: 5/10"
              defaultValue={plannedDate ? formatDate(plannedDate) : ''}
              autoFocus
              className="w-20 border border-indigo-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
              const hasSaved = !!localStorage.getItem(`pmap:savedAnswers:${r.id}`)
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
        {/* ＋記録する：演習履歴の末尾 */}
        <button
          onClick={onRecord}
          className="mt-2 w-full text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-2.5 py-2 inline-flex items-center justify-center gap-1 transition-colors"
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
// Problem table
// ----------------------------------------------------------------

interface ProblemTableProps {
  section: ProblemSection
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
  section, rows, studiedCount, sortMode,
  expandedId, onToggleExpand,
  onRecord, onDeleteRecord, onPlanChange,
}: ProblemTableProps) {
  const label = section === 'G1' ? '午後Ⅰ' : '午後Ⅱ'
  const headerColor = section === 'G1' ? 'bg-blue-700' : 'bg-purple-700'
  const badgeColor = section === 'G1' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  const actualStudied = rows.filter(r => r.roundCount > 0).length
  // 年度・問・テーマ・回数・最高点・実施日・計画日・展開アイコン で 8 列。
  const COL_SPAN_MOBILE = 8

  return (
    <section>
      <h2 className={`text-xs font-bold text-white rounded-t-xl px-4 py-2 ${headerColor} flex items-center justify-between`}>
        <span>{label}</span>
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
                // score モード時のみセパレータを表示
                const isSeparator = sortMode === 'score' && i === studiedCount && studiedCount > 0 && i < rows.length
                const isExpanded = expandedId === row.problem.id
                return (
                  <Fragment key={row.problem.id}>
                    <tr
                      className={[
                        'align-middle cursor-pointer transition-colors',
                        isExpanded ? 'bg-indigo-50' : 'hover:bg-indigo-50/40',
                        isSeparator ? 'border-t-2 border-indigo-200' : 'border-t border-slate-100',
                      ].join(' ')}
                      onClick={() => onToggleExpand(row.problem.id)}
                      aria-expanded={isExpanded}
                    >
                      {/* 年度 */}
                      <td className="py-2 px-1 text-[10px] text-slate-500 whitespace-nowrap">
                        {row.problem.year}
                      </td>

                      {/* 問番号 */}
                      <td className="py-2 px-1">
                        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 whitespace-nowrap ${badgeColor}`}>
                          {row.problem.number}
                        </span>
                      </td>

                      {/* テーマ */}
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

                      {/* 回数 */}
                      <td className="py-2 px-0.5 text-center">
                        {row.roundCount > 0 ? (
                          <span className="text-[11px] font-bold text-indigo-600 tabular-nums">{row.roundCount}</span>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* 最高点 */}
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

                      {/* 実施日 */}
                      <td className="py-2 px-1 text-center text-[10px] text-slate-500 whitespace-nowrap">
                        {row.latestDate ? formatDate(row.latestDate) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 計画日 */}
                      <td className="py-2 px-1 text-center text-[10px] text-slate-500 whitespace-nowrap">
                        {row.plannedDate ? (
                          <span className="text-indigo-500 font-medium">{formatDate(row.plannedDate)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 展開トグルアイコン */}
                      <td className="py-2 px-0.5 text-center text-slate-400">
                        <span
                          className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </td>
                    </tr>

                    {/* 詳細インライン展開行 */}
                    {isExpanded && (
                      <tr className="border-t border-indigo-100">
                        <td colSpan={COL_SPAN_MOBILE} className="p-0">
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
  // 行タップで展開する詳細パネル：1度に1問のみ展開（インライン）
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [keywordsExpanded, setKeywordsExpanded] = useState(false)
  const [practiceFilter, setPracticeFilter] = useState<PracticeFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('score')

  // 全行データ（ソート済み）
  const g1Rows = useMemo(() => buildRows('G1', records, plans, sortMode), [records, plans, sortMode])
  const g2Rows = useMemo(() => buildRows('G2', records, plans, sortMode), [records, plans, sortMode])

  // 全キーワード一覧
  const allKeywords = useMemo(() => {
    const set = new Set<string>()
    afternoonProblems.forEach(p => p.keywords.forEach(kw => set.add(kw)))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [])

  // フィルタ
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

  const g1Filtered = useMemo(() => filterRows(g1Rows), [g1Rows, practiceFilter, selectedKeywords]) // eslint-disable-line react-hooks/exhaustive-deps
  const g2Filtered = useMemo(() => filterRows(g2Rows), [g2Rows, practiceFilter, selectedKeywords]) // eslint-disable-line react-hooks/exhaustive-deps

  // セパレータ用演習済み数（score モードのみ有効）
  const g1StudiedCount = useMemo(
    () => sortMode === 'score' ? g1Filtered.filter(r => r.roundCount > 0).length : 0,
    [g1Filtered, sortMode],
  )
  const g2StudiedCount = useMemo(
    () => sortMode === 'score' ? g2Filtered.filter(r => r.roundCount > 0).length : 0,
    [g2Filtered, sortMode],
  )

  // 全体の演習済み数（ヘッダー表示用・フィルタ前）
  const totalStudied = useMemo(
    () => [...g1Rows, ...g2Rows].filter(r => r.roundCount > 0).length,
    [g1Rows, g2Rows],
  )
  const totalProblems = g1Rows.length + g2Rows.length

  const hasFilter = selectedKeywords.length > 0 || practiceFilter !== 'all'

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  // 記録保存
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
          <div className="rounded-xl bg-indigo-700 text-white px-4 py-3 shadow-md">
            <h1 className="text-base font-black leading-snug">午後問題演習補助ツール</h1>
            <p className="text-xs text-indigo-200 mt-0.5 whitespace-nowrap">
              H25〜R7 全{totalProblems}問（午後Ⅰ / 午後Ⅱ）
              <span className="mx-1.5 opacity-50">|</span>
              演習済 {totalStudied} / {totalProblems}問
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="bg-white rounded-xl border border-slate-200 px-4 py-3 space-y-2.5">
          {/* キーワードチップ（折りたたみ） */}
          <div>
            <button
              onClick={() => setKeywordsExpanded(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <span>キーワード</span>
              {selectedKeywords.length > 0 && (
                <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0 leading-tight text-[9px]">
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
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {kw}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 絞り込みオプション */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* 演習状態フィルタ */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">演習</span>
              {(['all', 'studied', 'unstudied'] as PracticeFilter[]).map(f => {
                const labels: Record<PracticeFilter, string> = {
                  all: 'すべて',
                  studied: '済み',
                  unstudied: '未',
                }
                return (
                  <button
                    key={f}
                    onClick={() => setPracticeFilter(f)}
                    className={`text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                      practiceFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {labels[f]}
                  </button>
                )
              })}
            </div>

            {/* 並び替え */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">並び替え</span>
              {(['score', 'year'] as SortMode[]).map(s => {
                const labels: Record<SortMode, string> = {
                  score: '点数順',
                  year: '年度順',
                }
                return (
                  <button
                    key={s}
                    onClick={() => setSortMode(s)}
                    className={`text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                      sortMode === s
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>

            {/* リセット */}
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

        {/* 操作説明 */}
        <p className="text-[11px] text-slate-500 bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2">
          問題をタップで、記録・解答欄・公式解答・PDFを確認
        </p>

        {/* 午後Ⅰ テーブル */}
        <ProblemTable
          section="G1"
          rows={g1Filtered}
          studiedCount={practiceFilter === 'all' ? g1StudiedCount : g1Filtered.length}
          sortMode={sortMode}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          onRecord={setRecordModal}
          onDeleteRecord={handleDeleteRecord}
          onPlanChange={handlePlanChange}
        />

        {/* 午後Ⅱ テーブル */}
        <ProblemTable
          section="G2"
          rows={g2Filtered}
          studiedCount={practiceFilter === 'all' ? g2StudiedCount : g2Filtered.length}
          sortMode={sortMode}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          onRecord={setRecordModal}
          onDeleteRecord={handleDeleteRecord}
          onPlanChange={handlePlanChange}
        />

      </div>

      {/* Record modal */}
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
