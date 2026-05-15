import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { categories } from '../data/categories'
import type { Question } from '../types'
import { isImportant } from '../lib/importantMarks'

// dangerouslySetInnerHTML を使わず React 要素でハイライト
function highlight(text: string, kw: string): React.ReactNode {
  if (!kw) return text
  const idx = text.toLowerCase().indexOf(kw.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 rounded px-0.5">
        {text.slice(idx, idx + kw.length)}
      </mark>
      {text.slice(idx + kw.length)}
    </>
  )
}

// ─── 問題詳細モーダル ───────────────────────────────────────────
interface QuestionModalProps {
  question: Question
  kw: string
  onClose: () => void
}

function QuestionModal({ question, kw, onClose }: QuestionModalProps) {
  const navigate = useNavigate()
  const cat = categories.find((c) => c.id === question.topicId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="問題詳細"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {cat && (
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                style={{ backgroundColor: '#1a3a5c' }}
              >
                {cat.name}
              </span>
            )}
            {isImportant(question.id) && (
              <span className="text-xs text-amber-600 font-bold">★ 重要</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 問題文 */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">問題</p>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {highlight(question.questionText.replace('{{blank}}', '＿＿＿＿'), kw)}
            </p>
          </div>

          {/* 選択肢 */}
          {question.choices.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">選択肢</p>
              <ul className="space-y-1.5">
                {question.choices.map((choice, i) => {
                  const isCorrect = choice === question.correctAnswer
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {highlight(choice, kw)}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* 正解 */}
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">正解</p>
            <p className="text-sm font-bold text-blue-800">
              {highlight(question.correctAnswer, kw)}
            </p>
          </div>

          {/* 解説 */}
          {question.explanation && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">解説</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {highlight(question.explanation, kw)}
              </p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-3">
          <button
            onClick={() => navigate(`/quiz?mode=topic&category=${question.topicId}`)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#1a3a5c' }}
          >
            このカテゴリの問題を解く →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── メインページ ────────────────────────────────────────────────
export default function Search() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Question | null>(null)

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    []
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return questions.filter(
      (question) =>
        question.questionText.toLowerCase().includes(q) ||
        question.correctAnswer.toLowerCase().includes(q) ||
        question.explanation.toLowerCase().includes(q) ||
        question.choices.some((c) => c.toLowerCase().includes(q))
    )
  }, [query])

  const kw = query.trim()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-4 pb-12">
        {/* ページタイトル */}
        <h1 className="text-lg font-black text-slate-800 mb-4">問題を検索</h1>

        {/* 検索ボックス */}
        <div className="relative mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            aria-label="問題を検索"
            placeholder="キーワードで問題を検索（例：BPDU、OSPF…）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="クリア"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 初期状態 */}
        {!query && (
          <div className="text-center py-16 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <p className="text-sm">キーワードを入力して問題を検索</p>
            <p className="text-xs mt-1 opacity-70">問題文・正解・解説から全文検索</p>
          </div>
        )}

        {/* 検索結果 */}
        {query && (
          <>
            <p className="text-xs text-slate-400 mb-3">
              {results.length > 0
                ? `${results.length} 件の問題が見つかりました（タップで詳細表示）`
                : '該当する問題がありません'}
            </p>
            <div className="space-y-3">
              {results.map((q) => {
                const cat = categoryMap.get(q.topicId)
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="w-full text-left bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm hover:border-blue-400 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {/* カテゴリ・重要バッジ */}
                    <div className="flex items-center gap-2 mb-2">
                      {cat && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: '#1a3a5c' }}
                        >
                          {cat.name}
                        </span>
                      )}
                      {isImportant(q.id) && (
                        <span className="text-xs text-amber-600 font-bold">★ 重要</span>
                      )}
                    </div>

                    {/* 問題文 */}
                    <p className="text-sm text-slate-800 leading-relaxed mb-1">
                      {highlight(q.questionText.replace('{{blank}}', '＿＿＿＿'), kw)}
                    </p>

                    {/* 正解プレビュー */}
                    <p className="text-xs text-blue-700 font-medium">
                      正解：{highlight(q.correctAnswer, kw)}
                    </p>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 問題詳細モーダル */}
      {selected && (
        <QuestionModal
          question={selected}
          kw={kw}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
