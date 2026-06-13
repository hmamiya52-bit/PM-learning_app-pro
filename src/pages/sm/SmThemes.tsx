import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CheckCircle2, Clock, Target } from 'lucide-react'
import { smFrequentThemes, smStudyPlanPhases, smThemeStudyRecipes } from '../../data/sm/content'
import type { SmFrequency } from '../../data/sm/types'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

const partLabels = {
  morning: '午前Ⅱ',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
} as const

type ThemeFilter = 'all' | SmFrequency

function examOrder(label: string): number {
  const match = label.match(/^(R|H)(\d+)/)
  if (!match) return 0
  const era = match[1]
  const yearNumber = Number.parseInt(match[2], 10)
  const westernYear = era === 'R' ? 2018 + yearNumber : 1988 + yearNumber
  const seasonWeight = label.includes('春') ? 0.2 : label.includes('秋') ? 0.1 : 0
  return westernYear + seasonWeight
}

export default function SmThemes() {
  const sortedThemes = useMemo(() => [...smFrequentThemes].sort((a, b) => a.rank - b.rank), [])
  const [filter, setFilter] = useState<ThemeFilter>('all')
  const visibleThemes = useMemo(
    () => sortedThemes.filter((theme) => filter === 'all' || theme.frequency === filter),
    [filter, sortedThemes],
  )
  const yearLabels = useMemo(
    () => Array.from(new Set(sortedThemes.flatMap((theme) => theme.years))).sort((a, b) => examOrder(b) - examOrder(a)),
    [sortedThemes],
  )
  const sThemes = sortedThemes.filter((theme) => theme.frequency === 'S')
  const crossPartThemes = sortedThemes.filter((theme) => theme.appearsIn.length >= 3)
  const mostFrequent = sortedThemes[0]
  const counts = {
    S: smFrequentThemes.filter((theme) => theme.frequency === 'S').length,
    A: smFrequentThemes.filter((theme) => theme.frequency === 'A').length,
    B: smFrequentThemes.filter((theme) => theme.frequency === 'B').length,
  }

  return (
    <SmPageChrome
      title="頻出テーマ"
      description="直近10回分の出題傾向を、少ない勉強時間で効く順に並べた重点テーマです。"
    >
      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">頻出を先に固める</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Sランクは午前Ⅱ・午後Ⅰ・午後Ⅱを横断して使うテーマです。Aランクは午後問題の補助観点として押さえます。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 min-w-[180px]">
            {(['S', 'A', 'B'] as SmFrequency[]).map((value) => (
              <div key={value} className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                <p className="text-[10px] font-black text-slate-400">頻出{value}</p>
                <p className="text-lg font-black text-slate-900">{counts[value]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-600" />
            <p className="text-[11px] font-bold text-slate-400">最優先</p>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">頻出S {sThemes.length}テーマ</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">午前Ⅱ・午後Ⅰ・午後Ⅱをまたいで点に変わりやすいテーマです。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-[11px] font-bold text-slate-400">横断</p>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">{crossPartThemes.length}テーマ</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">午前Ⅱの用語を午後Ⅰの根拠、午後Ⅱの題材へ転用できます。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">最初に読む</p>
          </div>
          <p className="text-sm font-black text-slate-900 leading-snug mt-2">#{mostFrequent.rank} {mostFrequent.title}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{mostFrequent.summary}</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">出題のまとまり</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              丸が多いテーマほど繰り返し出ています。まずSテーマの横並びを見て、午後Ⅰ・午後Ⅱへ使う順番を決めます。
            </p>
          </div>
          <Link
            to="/it-service-manager/prescriptions"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50 flex-shrink-0"
          >
            弱点処方へ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-[760px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white border-b border-slate-200 py-2 pr-3 text-[11px] font-black text-slate-500">テーマ</th>
                <th className="border-b border-slate-200 px-2 py-2 text-center text-[11px] font-black text-slate-500">頻出</th>
                {yearLabels.map((year) => (
                  <th key={year} className="border-b border-slate-200 px-2 py-2 text-center text-[10px] font-black text-slate-400">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedThemes.map((theme) => (
                <tr key={theme.id}>
                  <td className="sticky left-0 z-10 bg-white border-b border-slate-100 py-2 pr-3">
                    <Link to={`#${theme.id}`} className="text-xs font-black text-slate-900 hover:text-cyan-700">
                      #{theme.rank} {theme.title}
                    </Link>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-center">
                    <FrequencyBadge value={theme.frequency} />
                  </td>
                  {yearLabels.map((year) => {
                    const appears = theme.years.includes(year)
                    return (
                      <td key={`${theme.id}:${year}`} className="border-b border-slate-100 px-2 py-2 text-center">
                        <span
                          className={`inline-flex h-3 w-3 rounded-full ${
                            appears
                              ? theme.frequency === 'S'
                                ? 'bg-rose-500'
                                : theme.frequency === 'A'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              : 'bg-slate-100'
                          }`}
                          aria-label={appears ? `${theme.title}は${year}に出題` : `${theme.title}は${year}に記録なし`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-wrap gap-1.5">
        {([
          ['all', 'すべて'],
          ['S', '頻出S'],
          ['A', '頻出A'],
          ['B', '頻出B'],
        ] as [ThemeFilter, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              filter === value ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      <div className="grid gap-3">
        {visibleThemes.map((theme) => {
          const relatedPhases = smStudyPlanPhases.filter((phase) => phase.themeIds.includes(theme.id))
          const recipe = smThemeStudyRecipes.find((item) => item.themeId === theme.id)
          return (
          <article key={theme.id} id={theme.id} className="scroll-mt-4 bg-white border border-slate-200 rounded-xl px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                {theme.rank}
              </span>
              <h2 className="text-base font-black text-slate-900">{theme.title}</h2>
              <FrequencyBadge value={theme.frequency} />
              <span className="text-[11px] text-slate-400">出題: {theme.years.join(' / ')}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">{theme.summary}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">根拠: {theme.evidenceNote}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {theme.appearsIn.map((part) => (
                <span key={part} className="rounded-full bg-cyan-50 text-cyan-700 px-2 py-0.5 text-[10px] font-bold">
                  {partLabels[part]}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-1">まず覚える</p>
                <ul className="space-y-1">
                  {theme.mustKnow.map((item) => (
                    <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-2">
                <div>
                  <p className="text-[11px] font-black text-slate-500">午前Ⅱ</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{theme.morningPattern}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-500">午後Ⅰ</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{theme.afternoonPattern}</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500">午後Ⅱ・インフラ案件化</p>
                <p className="text-xs text-slate-700 leading-relaxed">{theme.essayPattern}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {theme.infraExamples.map((example) => (
                    <span key={example} className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {recipe && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-slate-500">得点化レシピ / {recipe.timeBox}</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed mt-1">{recipe.whyHighYield}</p>
                  </div>
                  <Link
                    to="/it-service-manager/strategy"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
                  >
                    攻略で見る
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
                  <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
                    <p className="text-[11px] font-black text-cyan-800">午前Ⅱ</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{recipe.morning}</p>
                  </div>
                  <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
                    <p className="text-[11px] font-black text-violet-800">午後Ⅰ</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{recipe.afternoon}</p>
                  </div>
                  <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
                    <p className="text-[11px] font-black text-emerald-800">午後Ⅱ</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{recipe.essay}</p>
                  </div>
                  <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
                    <p className="text-[11px] font-black text-slate-500">インフラ案件</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{recipe.infraStory}</p>
                  </div>
                </div>
              </div>
            )}

            {relatedPhases.length > 0 && (
              <div className="mt-3 rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-2">
                <p className="text-[11px] font-black text-cyan-900 mb-1">このテーマを使う学習フェーズ</p>
                <div className="flex flex-wrap gap-1.5">
                  {relatedPhases.map((phase) => (
                    <Link
                      key={phase.id}
                      to={phase.route}
                      className="inline-flex items-center gap-1 rounded-md bg-white border border-cyan-100 px-2 py-1 text-[11px] font-bold text-cyan-800 hover:border-cyan-300"
                    >
                      {phase.title}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        )})}
      </div>
    </SmPageChrome>
  )
}
