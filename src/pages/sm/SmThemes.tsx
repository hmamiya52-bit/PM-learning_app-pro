import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CheckCircle2, Clock, ExternalLink, FileSearch, Target } from 'lucide-react'
import { smFrequentThemes, smStudyPlanPhases, smThemeStudyRecipes, smTrendEvidenceEntries } from '../../data/sm/content'
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
    () => Array.from(new Set(smTrendEvidenceEntries.map((entry) => entry.yearLabel))).sort((a, b) => examOrder(b) - examOrder(a)),
    [],
  )
  const evidenceByTheme = useMemo(() => {
    const map = new Map<string, typeof smTrendEvidenceEntries>()
    smTrendEvidenceEntries.forEach((entry) => {
      entry.themeIds.forEach((themeId) => {
        const list = map.get(themeId) ?? []
        map.set(themeId, [...list, entry])
      })
    })
    return map
  }, [])
  const themeById = useMemo(() => new Map(sortedThemes.map((theme) => [theme.id, theme])), [sortedThemes])
  const sThemes = sortedThemes.filter((theme) => theme.frequency === 'S')
  const crossPartThemes = sortedThemes.filter((theme) => theme.appearsIn.length >= 3)
  const evidenceCounts = {
    total: smTrendEvidenceEntries.length,
    afternoon: smTrendEvidenceEntries.filter((entry) => entry.part === 'afternoon').length,
    essay: smTrendEvidenceEntries.filter((entry) => entry.part === 'essay').length,
  }
  const counts = {
    S: smFrequentThemes.filter((theme) => theme.frequency === 'S').length,
    A: smFrequentThemes.filter((theme) => theme.frequency === 'A').length,
    B: smFrequentThemes.filter((theme) => theme.frequency === 'B').length,
  }

  return (
    <SmPageChrome
      title="頻出テーマ"
      description="午後Ⅰ・午後Ⅱの直近10回分を、出現回数、最新性、午後Ⅱへの転用しやすさで整理しています。"
    >
      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">頻出テーマから始める</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Sランクは午前Ⅱ・午後Ⅰ・午後Ⅱをまたいで使うテーマです。Aランクも、構成管理、セキュリティ、供給者管理のように答案の説得力を支えるため、直前まで最低限確認します。
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
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">午前Ⅱ・午後Ⅰ・午後Ⅱをまたいで得点につながりやすいテーマです。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-[11px] font-bold text-slate-400">横断</p>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">{crossPartThemes.length}テーマ</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">午前Ⅱの用語を、午後Ⅰの根拠や午後Ⅱの題材へつなげられます。</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">公式根拠</p>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">{evidenceCounts.total}件</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">午後Ⅰ {evidenceCounts.afternoon}件、午後Ⅱ {evidenceCounts.essay}件をテーマと結び付けています。</p>
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
              丸は出題年度の記録です。順位は丸の数だけでなく、直近年度での出方、午後Ⅱへ転用しやすいか、午前Ⅱの用語とつながるかを合わせて決めています。
            </p>
          </div>
          <Link
            to="/it-service-manager/prescriptions"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50 flex-shrink-0"
          >
            弱点対策へ
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

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">出題根拠マトリクス</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              直近10回の午後Ⅰ3問・午後Ⅱ2問を、公式解答例の出題趣旨からテーマと結び付けています。午前ⅡはR7最新年25問を別に演習データとして扱います。
            </p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed lg:text-right">
            低頻度テーマは最後に確認し、S/Aテーマを答案に使える形へ先に整えます。
          </p>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-[1080px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="border-b border-slate-200 py-2 pr-3 text-[11px] font-black text-slate-500">年度</th>
                <th className="border-b border-slate-200 px-2 py-2 text-[11px] font-black text-slate-500">試験</th>
                <th className="border-b border-slate-200 px-2 py-2 text-[11px] font-black text-slate-500">問</th>
                <th className="border-b border-slate-200 px-2 py-2 text-[11px] font-black text-slate-500">公式の出題趣旨</th>
                <th className="border-b border-slate-200 px-2 py-2 text-[11px] font-black text-slate-500">テーマ</th>
                <th className="border-b border-slate-200 px-2 py-2 text-[11px] font-black text-slate-500">学習で見るポイント</th>
                <th className="border-b border-slate-200 px-2 py-2 text-center text-[11px] font-black text-slate-500">出典</th>
              </tr>
            </thead>
            <tbody>
              {smTrendEvidenceEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border-b border-slate-100 py-2 pr-3 align-top text-xs font-black text-slate-700">{entry.yearLabel}</td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top text-xs font-bold text-slate-600">{partLabels[entry.part]}</td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top text-xs font-bold text-slate-600">問{entry.questionNumber}</td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top">
                    <p className="text-xs font-black text-slate-900">{entry.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{entry.officialFocus}</p>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {entry.themeIds.map((themeId) => {
                        const theme = themeById.get(themeId)
                        return (
                          <Link
                            key={themeId}
                            to={`#${themeId}`}
                            className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
                          >
                            {theme ? `#${theme.rank} ${theme.title}` : themeId}
                          </Link>
                        )
                      })}
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top text-[11px] text-slate-600 leading-relaxed">
                    {entry.studyUse}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 align-top text-center">
                    <a
                      href={entry.sourcePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-md border border-cyan-200 bg-white px-2 py-1 text-[11px] font-black text-cyan-700 hover:bg-cyan-50"
                    >
                      PDF
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
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
          const themeEvidence = evidenceByTheme.get(theme.id) ?? []
          const essayTransfer = theme.appearsIn.includes('essay') ? '高' : theme.appearsIn.includes('afternoon') ? '中' : '低'
          const latestYear = theme.years[0] ?? '-'
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
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">出題根拠: {theme.evidenceNote}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[10px] font-black text-slate-400">出現年度</p>
                <p className="text-sm font-black text-slate-900">{theme.years.length}年分</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[10px] font-black text-slate-400">公式根拠</p>
                <p className="text-sm font-black text-slate-900">{themeEvidence.length}件</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[10px] font-black text-slate-400">最新出題</p>
                <p className="text-sm font-black text-slate-900">{latestYear}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[10px] font-black text-slate-400">午後Ⅱ転用</p>
                <p className="text-sm font-black text-slate-900">{essayTransfer}</p>
              </div>
            </div>
            {themeEvidence.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-[11px] font-black text-slate-500">公式根拠 {themeEvidence.length}件</p>
                  <a
                    href={themeEvidence[0].sourcePageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-700 hover:text-cyan-800"
                  >
                    IPA過去問題
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {themeEvidence.slice(0, 4).map((entry) => (
                    <div key={`${theme.id}:${entry.id}`} className="rounded-md bg-white border border-slate-200 px-3 py-2">
                      <p className="text-[11px] font-black text-slate-800">
                        {entry.yearLabel} {partLabels[entry.part]}問{entry.questionNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{entry.title}</p>
                    </div>
                  ))}
                </div>
                {themeEvidence.length > 4 && (
                  <p className="text-[10px] text-slate-400 mt-2">ほか {themeEvidence.length - 4} 件は上の出題根拠マトリクスで確認できます。</p>
                )}
              </div>
            )}
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
                <p className="text-[11px] font-black text-slate-500">午後Ⅱ・インフラ事例</p>
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
                    <p className="text-[11px] font-black text-slate-500">得点につなげる確認 / {recipe.timeBox}</p>
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
