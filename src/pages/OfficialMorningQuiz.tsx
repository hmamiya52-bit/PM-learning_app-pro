import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  officialMorningQuestions,
  getMorningQuestionsByYear,
  MORNING_YEARS,
} from '../data/officialMorningQuestions'
import { categories } from '../data/categories'
import { getImportantIds } from '../lib/importantMarks'
import { loadMorningRecords, getOverallAccuracy } from '../lib/morningRecords'
import type { OfficialMorningQuestion } from '../types'

/**
 * 公式午前II トップ画面（/morning）
 *
 * 設計書 v0.15 §2.5 / §7 に基づく:
 * - 全範囲ランダム + 問題数セレクタ（10/25/50/全問、デフォルト25）
 * - 重要マークのみフィルタボタン
 * - 年度別カード
 * - 画面下部に IPA 出典フッタ
 *
 * 出題開始時は `/morning/session` に navigate し、state で問題リストを渡す。
 */

type QuestionCount = 10 | 25 | 50 | 'all'

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function OfficialMorningQuiz() {
  const navigate = useNavigate()
  const [count, setCount] = useState<QuestionCount>(25)

  const allCount = officialMorningQuestions.length
  const importantIds = useMemo(
    () => new Set(getImportantIds().filter((id) => id.startsWith('om-'))),
    [],
  )
  const importantQuestions = useMemo(
    () => officialMorningQuestions.filter((q) => importantIds.has(q.id)),
    [importantIds],
  )

  // カテゴリ別グルーピング（categoryId が設定されている問題のみ）
  const byCategory = useMemo(() => {
    const map = new Map<string, OfficialMorningQuestion[]>()
    for (const q of officialMorningQuestions) {
      if (!q.categoryId) continue
      const list = map.get(q.categoryId) ?? []
      list.push(q)
      map.set(q.categoryId, list)
    }
    return map
  }, [])

  // カテゴリ一覧（順序維持・問題が存在するものだけ）
  const categoryCards = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, count: byCategory.get(c.id)?.length ?? 0 }))
        .filter((c) => c.count > 0),
    [byCategory],
  )

  const stats = useMemo(() => {
    const overall = getOverallAccuracy()
    const records = loadMorningRecords()
    return {
      total: overall.total,
      correct: overall.correct,
      rate: overall.rate,
      latestDate: records[0]?.answeredAt.slice(0, 10) ?? null,
    }
  }, [])

  // 出題リストを構築して Session 画面へ
  const startSession = (
    list: OfficialMorningQuestion[],
    scope: 'random' | 'year' | 'important' | 'single' | 'category',
    yearLabel?: string,
  ) => {
    const shuffled = shuffle(list)
    const limited = count === 'all' ? shuffled : shuffled.slice(0, count)
    if (limited.length === 0) {
      alert('出題できる問題がありません。')
      return
    }
    navigate('/morning/session', {
      state: { questionIds: limited.map((q) => q.id), scope, yearLabel },
    })
  }

  const handleRandom = () =>
    startSession(officialMorningQuestions, 'random')

  const handleImportant = () => {
    if (importantQuestions.length === 0) {
      alert('重要マーク済みの公式午前II問題がありません。\n問題画面の ☆ をタップしてマークしてください。')
      return
    }
    startSession(importantQuestions, 'important')
  }

  const handleYear = (year: string) => {
    const list = getMorningQuestionsByYear(year)
    if (list.length === 0) return
    const yearLabel = list[0].yearLabel
    startSession(list, 'year', yearLabel)
  }

  const handleCategory = (categoryId: string) => {
    const list = byCategory.get(categoryId) ?? []
    if (list.length === 0) return
    const name = categories.find((c) => c.id === categoryId)?.name ?? categoryId
    // yearLabel フィールドにカテゴリ名を流用（Summary 画面の表示用、scope=category で区別）
    startSession(list, 'category', name)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-5">

        {/* Header */}
        <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
          <h1 className="text-base font-black leading-snug">公式午前II問題</h1>
          <p className="text-xs text-white/80 mt-0.5">
            IPA公式 過去問4択 全{allCount}問
            {stats.total > 0 && (
              <>
                <span className="mx-1.5 opacity-50">|</span>
                これまでに {stats.total}問 解答（正答率 {stats.rate}%）
              </>
            )}
          </p>
        </header>

        {/* 問題数セレクタ */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            出題数（ランダム時に適用）
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {([10, 25, 50, 'all'] as QuestionCount[]).map((n) => (
              <button
                key={String(n)}
                onClick={() => setCount(n)}
                className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${
                  count === n
                    ? 'bg-brand text-white'
                    : 'border border-slate-300 text-slate-500 hover:border-brand hover:text-brand'
                }`}
              >
                {n === 'all' ? '全問' : `${n}問`}
              </button>
            ))}
          </div>
        </section>

        {/* メインアクション */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleRandom}
            className="flex items-center gap-3 bg-white rounded-xl border-2 border-brand-light px-4 py-4 hover:border-brand hover:shadow-md transition-all text-left"
          >
            <span className="text-2xl flex-shrink-0">🎲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">全範囲ランダム</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                全{allCount}問から {count === 'all' ? '全問' : `${count}問`} を出題
              </p>
            </div>
          </button>

          <button
            onClick={handleImportant}
            disabled={importantQuestions.length === 0}
            className="flex items-center gap-3 bg-white rounded-xl border-2 border-amber-100 px-4 py-4 hover:border-amber-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl flex-shrink-0">⭐</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">重要マークのみ</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                マーク済み {importantQuestions.length}問
              </p>
            </div>
          </button>
        </section>

        {/* カテゴリ別カード */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            カテゴリ別
          </h2>
          {categoryCards.length === 0 ? (
            <p className="text-xs text-slate-400">
              カテゴリ別問題はまだ登録されていません。
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoryCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategory(c.id)}
                  className="flex flex-col items-start bg-white rounded-xl border border-slate-200 px-3 py-2.5 hover:border-brand hover:shadow-md transition-all text-left"
                >
                  <p className="text-sm font-bold text-slate-800 leading-tight">{c.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.count}問
                    <span className="ml-1 opacity-60">{count === 'all' ? '・全問' : `・最大${count}問`}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">
            ※ 各カテゴリで上記「出題数」設定が適用されます（指定数を超える場合はランダム抽出）。
          </p>
        </section>

        {/* 年度カード */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            年度別
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MORNING_YEARS.map((year) => {
              const list = getMorningQuestionsByYear(year)
              const yearLabel = list[0]?.yearLabel ?? year
              return (
                <button
                  key={year}
                  onClick={() => handleYear(year)}
                  disabled={list.length === 0}
                  className="flex flex-col items-start bg-white rounded-xl border border-slate-200 px-3 py-2.5 hover:border-brand hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-bold text-slate-800">{yearLabel}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{list.length}問</p>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ※ F1段階ではサンプル年度のみ。F2-P3 で全年度（H25〜現行）に拡張予定。
          </p>
        </section>

        {/* IPA 出典フッタ */}
        <footer className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold mb-1">出典について</p>
          <p>
            本アプリは独立行政法人情報処理推進機構（IPA）が公開する情報処理技術者試験
            プロジェクトマネージャ試験 午前II の過去問題を引用しています。
            問題文・選択肢は IPA 公式のまま引用しています（改変なし）。解説は本アプリ独自作成です。
          </p>
        </footer>

      </div>
    </div>
  )
}
