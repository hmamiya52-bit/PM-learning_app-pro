import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { essayProblems } from '../data/essayProblems'
import { essaySampleAnswers } from '../data/essaySampleAnswers'
import { loadAttempts, loadEssayPlans, loadActive } from '../lib/essay'

/**
 * 論述トレーニング 一覧画面（/essay）
 *
 * 設計書 v0.15 §2.6 Step 5 に基づく:
 * - 過去問一覧（年度×問番号）
 * - 各過去問の練習回数・最新練習日
 * - フィルタ: 全件 / 練習済み / 未着手
 * - 進行中のアクティブセッションがあれば上部に「続きから」バナー
 */

type Filter = 'all' | 'practiced' | 'unpracticed'

function fmtDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function EssayList() {
  const [filter, setFilter] = useState<Filter>('all')

  const attempts = useMemo(() => loadAttempts(), [])
  const plans = useMemo(() => loadEssayPlans(), [])
  const active = useMemo(() => loadActive(), [])

  const rows = useMemo(() => {
    return essayProblems.map((p) => {
      const myAttempts = attempts
        .filter((a) => a.problemId === p.id)
        .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
      return {
        problem: p,
        attemptCount: myAttempts.length,
        latestEndedAt: myAttempts[0]?.endedAt,
        plannedDate: plans[p.id],
        hasSample: Boolean(essaySampleAnswers[p.id]),
      }
    })
  }, [attempts, plans])

  const filteredRows = useMemo(() => {
    if (filter === 'practiced') return rows.filter((r) => r.attemptCount > 0)
    if (filter === 'unpracticed') return rows.filter((r) => r.attemptCount === 0)
    return rows
  }, [rows, filter])

  const totalPracticed = rows.filter((r) => r.attemptCount > 0).length
  const totalProblems = rows.length

  const activeProblem = active
    ? essayProblems.find((p) => p.id === active.problemId)
    : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
          <h1 className="text-base font-black leading-snug">論述トレーニング</h1>
          <p className="text-xs text-white/80 mt-0.5">
            PM試験 午後II（論述） 全{totalProblems}問
            <span className="mx-1.5 opacity-50">|</span>
            練習済 {totalPracticed} / {totalProblems}問
          </p>
        </header>

        {/* はじめに: 論述のコツ ガイドへの導線 */}
        <Link
          to="/essay/guide"
          className="block rounded-xl border-2 border-brand/30 bg-brand-light px-4 py-3 hover:border-brand transition-colors"
        >
          <p className="text-[11px] font-bold text-brand-dark">💡 はじめにお読みください</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">良い論述を書くためのコツ</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            出題方式・採点基準・高評価の7原則・インフラ経験のPM目線への変換・当日の時間配分 →
          </p>
        </Link>

        {/* 続きから バナー */}
        {active && activeProblem && (
          <Link
            to={`/essay/${active.problemId}`}
            className="block bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 hover:border-amber-500 transition-colors"
          >
            <p className="text-[11px] font-bold text-amber-700">⏸ 中断中のセッションがあります</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {activeProblem.yearLabel} 問{activeProblem.number} {activeProblem.theme}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">タップで続きから再開 →</p>
          </Link>
        )}

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 mr-1">演習</span>
          {(['all', 'practiced', 'unpracticed'] as Filter[]).map((f) => {
            const labels: Record<Filter, string> = {
              all: 'すべて', practiced: '済み', unpracticed: '未',
            }
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] rounded-full px-2 py-0.5 transition-colors ${
                  filter === f
                    ? 'bg-brand text-white'
                    : 'border border-slate-300 text-slate-500 hover:border-brand hover:text-brand'
                }`}
              >
                {labels[f]}
              </button>
            )
          })}
        </div>

        {/* 問題リスト */}
        {filteredRows.length === 0 ? (
          <p className="bg-white border border-slate-200 rounded-xl px-4 py-8 text-center text-sm text-slate-400">
            条件に一致する問題がありません
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredRows.map(({ problem, attemptCount, latestEndedAt, plannedDate, hasSample }) => (
              <li key={problem.id}>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-brand hover:shadow-sm transition-all flex items-stretch">
                  {/* 本体: タップで解答画面へ（大きいタップ領域） */}
                  <Link
                    to={`/essay/${problem.id}`}
                    className="flex-1 min-w-0 px-3.5 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                  >
                    <div className="flex items-center gap-2 flex-wrap text-[10px] leading-none">
                      <span className="font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                        {problem.yearLabel} 問{problem.number}
                      </span>
                      {attemptCount > 0 ? (
                        <span className="text-slate-400">
                          練習<span className="font-bold text-brand-dark tabular-nums">{attemptCount}</span>回
                          {latestEndedAt && <> ・ {fmtDate(latestEndedAt)}</>}
                        </span>
                      ) : (
                        <span className="text-slate-300">未着手</span>
                      )}
                      {plannedDate && <span className="text-brand">・ 計画 {plannedDate}</span>}
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-snug mt-1">
                      {problem.theme}
                    </p>
                  </Link>
                  {/* 右レール: 参考答案へのショートカット（全幅フッタ行を廃し縦幅を圧縮） */}
                  {hasSample && (
                    <Link
                      to={`/essay/${problem.id}/sample`}
                      aria-label={`${problem.yearLabel} 問${problem.number} の参考答案を見る`}
                      className="flex flex-col items-center justify-center gap-0.5 w-14 flex-shrink-0 border-l border-slate-100 text-[10px] font-bold hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                      style={{ color: '#9d5b8b' }}
                    >
                      <span aria-hidden="true" className="text-sm leading-none">📝</span>
                      <span className="leading-none">参考答案</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-slate-400 leading-relaxed">
          ※ 午後IIの公式設問を収録し、各問に参考答案（論述例）を用意しています。練習画面から公式問題冊子・出題趣旨・採点講評を確認できます。
        </p>

      </div>
    </div>
  )
}
