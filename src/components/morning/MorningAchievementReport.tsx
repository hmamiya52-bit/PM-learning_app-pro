import { useEffect, useMemo } from 'react'
import type { MorningRecord, OfficialMorningQuestion } from '../../types'

type AchievementState =
  | 'double-correct'
  | 'correct'
  | 'incorrect'
  | 'double-incorrect'
  | 'none'

interface MorningAchievementReportProps {
  open: boolean
  questions: OfficialMorningQuestion[]
  records: MorningRecord[]
  onClose: () => void
  onOpenQuestion: (question: OfficialMorningQuestion) => void
}

interface YearRow {
  year: string
  yearLabel: string
  questionsByNumber: Map<number, OfficialMorningQuestion>
}

const STATE_META: Record<
  AchievementState,
  { label: string; shortLabel: string; className: string; symbol: string }
> = {
  'double-correct': {
    label: '直前2回が正解',
    shortLabel: '連続正解',
    className: 'bg-amber-400 border-amber-500 text-white',
    symbol: '2○',
  },
  correct: {
    label: '直前1回が正解',
    shortLabel: '正解',
    className: 'bg-emerald-500 border-emerald-600 text-white',
    symbol: '○',
  },
  incorrect: {
    label: '直前1回が不正解',
    shortLabel: '不正解',
    className: 'bg-orange-400 border-orange-500 text-white',
    symbol: '×',
  },
  'double-incorrect': {
    label: '直前2回が不正解',
    shortLabel: '連続不正解',
    className: 'bg-red-500 border-red-600 text-white',
    symbol: '×2',
  },
  none: {
    label: '解答歴なし',
    shortLabel: '未解答',
    className: 'bg-white border-transparent text-slate-300',
    symbol: '',
  },
}

const LEGEND_STATES: AchievementState[] = [
  'double-correct',
  'correct',
  'incorrect',
  'double-incorrect',
  'none',
]

function getAchievementState(records: MorningRecord[] | undefined): AchievementState {
  if (!records || records.length === 0) return 'none'
  const [latest, previous] = records
  if (latest.isCorrect) {
    return previous?.isCorrect ? 'double-correct' : 'correct'
  }
  return previous && !previous.isCorrect ? 'double-incorrect' : 'incorrect'
}

function formatDate(value: string): string {
  return value.slice(0, 10)
}

export default function MorningAchievementReport({
  open,
  questions,
  records,
  onClose,
  onOpenQuestion,
}: MorningAchievementReportProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const rows = useMemo<YearRow[]>(() => {
    const yearOrder = new Map<string, number>()
    const map = new Map<string, YearRow>()

    for (const question of questions) {
      if (!yearOrder.has(question.year)) {
        yearOrder.set(question.year, yearOrder.size)
      }
      let row = map.get(question.year)
      if (!row) {
        row = {
          year: question.year,
          yearLabel: question.yearLabel,
          questionsByNumber: new Map<number, OfficialMorningQuestion>(),
        }
        map.set(question.year, row)
      }
      row.questionsByNumber.set(question.number, question)
    }

    return Array.from(map.values()).sort(
      (a, b) => (yearOrder.get(a.year) ?? 0) - (yearOrder.get(b.year) ?? 0),
    )
  }, [questions])

  const columns = useMemo(() => {
    const maxNumber = questions.reduce((max, question) => Math.max(max, question.number), 0)
    return Array.from({ length: maxNumber }, (_, index) => index + 1)
  }, [questions])

  const recordsByQuestionId = useMemo(() => {
    const map = new Map<string, MorningRecord[]>()
    for (const record of [...records].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))) {
      const list = map.get(record.questionId) ?? []
      list.push(record)
      map.set(record.questionId, list)
    }
    return map
  }, [records])

  const summary = useMemo(() => {
    const counts: Record<AchievementState, number> = {
      'double-correct': 0,
      correct: 0,
      incorrect: 0,
      'double-incorrect': 0,
      none: 0,
    }
    for (const question of questions) {
      counts[getAchievementState(recordsByQuestionId.get(question.id))] += 1
    }
    const answeredCount = questions.length - counts.none
    const answeredRate =
      questions.length > 0 ? Math.round((answeredCount / questions.length) * 1000) / 10 : 0
    return { counts, answeredCount, answeredRate }
  }, [questions, recordsByQuestionId])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 px-2 py-4 sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="morning-achievement-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center gap-3 bg-brand-dark px-4 py-3 text-white">
          <div className="min-w-0 flex-1">
            <h2 id="morning-achievement-title" className="text-base font-black">
              午前Ⅱ 達成度レポート
            </h2>
            <p className="mt-0.5 text-xs text-white/75">
              年度ごとの問番号をクリックすると、その問題を1問だけ演習できます。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white/90 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="達成度レポートを閉じる"
          >
            ×
          </button>
        </header>

        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs text-slate-500">全</span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {questions.length}
              </span>
              <span className="text-xs text-slate-500">問中</span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {summary.answeredCount}
              </span>
              <span className="text-xs text-slate-500">問 解答済み</span>
              <span className="text-xs text-slate-400">履歴 {records.length} 件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${summary.answeredRate}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-black tabular-nums text-slate-900">
                {summary.answeredRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <table className="w-full min-w-[920px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-30 w-28 bg-white py-1.5 pr-2 text-left text-[11px] font-bold text-slate-500">
                  年度
                </th>
                {columns.map((number) => (
                  <th
                    key={number}
                    className="sticky top-0 z-20 h-7 w-8 border-b border-slate-200 bg-white text-center text-[10px] font-bold tabular-nums text-slate-400"
                  >
                    {number}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.year} className="border-b border-slate-100">
                  <th className="sticky left-0 z-10 w-28 bg-white py-1.5 pr-2 text-left text-[11px] font-bold text-slate-700">
                    {row.yearLabel}
                  </th>
                  {columns.map((number) => {
                    const question = row.questionsByNumber.get(number)
                    if (!question) {
                      return <td key={number} className="h-8 w-8 bg-slate-50" />
                    }

                    const questionRecords = recordsByQuestionId.get(question.id)
                    const state = getAchievementState(questionRecords)
                    const meta = STATE_META[state]
                    const latestDate = questionRecords?.[0]?.answeredAt
                    const title = latestDate
                      ? `${question.yearLabel} 問${question.number}: ${meta.label}（最終 ${formatDate(latestDate)}）`
                      : `${question.yearLabel} 問${question.number}: ${meta.label}`

                    return (
                      <td key={number} className="h-8 w-8 border-l border-slate-100 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenQuestion(question)}
                          className={`mx-auto flex h-6 w-7 items-center justify-center rounded-md border text-[10px] font-black leading-none transition-colors hover:border-brand hover:ring-2 hover:ring-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${meta.className}`}
                          aria-label={title}
                          title={title}
                        >
                          {meta.symbol}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {LEGEND_STATES.map((state) => {
              const meta = STATE_META[state]
              return (
                <span key={state} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span
                    className={`flex h-5 w-7 items-center justify-center rounded-md border text-[9px] font-black leading-none ${meta.className}`}
                  >
                    {meta.symbol}
                  </span>
                  {meta.label}
                  <span className="font-bold tabular-nums text-slate-700">
                    {summary.counts[state]}
                  </span>
                </span>
              )
            })}
          </div>
        </footer>
      </section>
    </div>
  )
}
