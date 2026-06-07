import { Link, useParams } from 'react-router-dom'
import { getEssayProblemById } from '../data/essayProblems'
import { getEssaySampleAnswer } from '../data/essaySampleAnswers'
import { formatRecommendedChars } from '../lib/essayReview'
import { MarkupText } from '../components/MarkupText'

/**
 * 午後II 参考答案 閲覧画面（/essay/:id/sample）
 *
 * 問題一覧（EssayList）と解答画面（EssayTraining）から遷移できる、参考答案の専用ページ。
 * - 設問ごとに 設問文 ＋ 参考答案（Claude 著作の論述例の一つ）を表示。
 * - 冒頭に固定注記「これは論述例の一つです。唯一の正解ではありません」。
 * - 設計の意図（designNote）／ありがちな失点（pitfalls）も掲載。
 * - 未投入問は「参考答案準備中」フォールバック。
 */
export default function EssaySampleAnswerView() {
  const { id } = useParams<{ id: string }>()
  const problem = id ? getEssayProblemById(id) : undefined
  const sample = id ? getEssaySampleAnswer(id) : undefined

  if (!problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <p className="text-slate-500">問題が見つかりません</p>
        <Link to="/essay" className="text-brand underline text-sm">論述トレーニング一覧へ戻る</Link>
      </div>
    )
  }

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
          <span className="text-slate-600">参考答案</span>
        </nav>

        {/* Header */}
        <header className="rounded-xl bg-brand-dark text-white px-4 py-3 shadow-md">
          <p className="text-[11px] text-white/70">
            {problem.yearLabel} 問{problem.number} 参考答案
          </p>
          <h1 className="text-base font-black leading-snug mt-0.5">{problem.theme}</h1>
        </header>

        {sample ? (
          <>
            {/* 固定注記（唯一の正解ではない旨） */}
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed">
              これは論述例の一つです。唯一の正解ではありません。構成や具体化の仕方を学ぶ材料として活用してください。
            </p>

            {/* 問題文（冒頭）— 折りたたみ */}
            {problem.preamble && (
              <details className="bg-white border border-slate-200 rounded-xl group">
                <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">問題文（冒頭）を読む</span>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 border-t border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pt-2">{problem.preamble}</p>
                </div>
              </details>
            )}

            {/* 設問ごとに 設問文 ＋ 参考答案 */}
            {problem.setsumons.map((q) => {
              const ref = sample.byLabel[q.label] ?? ''
              return (
                <section key={q.label} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                    <p className="text-xs font-bold text-brand-dark">
                      設問{q.label}（推奨 {formatRecommendedChars(q.recommendedChars)}）
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1">{q.text}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] mb-1 tabular-nums" style={{ color: '#9d5b8b' }}>
                      参考答案（{ref.length}字）
                    </p>
                    <div
                      className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap rounded-md p-3 border"
                      style={{ backgroundColor: '#faf5f9', borderColor: '#e8d7e3' }}
                    >
                      {ref || <span className="text-slate-300 italic">（準備中）</span>}
                    </div>
                  </div>
                </section>
              )
            })}

            {/* 設計の意図 */}
            <section className="rounded-xl p-4" style={{ backgroundColor: '#faf5f9' }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: '#9d5b8b' }}>設計の意図</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                <MarkupText text={sample.designNote} />
              </p>
            </section>

            {/* ありがちな失点 */}
            {sample.pitfalls.length > 0 && (
              <section className="rounded-xl p-4 bg-rose-50 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 mb-2">ありがちな失点</p>
                <ul className="space-y-2">
                  {sample.pitfalls.map((pf, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-1.5">
                      <span className="text-rose-400 flex-shrink-0" aria-hidden="true">•</span>
                      <span><MarkupText text={pf} /></span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* アクション */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                to={`/essay/${problem.id}`}
                className="py-3 rounded-xl bg-brand text-white text-sm font-bold text-center hover:bg-brand-dark transition-colors"
              >
                この問題を解いてみる
              </Link>
              <Link
                to="/essay"
                className="py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 text-center hover:border-brand hover:text-brand transition-colors"
              >
                論述トレーニング一覧へ
              </Link>
            </div>
          </>
        ) : (
          <section className="bg-white border border-slate-200 rounded-xl px-4 py-8 text-center space-y-3">
            <p className="text-sm font-bold text-slate-500">📝 参考答案は準備中です</p>
            <p className="text-xs text-slate-400">この問題の参考答案は順次追加しています。</p>
            <Link to={`/essay/${problem.id}`} className="inline-block text-brand underline text-sm">
              解答画面へ戻る
            </Link>
          </section>
        )}

      </div>
    </div>
  )
}
