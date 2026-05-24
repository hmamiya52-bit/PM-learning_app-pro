import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { questions } from '../data/questions'
import { categories } from '../data/categories'
import {
  getImportantIds,
  toggleImportant,
  clearAllImportant,
  clearImportantOfMode,
} from '../lib/importantMarks'

/**
 * 重要マーク管理画面（/settings/important）
 *
 * 設計書 v0.15 §2.3 Step 6 に基づく:
 * - 全 pmap:important_questions を取得
 * - q-* と om-* を区別して2セクションに表示
 * - 各行: モードバッジ / 問題文抜粋 / 解除ボタン
 * - 上部に「クイズ全解除」「公式午前Ⅱ全解除」「全解除」ボタン
 *
 * NOTE: 公式午前Ⅱ問題（om-*）は F1-P4 で officialMorningQuestions が
 *       実装されるまで「ID表示のみ」となる。
 */

interface MarkedQuiz {
  id: string
  questionText: string
  topicId: string
  topicName: string
}

interface MarkedMorning {
  id: string
}

export default function ImportantMarks() {
  const [version, setVersion] = useState(0)

  // 重要マーク済みID取得（version 変更で再計算）
  const ids = useMemo(() => getImportantIds(), [version])

  const quizIds = ids.filter((id) => id.startsWith('q-'))
  const morningIds = ids.filter((id) => id.startsWith('om-'))

  // クイズ問題：questions から問題文を引く
  const markedQuiz: MarkedQuiz[] = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
    return quizIds
      .map((id) => {
        const q = questions.find((q) => q.id === id)
        if (!q) {
          return {
            id,
            questionText: '（問題データが見つかりません）',
            topicId: '',
            topicName: '不明',
          }
        }
        return {
          id,
          questionText: q.questionText,
          topicId: q.topicId,
          topicName: categoryMap.get(q.topicId) ?? q.topicId,
        }
      })
  }, [quizIds])

  // 公式午前Ⅱ：F1-P4 で実装されるまで ID 表示のみ
  const markedMorning: MarkedMorning[] = useMemo(
    () => morningIds.map((id) => ({ id })),
    [morningIds],
  )

  const totalCount = ids.length
  const refresh = () => setVersion((v) => v + 1)

  const handleRemove = (id: string) => {
    toggleImportant(id)
    refresh()
  }

  const handleClearQuiz = () => {
    if (!confirm('クイズ問題の重要マークを全て解除しますか？')) return
    clearImportantOfMode('q-')
    refresh()
  }

  const handleClearMorning = () => {
    if (!confirm('公式午前Ⅱ問題の重要マークを全て解除しますか？')) return
    clearImportantOfMode('om-')
    refresh()
  }

  const handleClearAll = () => {
    if (!confirm('すべての重要マークを解除しますか？\n（クイズ・公式午前Ⅱ 両方が対象）')) return
    clearAllImportant()
    refresh()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/settings" className="hover:text-brand transition-colors">設定</Link>
          <span>/</span>
          <span className="text-slate-600">重要マーク管理</span>
        </nav>

        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-800">重要マーク管理</h1>
            <p className="text-sm text-slate-500 mt-1">
              クイズ {quizIds.length} 件 / 公式午前Ⅱ {morningIds.length} 件
              <span className="mx-2 text-slate-300">|</span>
              合計 <span className="font-bold text-brand-dark">{totalCount}</span> 件
            </p>
          </div>
        </div>

        {/* 一括操作ボタン */}
        {totalCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              onClick={handleClearQuiz}
              disabled={quizIds.length === 0}
              className="text-xs font-bold rounded-md px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              クイズ全解除（{quizIds.length}件）
            </button>
            <button
              type="button"
              onClick={handleClearMorning}
              disabled={morningIds.length === 0}
              className="text-xs font-bold rounded-md px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              公式午前Ⅱ全解除（{morningIds.length}件）
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold rounded-md px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 transition-colors ml-auto"
            >
              全解除（{totalCount}件）
            </button>
          </div>
        )}

        {/* 空状態 */}
        {totalCount === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm">
            <p className="text-slate-500 text-sm">
              重要マーク済みの問題はありません。
            </p>
            <p className="text-slate-400 text-xs mt-1">
              問題画面の ☆ をタップしてマークしてください。
            </p>
            <Link
              to="/quiz?mode=random"
              className="inline-block mt-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm font-bold"
            >
              ランダム出題を始める
            </Link>
          </div>
        )}

        {/* クイズ問題セクション */}
        {markedQuiz.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              クイズ問題（{markedQuiz.length}件）
            </h2>
            <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {markedQuiz.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="inline-block text-[10px] font-bold rounded-full px-2 py-0.5 bg-brand-light text-brand-dark flex-shrink-0 mt-0.5">
                    クイズ
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">
                      <span className="font-mono">{item.id}</span>
                      <span className="mx-1.5 text-slate-300">|</span>
                      {item.topicName}
                    </p>
                    <p className="text-sm text-slate-700 leading-snug line-clamp-2">
                      {item.questionText}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 rounded px-2 py-1 hover:border-red-200 transition-colors flex-shrink-0"
                    aria-label={`${item.id} の重要マークを解除`}
                  >
                    解除
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 公式午前Ⅱ問題セクション */}
        {markedMorning.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              公式午前Ⅱ問題（{markedMorning.length}件）
            </h2>
            <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {markedMorning.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="inline-block text-[10px] font-bold rounded-full px-2 py-0.5 bg-indigo-100 text-indigo-700 flex-shrink-0">
                    午前Ⅱ
                  </span>
                  <p className="text-sm text-slate-700 font-mono flex-1 min-w-0 truncate">
                    {item.id}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 rounded px-2 py-1 hover:border-red-200 transition-colors flex-shrink-0"
                    aria-label={`${item.id} の重要マークを解除`}
                  >
                    解除
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 mt-1.5">
              ※ 問題本文の表示は F1-P4（公式午前Ⅱ 骨組み）で実装予定です。
            </p>
          </section>
        )}

        {/* フッターリンク */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/settings"
            className="text-xs text-slate-400 hover:text-brand border border-slate-200 rounded-lg px-4 py-2 hover:border-brand transition-colors"
          >
            ← 設定へ戻る
          </Link>
        </div>

      </div>
    </div>
  )
}
