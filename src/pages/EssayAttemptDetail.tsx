import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEssayProblemById } from '../data/essayProblems'
import { getAttempt } from '../lib/essay'

/**
 * 論述 履歴詳細画面（/essay/:id/attempts/:attemptId）
 *
 * 設計書 v0.15 §2.6 Step 7 に基づく:
 * - 過去 attempt の内容を読み取り専用で表示
 * - 設問・解答本文（ア/イ/ウ）・自己評価・振り返り
 */

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}時間${m}分${s}秒`
  return `${m}分${s}秒`
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const REVIEW_ITEMS = [
  { key: 'relevance',    label: '題意適合' },
  { key: 'structure',    label: '構造' },
  { key: 'concreteness', label: '具体性' },
  { key: 'consistency',  label: '一貫性' },
  { key: 'charCount',    label: '字数達成' },
] as const

export default function EssayAttemptDetail() {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>()
  const problem = id ? getEssayProblemById(id) : undefined
  const attempt = useMemo(() => (attemptId ? getAttempt(attemptId) : null), [attemptId])

  if (!problem || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <p className="text-slate-500">履歴が見つかりません</p>
        <Link to={problem ? `/essay/${problem.id}` : '/essay'} className="text-brand underline text-sm">
          論述トレーニング{problem ? '練習画面' : '一覧'}へ戻る
        </Link>
      </div>
    )
  }

  const totalChars =
    (attempt.bodyByLabel['ア']?.length ?? 0) +
    (attempt.bodyByLabel['イ']?.length ?? 0) +
    (attempt.bodyByLabel['ウ']?.length ?? 0)

  const avgReview = Math.round(
    ((attempt.selfReview.relevance +
      attempt.selfReview.structure +
      attempt.selfReview.concreteness +
      attempt.selfReview.consistency +
      attempt.selfReview.charCount) /
      5) *
      10,
  ) / 10

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/essay" className="hover:text-brand transition-colors">論述トレーニング</Link>
          <span>/</span>
          <Link to={`/essay/${problem.id}`} className="hover:text-brand transition-colors truncate">
            {problem.yearLabel} 問{problem.number}
          </Link>
          <span>/</span>
          <span className="text-slate-600">履歴詳細</span>
        </nav>

        {/* Header */}
        <header className="rounded-xl bg-brand-dark text-white px-4 py-3 shadow-md">
          <p className="text-[11px] text-white/70">
            {problem.yearLabel} 問{problem.number} 練習履歴
          </p>
          <h1 className="text-base font-black leading-snug mt-0.5">{problem.theme}</h1>
        </header>

        {/* メタ情報 */}
        <section className="bg-white border border-slate-200 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <p className="text-slate-400">開始</p>
            <p className="font-bold text-slate-700">{fmtDateTime(attempt.startedAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">終了</p>
            <p className="font-bold text-slate-700">{fmtDateTime(attempt.endedAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">経過時間</p>
            <p className="font-bold text-brand-dark tabular-nums">{fmtElapsed(attempt.elapsedSec)}</p>
          </div>
          <div>
            <p className="text-slate-400">総文字数</p>
            <p className="font-bold text-brand-dark tabular-nums">{totalChars}字</p>
          </div>
        </section>

        {/* 解答本文 */}
        {problem.setsumons.map((q) => {
          const body = attempt.bodyByLabel[q.label] ?? ''
          return (
            <section key={q.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs font-bold text-brand-dark">設問{q.label}</p>
                <p className="text-[10px] text-slate-400 tabular-nums">
                  {body.length}字 / 推奨 {q.recommendedChars.min}〜{q.recommendedChars.max}字
                </p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{q.text}</p>
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-md p-3">
                {body || <span className="text-slate-300 italic">（未入力）</span>}
              </div>
            </section>
          )
        })}

        {/* 自己評価 */}
        <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">自己評価</h2>
            <span className="text-xs text-brand-dark font-bold tabular-nums">平均 {avgReview} / 5</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {REVIEW_ITEMS.map((item) => (
              <li key={item.key} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-slate-700">{item.label}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`w-2 h-2 rounded-full ${
                        s <= attempt.selfReview[item.key] ? 'bg-brand' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-slate-500 tabular-nums w-6 text-right">
                    {attempt.selfReview[item.key]} / 5
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 振り返り */}
        {attempt.reflection && (
          <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">振り返り</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {attempt.reflection}
            </p>
          </section>
        )}

        {/* アクション */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            to={`/essay/${problem.id}`}
            className="py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 text-center hover:border-brand hover:text-brand transition-colors"
          >
            この問題で再挑戦
          </Link>
          <Link
            to="/essay"
            className="py-3 rounded-xl bg-brand text-white text-sm font-bold text-center hover:bg-brand-dark transition-colors"
          >
            論述トレーニング一覧へ
          </Link>
        </div>

      </div>
    </div>
  )
}
