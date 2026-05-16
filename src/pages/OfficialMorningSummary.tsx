import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { officialMorningQuestions } from '../data/officialMorningQuestions'
import type { OfficialMorningQuestion } from '../types'

/**
 * 公式午前II サマリー画面（没入型、/morning/summary）
 *
 * 設計書 v0.15 §2.5 / §7 に基づく:
 * - 正答率
 * - 誤答リスト
 * - 「再挑戦」「トップへ戻る」ボタン
 *
 * 直接 URL アクセスや state 喪失時はトップへリダイレクト。
 */

interface SummaryLog {
  questionId: string
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
}

interface LocationState {
  logs?: SummaryLog[]
  scope?: 'random' | 'year' | 'important' | 'single' | 'category'
  yearLabel?: string
}

interface WrongRow {
  question: OfficialMorningQuestion
  selectedIndex: 0 | 1 | 2 | 3
}

export default function OfficialMorningSummary() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  useEffect(() => {
    if (!state.logs || state.logs.length === 0) {
      navigate('/morning', { replace: true })
    }
  }, [state.logs, navigate])

  const logs = state.logs ?? []
  const total = logs.length
  const correctCount = logs.filter((l) => l.isCorrect).length
  const rate = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const wrongRows: WrongRow[] = useMemo(
    () =>
      logs
        .filter((l) => !l.isCorrect)
        .map((l) => {
          const q = officialMorningQuestions.find((q) => q.id === l.questionId)
          return q ? { question: q, selectedIndex: l.selectedIndex } : null
        })
        .filter((x): x is WrongRow => x !== null),
    [logs],
  )

  if (total === 0) return null

  // 結果の見た目クラス
  const rateColorClass =
    rate >= 80 ? 'text-emerald-600'
    : rate >= 60 ? 'text-amber-500'
    : 'text-red-500'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* ヘッダー（没入型） */}
      <header className="bg-brand text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <p className="font-bold text-sm flex-1">公式午前II サマリー</p>
          {state.yearLabel && (
            <span className="text-xs bg-brand-dark text-white/90 rounded-full px-2.5 py-1">
              {state.yearLabel}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12 space-y-5">

        {/* スコアカード */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">正答率</p>
          <p className={`text-5xl font-black tabular-nums ${rateColorClass}`}>{rate}%</p>
          <p className="text-sm text-slate-500 mt-2">
            {correctCount} / {total} 問 正解
          </p>
        </section>

        {/* 誤答リスト */}
        {wrongRows.length > 0 ? (
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              誤答した問題（{wrongRows.length}件）
            </h2>
            <ul className="space-y-2">
              {wrongRows.map(({ question, selectedIndex }) => (
                <li
                  key={question.id}
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3"
                >
                  <p className="text-[11px] text-slate-400 mb-1">
                    {question.yearLabel} 問{question.number}
                  </p>
                  <p className="text-sm text-slate-700 leading-snug line-clamp-3">
                    {question.questionText}
                  </p>
                  {/* シャッフル出題のため、ラベル（ア/イ…）ではなく選択肢テキストで表示 */}
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-red-500">
                      <span className="font-bold mr-1">あなたの解答:</span>
                      <span className="text-slate-700">{question.choices[selectedIndex]}</span>
                    </p>
                    <p className="text-emerald-600">
                      <span className="font-bold mr-1">正解:</span>
                      <span className="text-slate-700">{question.choices[question.correctIndex]}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold text-emerald-700">全問正解おめでとうございます！</p>
          </section>
        )}

        {/* アクションボタン */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/morning')}
            className="py-3 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand transition-colors"
          >
            公式午前IIトップへ
          </button>
          <Link
            to="/"
            className="py-3 rounded-xl bg-brand text-white text-sm font-bold text-center hover:bg-brand-dark transition-colors"
          >
            ホームへ戻る
          </Link>
        </section>
      </main>
    </div>
  )
}
