import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  officialMorningQuestions,
  getMorningQuestionsByYear,
  MORNING_YEARS,
} from '../data/officialMorningQuestions'
import { categories } from '../data/categories'
import { getImportantIds } from '../lib/importantMarks'
import { loadMorningRecords } from '../lib/morningRecords'
import { getMorningChoiceShuffle, setMorningChoiceShuffle } from '../lib/preferences'
import MorningAchievementReport from '../components/morning/MorningAchievementReport'
import type { MorningRecord, OfficialMorningQuestion } from '../types'

/**
 * 公式午前Ⅱ トップ画面（/morning）
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
type MorningSessionScope =
  | 'random'
  | 'year'
  | 'important'
  | 'single'
  | 'category'
  | 'uncorrected'

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function latestResultMap(records: MorningRecord[]): Map<string, boolean> {
  const result = new Map<string, boolean>()
  for (const record of records) {
    if (!result.has(record.questionId)) {
      result.set(record.questionId, record.isCorrect)
    }
  }
  return result
}

export default function OfficialMorningQuiz() {
  const navigate = useNavigate()
  const [count, setCount] = useState<QuestionCount>(25)
  const [shuffleChoices, setShuffleChoices] = useState(() => getMorningChoiceShuffle())
  const [reportOpen, setReportOpen] = useState(false)
  const [morningRecords, setMorningRecords] = useState(() => loadMorningRecords())
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [importantOnly, setImportantOnly] = useState(false)
  const [wrongOnly, setWrongOnly] = useState(false)
  const [uncorrectedOnly, setUncorrectedOnly] = useState(false)

  const allCount = officialMorningQuestions.length
  const importantIds = useMemo(
    () => new Set(getImportantIds().filter((id) => id.startsWith('om-'))),
    [],
  )
  const importantQuestions = useMemo(
    () => officialMorningQuestions.filter((q) => importantIds.has(q.id)),
    [importantIds],
  )
  const latestResults = useMemo(() => latestResultMap(morningRecords), [morningRecords])
  const wrongQuestions = useMemo(
    () => officialMorningQuestions.filter((q) => latestResults.get(q.id) === false),
    [latestResults],
  )
  const correctedQuestionIds = useMemo(
    () => new Set(morningRecords.filter((r) => r.isCorrect).map((r) => r.questionId)),
    [morningRecords],
  )
  const uncorrectedQuestions = useMemo(
    () => officialMorningQuestions.filter((q) => !correctedQuestionIds.has(q.id)),
    [correctedQuestionIds],
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
  // 「未正解のみ」選択時は、各カテゴリの表示件数を「まだ正解していない残り問題数」に切り替える。
  const categoryCards = useMemo(
    () =>
      categories
        .map((c) => {
          const list = byCategory.get(c.id) ?? []
          const count = uncorrectedOnly
            ? list.filter((q) => !correctedQuestionIds.has(q.id)).length
            : list.length
          return { ...c, count, total: list.length }
        })
        .filter((c) => c.total > 0),
    [byCategory, uncorrectedOnly, correctedQuestionIds],
  )

  const stats = useMemo(() => {
    const total = morningRecords.length
    const correct = morningRecords.filter((r) => r.isCorrect).length
    return {
      total,
      correct,
      rate: total > 0 ? Math.round((correct / total) * 100) : 0,
      latestDate: morningRecords[0]?.answeredAt.slice(0, 10) ?? null,
    }
  }, [morningRecords])

  const selectedCategorySet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds])
  const selectedYearSet = useMemo(() => new Set(selectedYears), [selectedYears])

  const filteredQuestions = useMemo(
    () =>
      officialMorningQuestions.filter((q) => {
        if (selectedCategorySet.size > 0 && (!q.categoryId || !selectedCategorySet.has(q.categoryId))) {
          return false
        }
        if (selectedYearSet.size > 0 && !selectedYearSet.has(q.year)) {
          return false
        }
        if (importantOnly && !importantIds.has(q.id)) {
          return false
        }
        if (wrongOnly && latestResults.get(q.id) !== false) {
          return false
        }
        if (uncorrectedOnly && correctedQuestionIds.has(q.id)) {
          return false
        }
        return true
      }),
    [
      correctedQuestionIds,
      importantIds,
      importantOnly,
      latestResults,
      selectedCategorySet,
      selectedYearSet,
      uncorrectedOnly,
      wrongOnly,
    ],
  )

  const plannedCount =
    count === 'all' ? filteredQuestions.length : Math.min(count, filteredQuestions.length)

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []
    if (selectedCategoryIds.length > 0) {
      const names = selectedCategoryIds
        .map((id) => categories.find((c) => c.id === id)?.name ?? id)
        .join('・')
      labels.push(`カテゴリ: ${names}`)
    }
    if (selectedYears.length > 0) {
      const names = selectedYears
        .map((year) => getMorningQuestionsByYear(year)[0]?.yearLabel ?? year)
        .join('・')
      labels.push(`年度: ${names}`)
    }
    if (importantOnly) labels.push('重要マークのみ')
    if (wrongOnly) labels.push('直近不正解のみ')
    if (uncorrectedOnly) labels.push('未正解のみ')
    return labels
  }, [importantOnly, selectedCategoryIds, selectedYears, uncorrectedOnly, wrongOnly])

  // 出題リストを構築して Session 画面へ
  const startSession = (
    list: OfficialMorningQuestion[],
    scope: MorningSessionScope,
    yearLabel?: string,
  ) => {
    const shuffled = shuffle(list)
    const limited = count === 'all' ? shuffled : shuffled.slice(0, count)
    if (limited.length === 0) {
      alert('出題できる問題がありません。')
      return
    }
    navigate('/morning/session', {
      state: { questionIds: limited.map((q) => q.id), scope, yearLabel, shuffleChoices },
    })
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((id) => id !== year)
        : [...prev, year],
    )
  }

  const clearFilters = () => {
    setSelectedCategoryIds([])
    setSelectedYears([])
    setImportantOnly(false)
    setWrongOnly(false)
    setUncorrectedOnly(false)
  }

  const handleStartSelected = () => {
    if (filteredQuestions.length === 0) {
      alert('現在の条件に合う問題がありません。条件を変更してください。')
      return
    }
    const scope: MorningSessionScope =
      uncorrectedOnly ? 'uncorrected'
      : importantOnly ? 'important'
      : selectedCategoryIds.length > 0 ? 'category'
      : selectedYears.length > 0 ? 'year'
      : 'random'
    const label =
      activeFilterLabels.length > 0 ? activeFilterLabels.join(' / ') : '全範囲ランダム'
    startSession(filteredQuestions, scope, label)
  }

  const handleReportQuestion = (question: OfficialMorningQuestion) => {
    setReportOpen(false)
    startSession([question], 'single', `${question.yearLabel} 問${question.number}`)
  }

  const handleShuffleChoicesChange = (enabled: boolean) => {
    setShuffleChoices(enabled)
    setMorningChoiceShuffle(enabled)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-5">

        {/* Header */}
        <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black leading-snug">公式午前Ⅱ問題</h1>
              <p className="text-xs text-white/80 mt-0.5">
                IPA公式 過去問4択 全{allCount}問
                {stats.total > 0 && (
                  <>
                    <span className="mx-1.5 opacity-50">|</span>
                    これまでに {stats.total}問 解答（正答率 {stats.rate}%）
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMorningRecords(loadMorningRecords())
                setReportOpen(true)
              }}
              className="flex-shrink-0 rounded-xl bg-white px-3.5 py-2 text-sm font-black text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ▦ 達成度レポート
            </button>
          </div>
        </header>

        {/* 選択肢表示設定 */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            選択肢表示
          </h2>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white border border-slate-200 p-1.5">
            <button
              type="button"
              onClick={() => handleShuffleChoicesChange(false)}
              aria-pressed={!shuffleChoices}
              className={`rounded-lg px-3 py-2 text-left transition-colors ${
                !shuffleChoices
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm font-bold">公式順</span>
              <span className={`block text-[11px] mt-0.5 ${!shuffleChoices ? 'text-white/80' : 'text-slate-400'}`}>
                最初からア/イ/ウ/エ
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleShuffleChoicesChange(true)}
              aria-pressed={shuffleChoices}
              className={`rounded-lg px-3 py-2 text-left transition-colors ${
                shuffleChoices
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm font-bold">選択肢ランダム</span>
              <span className={`block text-[11px] mt-0.5 ${shuffleChoices ? 'text-white/80' : 'text-slate-400'}`}>
                出題中は①②③④
              </span>
            </button>
          </div>
        </section>

        {/* 出題条件 + 開始ボタン */}
        <section className="rounded-xl bg-white border-2 border-brand-light px-4 py-4 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-black text-slate-800">出題条件</h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {activeFilterLabels.length > 0 ? activeFilterLabels.join(' / ') : '全範囲'}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterLabels.length === 0}
              className="flex-shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed"
            >
              条件クリア
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                カテゴリ絞り込み
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCategoryIds([])}
                disabled={selectedCategoryIds.length === 0}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed"
              >
                全て解除
              </button>
            </div>
            {categoryCards.length === 0 ? (
              <p className="text-xs text-slate-400">
                カテゴリ別問題はまだ登録されていません。
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categoryCards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    aria-pressed={selectedCategorySet.has(c.id)}
                    className={`flex flex-col items-start rounded-lg border px-3 py-2 hover:shadow-sm transition-all text-left ${
                      selectedCategorySet.has(c.id)
                        ? 'bg-brand-light border-brand text-brand-darker'
                        : 'bg-white border-slate-200 hover:border-brand'
                    } ${uncorrectedOnly && c.count === 0 ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm font-bold leading-tight">{c.name}</p>
                    <p className={`text-[11px] mt-0.5 ${selectedCategorySet.has(c.id) ? 'text-brand-dark/80' : 'text-slate-400'}`}>
                      {uncorrectedOnly ? `残り${c.count}問` : `${c.count}問`}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              複数選択できます。未選択なら全カテゴリが対象です。
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                年度絞り込み
              </h3>
              <button
                type="button"
                onClick={() => setSelectedYears([])}
                disabled={selectedYears.length === 0}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed"
              >
                全て解除
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MORNING_YEARS.map((year) => {
                const list = getMorningQuestionsByYear(year)
                const yearLabel = list[0]?.yearLabel ?? year
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => toggleYear(year)}
                    disabled={list.length === 0}
                    aria-pressed={selectedYearSet.has(year)}
                    className={`flex flex-col items-start rounded-lg border px-3 py-2 hover:shadow-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedYearSet.has(year)
                        ? 'bg-brand-light border-brand text-brand-darker'
                        : 'bg-white border-slate-200 hover:border-brand'
                    }`}
                  >
                    <p className="text-sm font-bold">{yearLabel}</p>
                    <p className={`text-[11px] mt-0.5 ${selectedYearSet.has(year) ? 'text-brand-dark/80' : 'text-slate-400'}`}>
                      {list.length}問
                    </p>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              複数選択できます。未選択なら全年度が対象です。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <label
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                importantOnly
                  ? 'border-amber-300 bg-amber-50 text-slate-800'
                  : 'border-slate-200 text-slate-600 hover:border-amber-300'
              } ${!importantOnly && importantQuestions.length === 0 ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={importantOnly}
                disabled={!importantOnly && importantQuestions.length === 0}
                onChange={(event) => setImportantOnly(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span className="min-w-0">
                <span className="block font-bold">重要マークのみ</span>
                <span className="block text-[11px] text-slate-400">マーク済み {importantQuestions.length}問</span>
              </span>
            </label>

            <label
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                wrongOnly
                  ? 'border-red-300 bg-red-50 text-slate-800'
                  : 'border-slate-200 text-slate-600 hover:border-red-300'
              } ${!wrongOnly && wrongQuestions.length === 0 ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={wrongOnly}
                disabled={!wrongOnly && wrongQuestions.length === 0}
                onChange={(event) => {
                  setMorningRecords(loadMorningRecords())
                  setWrongOnly(event.target.checked)
                }}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span className="min-w-0">
                <span className="block font-bold">間違えた問題を復習</span>
                <span className="block text-[11px] text-slate-400">直近不正解 {wrongQuestions.length}問</span>
              </span>
            </label>

            <label
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                uncorrectedOnly
                  ? 'border-sky-300 bg-sky-50 text-slate-800'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              } ${!uncorrectedOnly && uncorrectedQuestions.length === 0 ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={uncorrectedOnly}
                disabled={!uncorrectedOnly && uncorrectedQuestions.length === 0}
                onChange={(event) => {
                  setMorningRecords(loadMorningRecords())
                  setUncorrectedOnly(event.target.checked)
                }}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span className="min-w-0">
                <span className="block font-bold">未正解のみ</span>
                <span className="block text-[11px] text-slate-400">
                  一度も正解していない {uncorrectedQuestions.length}問
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                対象 <span className="text-lg font-black tabular-nums text-slate-900">{filteredQuestions.length}</span> 問
              </span>
              <span className="text-slate-300">/</span>
              <label className="flex items-center gap-1.5">
                <span>今回</span>
                <select
                  value={String(count)}
                  onChange={(event) => {
                    const value = event.target.value
                    setCount(value === 'all' ? 'all' : Number(value) as QuestionCount)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="10">10問</option>
                  <option value="25">25問</option>
                  <option value="50">50問</option>
                  <option value="all">全問</option>
                </select>
                <span>を上限に出題</span>
              </label>
              <span className="font-bold tabular-nums text-brand-dark">
                実際 {plannedCount}問
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartSelected}
              disabled={filteredQuestions.length === 0}
              className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-black text-white shadow-md hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed sm:w-auto"
            >
              この条件で出題開始
            </button>
          </div>
        </section>

        {/* IPA 出典フッタ */}
        <footer className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold mb-1">出典について</p>
          <p>
            本アプリは独立行政法人情報処理推進機構（IPA）が公開する情報処理技術者試験
            プロジェクトマネージャ試験 午前Ⅱ の過去問題を引用しています。
            問題文・選択肢は IPA 公式のまま引用しています（改変なし）。解説は本アプリ独自作成です。
          </p>
        </footer>

      </div>

      <MorningAchievementReport
        open={reportOpen}
        questions={officialMorningQuestions}
        records={morningRecords}
        onClose={() => setReportOpen(false)}
        onOpenQuestion={handleReportQuestion}
      />
    </div>
  )
}
