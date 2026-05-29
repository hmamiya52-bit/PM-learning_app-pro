import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { officialAnswers } from '../data/officialAnswers'
import type { OfficialAnswerSet } from '../data/officialAnswers'
import { afternoonProblems } from '../data/afternoonProblems'
import { processRows, BORDER_OUTER, BORDER_INNER, BORDER_HEAD } from '../lib/answerTable'
import { addRecord, getMaxScore, loadRecords } from '../lib/tracker'
import { scoringMap } from '../data/scoringMap'
import { addActivityEvent } from '../lib/activityLog'
import { applyAfternoonRecord } from '../lib/gamification'  // F1-P-1 D-LIB-01 リネーム
import {
  loadSavedAnswers,
  loadSavedScorings,
  saveSavedAnswerSnapshot,
  type AfternoonAnswerMap,
  type AfternoonMarking,
  type AfternoonScoringMap,
} from '../lib/afternoonSavedAnswers'
import BadgeUnlockToast from '../components/gamification/BadgeUnlockToast'
import type { BadgeDefinition } from '../data/badges'
import { getAfternoonExplanation, makeRowKey, type AfternoonRowExplanation } from '../data/afternoonExplanations'

// ----------------------------------------------------------------
// Types & storage
// ----------------------------------------------------------------

type MyAnswers = AfternoonAnswerMap
type Marking = AfternoonMarking
type Scorings = AfternoonScoringMap

function storageKey(id: string) { return `pmap:myAnswer:${id}` }

function loadMyAnswers(id: string): MyAnswers {
  try {
    const raw = localStorage.getItem(storageKey(id))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveMyAnswers(id: string, answers: MyAnswers) {
  localStorage.setItem(storageKey(id), JSON.stringify(answers))
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ----------------------------------------------------------------
// Timer hook
// ----------------------------------------------------------------

function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    setRunning(true)
  }, [])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setElapsed(0)
    setRunning(false)
  }, [])

  useEffect(() => () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return { elapsed, running, start, pause, reset, fmt }
}

// ----------------------------------------------------------------
// Answer input table
// ----------------------------------------------------------------

function AnswerInputTable({
  answerSet,
  myAnswers,
  onChange,
  checkMode,
  scorings,
  onMark,
  readOnly = false,
  rowExplanations,
}: {
  answerSet: OfficialAnswerSet
  myAnswers: MyAnswers
  onChange: (rowIndex: string, value: string) => void
  checkMode: boolean
  scorings: Scorings
  onMark: (rowIndex: string, marking: Marking) => void
  readOnly?: boolean
  rowExplanations?: Record<string, AfternoonRowExplanation>
}) {
  const rows = processRows(answerSet.answers)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs" style={{ border: BORDER_OUTER }}>
        <colgroup>
          <col style={{ width: '4rem' }} />
          <col style={{ width: '3.5rem' }} />
          <col />
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <th
              colSpan={2}
              className="py-1.5 px-2 text-center font-bold text-slate-700"
              style={{ border: BORDER_HEAD }}
            >
              設問
            </th>
            <th
              className="py-1.5 px-2 text-left font-bold text-slate-700"
              style={{ border: BORDER_HEAD }}
            >
              解答
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKey = String(row.rowIndex)
            const val = myAnswers[rowKey] ?? ''
            const renderQ = row.showQ && row.qLabel !== ''
            const answerColspan = row.showQ && row.qLabel === '' ? 2 : 1
            const selectedMarking = scorings[rowKey]
            const markingLabels: Record<Marking, string> = { correct: '○', partial: '△', wrong: '×' }
            const markingText: Record<Marking, string> = { correct: '正解', partial: '部分点', wrong: '不正解' }

            const markingControls = checkMode && readOnly && selectedMarking ? (
              <div className="flex gap-2.5 px-1 pb-1.5 pt-0.5">
                <span className="text-[11px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">
                  自己採点: {markingLabels[selectedMarking]} {markingText[selectedMarking]}
                </span>
              </div>
            ) : checkMode && !readOnly ? (
              <div className="flex gap-2.5 px-1 pb-1.5 pt-0.5">
                {(['correct', 'partial', 'wrong'] as Marking[]).map(m => {
                  const isSelected = scorings[rowKey] === m
                  const colors: Record<Marking, string> = {
                    correct: isSelected ? 'bg-emerald-500 text-white' : 'border border-emerald-400 text-emerald-600',
                    partial: isSelected ? 'bg-amber-400 text-white' : 'border border-amber-400 text-amber-600',
                    wrong:   isSelected ? 'bg-red-500 text-white'   : 'border border-red-400 text-red-500',
                  }
                  return (
                    <button
                      key={m}
                      onClick={() => onMark(rowKey, m)}
                      className={`text-[11px] font-bold rounded px-1.5 py-0.5 transition-colors ${colors[m]}`}
                    >
                      {markingLabels[m]}
                    </button>
                  )
                })}
              </div>
            ) : null

            const exp = checkMode ? rowExplanations?.[makeRowKey(row.s, row.q, row.t)] : undefined
            const explanationAccordion = exp ? (
              <details className="mx-1 mb-1 mt-0.5 rounded border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer select-none px-2 py-1 text-[11px] font-bold text-slate-600 marker:text-slate-400">
                  解説を見る
                </summary>
                <div className="px-2 pb-2 pt-0.5 space-y-1.5 text-[11px] leading-relaxed text-slate-700">
                  <p><span className="font-bold text-slate-500">出題の力点</span>：{exp.point}</p>
                  <p><span className="font-bold text-slate-500">本文の根拠</span>：{exp.basis}</p>
                  <p><span className="font-bold text-slate-500">なぜこの解答か</span>：{exp.reasoning}</p>
                  {exp.pitfall && (
                    <p><span className="font-bold text-amber-600">ありがちな失点</span>：{exp.pitfall}</p>
                  )}
                </div>
              </details>
            ) : null

            const inputContent = row.essay ? (
              <div>
                <textarea
                  className={`w-full min-h-[80px] sm:min-h-[56px] text-xs text-slate-800 border-0 outline-none resize-y bg-transparent leading-snug p-1.5 placeholder:text-slate-300 ${readOnly ? 'cursor-default' : ''}`}
                  placeholder="記述してください"
                  value={val}
                  onChange={e => !readOnly && onChange(rowKey, e.target.value)}
                  readOnly={readOnly}
                />
                <div className="text-right text-[10px] text-slate-400 pr-1 pb-0.5 leading-none">
                  {val.length} 文字
                </div>
                {checkMode && (
                  <div className="mx-1 mb-1 mt-0.5 border-t border-indigo-200 pt-1 text-[11px] text-indigo-800 bg-indigo-50 rounded px-2 py-1 leading-snug">
                    <span className="text-[10px] font-bold text-indigo-400 mr-1">解答例</span>
                    {row.a}
                  </div>
                )}
                {explanationAccordion}
                {markingControls}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className={`w-full text-xs text-slate-800 border-0 outline-none bg-transparent p-1.5 placeholder:text-slate-300 ${readOnly ? 'cursor-default' : ''}`}
                  placeholder="—"
                  value={val}
                  onChange={e => !readOnly && onChange(rowKey, e.target.value)}
                  readOnly={readOnly}
                />
                {checkMode && (
                  <div className="mx-1 mb-1 border-t border-indigo-200 pt-1 text-[11px] text-indigo-800 bg-indigo-50 rounded px-2 py-1 leading-snug">
                    <span className="text-[10px] font-bold text-indigo-400 mr-1">解答例</span>
                    {row.a}
                  </div>
                )}
                {explanationAccordion}
                {markingControls}
              </div>
            )

            return (
              <tr key={row.rowIndex} className="align-top">
                {/* 設問セル */}
                {row.showS && (
                  <td
                    rowSpan={row.sRowspan}
                    className="py-1.5 px-1 font-bold text-slate-700 whitespace-nowrap align-middle text-center"
                    style={{ border: BORDER_INNER }}
                  >
                    設問{row.s}
                  </td>
                )}

                {/* 小問セル: qLabel が空でない場合のみ */}
                {renderQ && (
                  <td
                    rowSpan={row.qRowspan}
                    className="py-1.5 px-1 text-slate-600 whitespace-nowrap align-middle text-center"
                    style={{ border: BORDER_INNER }}
                  >
                    {row.qLabel}
                  </td>
                )}

                {/* 解答セル */}
                <td
                  colSpan={answerColspan}
                  className="p-0"
                  style={{ border: BORDER_INNER }}
                >
                  {row.inlineT !== undefined ? (
                    <div className="flex items-stretch">
                      <div
                        className="flex items-center justify-center flex-shrink-0 text-slate-500 text-[11px] py-1 px-1.5 whitespace-nowrap"
                        style={{ borderRight: BORDER_INNER }}
                      >
                        {row.inlineT}
                      </div>
                      <div className="flex-1">{inputContent}</div>
                    </div>
                  ) : (
                    inputContent
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function AfternoonMyAnswer() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const viewRecordId = searchParams.get('recordId')

  return (
    <AfternoonMyAnswerContent
      key={`${id ?? 'missing'}:${viewRecordId ?? 'draft'}`}
      id={id}
      viewRecordId={viewRecordId}
    />
  )
}

function AfternoonMyAnswerContent({
  id,
  viewRecordId,
}: {
  id: string | undefined
  viewRecordId: string | null
}) {
  const navigate = useNavigate()
  const isViewMode = !!viewRecordId

  const answerSet = officialAnswers.find(a => a.id === id)
  const problem = answerSet ? afternoonProblems.find(p => p.id === answerSet.id) : null

  const [myAnswers, setMyAnswers] = useState<MyAnswers>(() => {
    if (viewRecordId) return loadSavedAnswers(viewRecordId)
    return id ? loadMyAnswers(id) : {}
  })
  const [checkMode, setCheckMode] = useState(isViewMode)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [scorings, setScorings] = useState<Scorings>(() => {
    if (viewRecordId) return loadSavedScorings(viewRecordId)
    return {}
  })
  const [recorded, setRecorded] = useState(false)
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null)
  const [savedXp, setSavedXp] = useState(0)
  const [pendingBadges, setPendingBadges] = useState<BadgeDefinition[]>([])

  const viewRecord = useMemo(() => {
    if (!viewRecordId) return null
    return loadRecords().find(r => r.id === viewRecordId) ?? null
  }, [viewRecordId])

  const attemptNumber = useMemo(() => {
    if (!viewRecordId || !id) return null
    const records = loadRecords()
      .filter(r => r.problemId === id)
      .sort((a, b) => a.date.localeCompare(b.date))
    const idx = records.findIndex(r => r.id === viewRecordId)
    return idx >= 0 ? idx + 1 : null
  }, [viewRecordId, id])

  const timer = useTimer()

  // 午後I 独自解説（F2-P8）。未投入の問は undefined（フォールバック）
  const explanation = useMemo(() => (id ? getAfternoonExplanation(id) : undefined), [id])
  const explanationByRowKey = useMemo(() => {
    const map: Record<string, AfternoonRowExplanation> = {}
    explanation?.rows.forEach((r) => { map[r.rowKey] = r })
    return map
  }, [explanation])

  useEffect(() => {
    if (id && !isViewMode) saveMyAnswers(id, myAnswers)
  }, [id, myAnswers, isViewMode])

  const handleChange = useCallback((rowIndex: string, value: string) => {
    setMyAnswers(prev => ({ ...prev, [rowIndex]: value }))
  }, [])

  const handleMark = useCallback((rowIndex: string, marking: Marking) => {
    setScorings(prev => {
      // 同じマーキングを再クリックしたら解除
      if (prev[rowIndex] === marking) {
        const next = { ...prev }
        delete next[rowIndex]
        return next
      }
      return { ...prev, [rowIndex]: marking }
    })
  }, [])

  const handleClear = () => {
    setShowClearModal(true)
  }

  if (!answerSet || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center space-y-3">
          <p className="text-slate-500">問題が見つかりません</p>
          <Link to="/afternoon/answers" className="text-indigo-600 text-sm hover:underline">← 解答例一覧に戻る</Link>
        </div>
      </div>
    )
  }

  // F1-P3: PMでは PM1 のみ。section 分岐を廃止し「午後Ⅰ」固定 + brand 系色
  const sectionLabel = '午後Ⅰ'
  const sectionColor = 'bg-brand-light text-brand-dark'

  const filledCount = Object.values(myAnswers).filter(v => v.trim()).length
  const totalRows = answerSet.answers.length

  // 採点計算
  const markedCount = Object.keys(scorings).length
  const maxScore = getMaxScore('PM1')
  const rowScores = scoringMap[id] ?? []
  const allRowsMarked = totalRows > 0 && markedCount === totalRows
  const calculatedScore = Object.entries(scorings).reduce((sum, [rowKey, marking]) => {
    const pts = rowScores[parseInt(rowKey)]
    if (!pts) return sum
    if (marking === 'correct') return sum + pts.correct
    if (marking === 'partial') return sum + pts.partial
    return sum
  }, 0)

  const handleRecordToTracker = () => {
    if (!allRowsMarked || recorded) return

    const record = addRecord({ problemId: id, date: today(), score: calculatedScore })
    saveSavedAnswerSnapshot(record.id, {
      answers: myAnswers,
      scorings,
      score: calculatedScore,
      savedAt: new Date().toISOString(),
    })
    // F1-P-1 D-LIB-01 リネーム: recordAfternoonXp(section, score) → applyAfternoonRecord(score, problemId)
    const result = applyAfternoonRecord(calculatedScore, id)
    addActivityEvent({
      type: 'afternoon-record',
      date: today(),
      createdAt: new Date().toISOString(),
      xp: result.xpGained,
      payload: {
        problemId: id,
        year: answerSet.year,
        section: 'PM1',  // F1-P3: PMでは PM1 固定
        number: answerSet.number,
        title: problem?.title ?? '',
        score: calculatedScore,
        recordId: record.id,
      },
    })
    if (result.newBadges.length > 0) {
      setPendingBadges(prev => [...prev, ...result.newBadges])
      const now = new Date()
      for (const badge of result.newBadges) {
        addActivityEvent({
          type: 'badge-unlock',
          date: now.toISOString().slice(0, 10),
          createdAt: now.toISOString(),
          xp: badge.xpBonus,
          payload: { badgeId: badge.id, badgeName: badge.name, tier: badge.tier },
        })
      }
    }
    setSavedXp(result.xpGained)
    if (id) saveMyAnswers(id, {})
    setMyAnswers({})
    setScorings({})
    setCheckMode(false)
    setRecorded(true)
    setSavedRecordId(record.id)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <section>
          <div className="rounded-xl bg-teal-700 text-white px-4 py-3 shadow-md flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {/* 年度バッジ */}
                <span className="text-[11px] font-bold bg-teal-500 rounded-full px-2 py-0.5 flex-shrink-0">
                  {answerSet.year}
                </span>
                {/* 午後Ⅰ/Ⅱ・問番号バッジ */}
                <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${sectionColor}`}>
                  {sectionLabel} 問{answerSet.number}
                </span>
              </div>
              <h1 className="text-sm font-black leading-snug">{problem?.title ?? '解答欄'}</h1>
            </div>
            <button
              onClick={() => navigate('/afternoon')}
              className="text-[11px] text-teal-300 hover:text-white transition-colors flex-shrink-0 mt-0.5"
            >
              ← 戻る
            </button>
          </div>
        </section>

        {/* PDFリンク */}
        {problem?.questionPdfUrl && (
          <div className="flex justify-end">
            <a href={problem.questionPdfUrl} target="_blank" rel="noopener noreferrer"
               className="text-xs text-slate-500 hover:text-indigo-600 hover:underline transition-colors">
              問題文 PDF を開く →
            </a>
          </div>
        )}

        {/* Timer + progress */}
        {!isViewMode && <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-slate-800 w-20 tabular-nums">
              {timer.fmt(timer.elapsed)}
            </span>
            <div>
              <div className="flex gap-1">
                {!timer.running ? (
                  <button onClick={timer.start} className="text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 rounded px-2.5 py-1 transition-colors">
                    ▶ 開始
                  </button>
                ) : (
                  <button onClick={timer.pause} className="text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded px-2.5 py-1 transition-colors">
                    ⏸ 一時停止
                  </button>
                )}
                <button onClick={timer.reset} className="text-[11px] font-bold text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded px-2.5 py-1 transition-colors">
                  リセット
                </button>
              </div>
              {!timer.running && timer.elapsed === 0 && (
                <p className="text-[10px] text-slate-400 mt-1">問題文を手元に用意してから開始</p>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-500">記入済み</span>
              <span className="text-[11px] font-bold text-slate-700">{filledCount} / {totalRows}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all"
                style={{ width: `${totalRows > 0 ? (filledCount / totalRows) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>}

        {/* 閲覧モードバナー */}
        {isViewMode && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-teal-700">
                {attemptNumber !== null ? `第${attemptNumber}回` : '過去'}の解答を確認中
                <span className="ml-1.5 font-normal text-teal-600">（編集不可）</span>
              </p>
              {viewRecord && (
                <p className="text-[10px] text-teal-600 mt-0.5">
                  解答日：{viewRecord.date.replace(/-/g, '/')} / スコア：{viewRecord.score}点
                </p>
              )}
            </div>
            <Link
              to={`/afternoon/answers/${id}/myAnswer`}
              className="text-[11px] font-bold text-teal-600 hover:text-teal-800 border border-teal-300 rounded-md px-2 py-1 bg-white transition-colors flex-shrink-0"
            >
              新たに解答する
            </Link>
          </div>
        )}

        {/* Action buttons */}
        {!isViewMode && <div className="flex justify-between items-center">
          {!isViewMode && (
            <button onClick={handleClear} className="text-[11px] text-red-400 hover:text-red-600 transition-colors">
              解答をクリア
            </button>
          )}
          <button
            onClick={() => {
              if (checkMode) {
                setCheckMode(false)
              } else if (isViewMode) {
                setCheckMode(true)
              } else {
                setShowFinishConfirm(true)
              }
            }}
            className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-colors ${isViewMode ? '' : ''} ${
              checkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
            } ${isViewMode ? 'ml-auto' : ''}`}
          >
            {checkMode ? '答え合わせ中 ✓' : '答え合わせ'}
          </button>
        </div>}

        {/* 採点結果カード */}
        {!isViewMode && checkMode && markedCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-amber-800">採点結果</p>
              <p className="text-[11px] text-amber-700">
                {markedCount} / {totalRows}問マーク済み
                <span className="mx-2 text-amber-400">|</span>
                推定スコア:
                <span className="font-bold ml-1 text-amber-900">{calculatedScore} / {maxScore}点</span>
              </p>
              {!allRowsMarked && (
                <p className="text-[10px] text-amber-600">
                  全設問を○/△/×で採点すると記録できます。
                </p>
              )}
            </div>
            <button
              onClick={handleRecordToTracker}
              disabled={recorded || !allRowsMarked}
              className={`text-xs font-bold rounded-lg px-3 py-1.5 flex-shrink-0 transition-colors ${
                recorded
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : !allRowsMarked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {recorded ? '記録済み ✓' : 'トラッカーに記録'}
            </button>
          </div>
        )}

        {/* 保存完了カード */}
        {savedRecordId && !isViewMode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-[12px] font-bold text-emerald-800">解答を保存しました。</p>
                {savedXp > 0 && (
                  <p className="text-[11px] text-amber-600 font-bold mt-0.5">+{savedXp} XP 獲得！</p>
                )}
              </div>
            </div>
            <Link
              to={`/afternoon/answers/${id}/myAnswer?recordId=${savedRecordId}`}
              className="text-[11px] font-bold text-emerald-700 border border-emerald-300 rounded-md px-2.5 py-1 bg-white hover:bg-emerald-50 transition-colors flex-shrink-0"
            >
              保存した解答を確認する →
            </Link>
          </div>
        )}

        {/* 問題全体の解説（概要）— 答え合わせ時のみ・デフォルト折りたたみ */}
        {checkMode && explanation?.overview && (
          <details className="bg-white rounded-xl border border-slate-200 px-4 py-2.5">
            <summary className="cursor-pointer select-none text-xs font-bold text-brand-dark marker:text-slate-400">
              この問題の解説（概要）
            </summary>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-700">{explanation.overview}</p>
          </details>
        )}

        {/* Input table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <AnswerInputTable
            answerSet={answerSet}
            myAnswers={myAnswers}
            onChange={handleChange}
            checkMode={checkMode}
            scorings={scorings}
            onMark={handleMark}
            readOnly={isViewMode}
            rowExplanations={explanationByRowKey}
          />
        </div>

        {/* Bottom check button */}
        {!isViewMode && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (checkMode) {
                  setCheckMode(false)
                } else {
                  setShowFinishConfirm(true)
                }
              }}
              className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-colors ${
                checkMode
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {checkMode ? '答え合わせ中 ✓' : '答え合わせ'}
            </button>
          </div>
        )}

        {/* 問題一覧へ戻る */}
        <div className="flex justify-center pt-2">
          <Link
            to="/afternoon"
            className="text-xs text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-lg px-4 py-2 hover:border-indigo-300 transition-colors"
          >
            ← 問題一覧へ戻る
          </Link>
        </div>

      </div>

      {/* 答え合わせ確認ダイアログ */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowFinishConfirm(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl px-6 py-5 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800">解答を終了しますか？</h3>
            <p className="text-xs text-slate-500">答え合わせモードに切り替えます。タイマーを一時停止します。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => { timer.pause(); setCheckMode(true); setShowFinishConfirm(false) }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirmation modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowClearModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl px-6 py-5 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800">解答をクリアしますか？</h3>
            <p className="text-xs text-slate-500">入力した解答がすべて消去されます。この操作は元に戻せません。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50">
                キャンセル
              </button>
              <button onClick={() => { setMyAnswers({}); if (id) saveMyAnswers(id, {}); setShowClearModal(false) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold">
                クリアする
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingBadges.length > 0 && (
        <BadgeUnlockToast
          badges={pendingBadges}
          onDone={() => setPendingBadges([])}
        />
      )}
    </div>
  )
}
