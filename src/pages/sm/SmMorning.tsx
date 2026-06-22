import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BarChart3, ExternalLink, Lightbulb, RotateCcw } from 'lucide-react'
import { smFrequentThemes, smMorningFocusCards, smMorningQuestions } from '../../data/sm/content'
import type { SmChoice } from '../../data/sm/types'
import { addSmMorningRecord, clearSmMorningRecords, getSmThemeReadiness, loadSmMorningRecords } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome, SourceLinks } from './SmPageChrome'

type Filter = 'all' | 'unattempted' | 'wrong' | 's'
const choices: SmChoice[] = ['ア', 'イ', 'ウ', 'エ']

export default function SmMorning() {
  const [searchParams] = useSearchParams()
  const requestedThemeId = searchParams.get('theme')
  const initialThemeId = smFrequentThemes.some((theme) => theme.id === requestedThemeId) ? requestedThemeId ?? '' : ''
  const [records, setRecords] = useState(() => loadSmMorningRecords())
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId)
  const [visibleCount, setVisibleCount] = useState(initialThemeId ? 25 : 5)
  const themeReadiness = getSmThemeReadiness()
  const priorityThemes = themeReadiness
    .filter((item) => item.morning.total > 0)
    .sort((a, b) => a.morning.correct - b.morning.correct || b.morning.wrong - a.morning.wrong || a.theme.rank - b.theme.rank)
    .slice(0, 4)

  const latest = useMemo(() => {
    const map = new Map<string, ReturnType<typeof loadSmMorningRecords>[number]>()
    for (const record of [...records].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))) {
      if (!map.has(record.questionId)) map.set(record.questionId, record)
    }
    return map
  }, [records])

  const filtered = useMemo(() => {
    return smMorningQuestions.filter((question) => {
      const latestRecord = latest.get(question.id)
      const theme = smFrequentThemes.find((item) => item.id === question.themeId)
      if (selectedThemeId && question.themeId !== selectedThemeId) return false
      if (filter === 'unattempted') return !latestRecord
      if (filter === 'wrong') return latestRecord && !latestRecord.isCorrect
      if (filter === 's') return theme?.frequency === 'S'
      return true
    })
  }, [filter, latest, selectedThemeId])

  const shown = filtered.slice(0, visibleCount)
  const attempted = latest.size
  const correct = Array.from(latest.values()).filter((record) => record.isCorrect).length
  const rate = attempted > 0 ? Math.round((correct / attempted) * 100) : 0
  const focusCards = selectedThemeId
    ? smMorningFocusCards.filter((card) => card.themeId === selectedThemeId)
    : smMorningFocusCards.filter((card) => card.priority === 'S').slice(0, 4)

  const answer = (questionId: string, selected: SmChoice) => {
    addSmMorningRecord(questionId, selected)
    setRecords(loadSmMorningRecords())
  }

  const reset = () => {
    if (!confirm('ITSM午前Ⅱの解答履歴だけを削除しますか？')) return
    clearSmMorningRecords()
    setRecords([])
  }

  return (
    <SmPageChrome
      title="午前Ⅱ演習"
      description="令和7年度春期の午前Ⅱを公式PDFで解き、ここで解答・採点・復習メモを確認します。"
    >
      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">R7春期 午前Ⅱ 25問</p>
            <p className="text-xs text-slate-500 mt-1">
              演習済 {attempted}/{smMorningQuestions.length}問 / 正答率 {rate}% / 合格ライン60%・推奨80%
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SourceLinks {...smMorningQuestions[0].source} />
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              履歴削除
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-1.5">
        {([
          ['all', 'すべて'],
          ['unattempted', '未演習'],
          ['wrong', '直近不正解'],
          ['s', '頻出S'],
        ] as [Filter, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setFilter(value)
              setSelectedThemeId('')
              setVisibleCount(value === 'all' ? 5 : 25)
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              filter === value ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-black text-slate-900">午前Ⅱで見分けること</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              正答番号だけでなく、午後Ⅰ・午後Ⅱで使う用語の違いまで確認します。
            </p>
          </div>
          <Link to="/it-service-manager/knowledge" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            知識ノートへ
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-3">
          {focusCards.map((card) => {
            const theme = smFrequentThemes.find((item) => item.id === card.themeId)
            return (
              <article key={card.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-black text-slate-900">{card.title}</p>
                  {theme && <FrequencyBadge value={theme.frequency} />}
                </div>
                <p className="text-xs font-bold text-cyan-800 leading-relaxed mt-2">{card.oneLine}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-[11px] font-black text-slate-500">用語</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.terms.map((term) => (
                        <span key={term} className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-500">公式問</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">問{card.questionNumbers.join('・')}</p>
                  </div>
                </div>
                <ul className="space-y-1 mt-2">
                  {card.distinguish.map((item) => (
                    <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    午後Ⅰ: {card.afternoonUse}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    午後Ⅱ: {card.essayUse}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">テーマ別に解き直す</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              仕上げレポートで優先度が高く出やすいテーマです。押すと午前Ⅱの該当問題だけに絞れます。
            </p>
          </div>
          <Link to="/it-service-manager/report" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            レポートを見る
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          {priorityThemes.map((item) => (
            <button
              key={item.theme.id}
              type="button"
              onClick={() => {
                setSelectedThemeId(item.theme.id)
                setFilter('all')
                setVisibleCount(25)
              }}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                selectedThemeId === item.theme.id ? 'bg-cyan-50 border-cyan-300' : 'bg-slate-50 border-slate-100 hover:border-cyan-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">#{item.theme.rank} {item.theme.title}</span>
                <FrequencyBadge value={item.theme.frequency} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                正解 {item.morning.correct}/{item.morning.total}問 / 不正解 {item.morning.wrong}問 / 仕上がり {item.score}%
              </p>
            </button>
          ))}
        </div>
        {selectedThemeId && (
          <button
            type="button"
            onClick={() => {
              setSelectedThemeId('')
              setVisibleCount(filter === 'all' ? 5 : 25)
            }}
            className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-cyan-300"
          >
            テーマ絞り込みを解除
          </button>
        )}
      </section>

      <section className="grid gap-2">
        {shown.map((question) => {
          const latestRecord = latest.get(question.id)
          const theme = smFrequentThemes.find((item) => item.id === question.themeId)
          return (
            <article key={question.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-black text-slate-900">問{question.number}</p>
                    {theme && <FrequencyBadge value={theme.frequency} />}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{question.topic}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{question.focus}</p>
                </div>
                <a
                  href={`${question.source.questionPdfUrl}#page=${Math.max(1, Math.ceil(question.number / 2))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:underline"
                >
                  公式PDFで問{question.number}を見る
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {choices.map((choice) => {
                  const selected = latestRecord?.selected === choice
                  const correct = question.correct === choice
                  const answered = !!latestRecord
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => answer(question.id, choice)}
                      className={`rounded-lg border px-2 py-2 text-sm font-black transition-colors ${
                        answered && correct
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : answered && selected
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'
                      }`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
              {latestRecord && (
                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs font-bold text-slate-700">
                    正答: {question.correct} / あなたの直近回答: {latestRecord.selected}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{question.reviewNote}</p>
                </div>
              )}
            </article>
          )
        })}
      </section>

      {filtered.length > shown.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => Math.min(filtered.length, count + 5))}
          className="w-full rounded-xl border border-cyan-200 bg-white py-3 text-sm font-black text-cyan-700 hover:bg-cyan-50"
        >
          さらに5問表示
        </button>
      )}
    </SmPageChrome>
  )
}
