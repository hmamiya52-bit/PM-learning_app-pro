import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FilePenLine, FileText, Layers, Target } from 'lucide-react'
import { smEssayCases, smEvidenceDrills, smFrequentThemes } from '../../data/sm/content'
import { loadSmSelectedEssayCase, setSmSelectedEssayCase } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type ThemeFilter = 'all' | string

export default function SmCases() {
  const sortedThemes = useMemo(() => [...smFrequentThemes].sort((a, b) => a.rank - b.rank), [])
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>('all')
  const [selectedCaseId, setSelectedCaseId] = useState(smEssayCases[0]?.id ?? '')
  const [openDrillId, setOpenDrillId] = useState(smEvidenceDrills[0]?.id ?? '')
  const [savedCaseId, setSavedCaseId] = useState(() => loadSmSelectedEssayCase()?.caseId ?? '')

  const visibleCases = smEssayCases.filter((item) => themeFilter === 'all' || item.themeIds.includes(themeFilter))
  const selectedCase = visibleCases.find((item) => item.id === selectedCaseId) ?? visibleCases[0] ?? smEssayCases[0]
  const visibleDrills = smEvidenceDrills.filter((item) => themeFilter === 'all' || item.themeId === themeFilter)
  const openDrill = visibleDrills.find((item) => item.id === openDrillId) ?? visibleDrills[0]

  const selectTheme = (id: ThemeFilter) => {
    setThemeFilter(id)
    const nextCase = smEssayCases.find((item) => id === 'all' || item.themeIds.includes(id))
    const nextDrill = smEvidenceDrills.find((item) => id === 'all' || item.themeId === id)
    setSelectedCaseId(nextCase?.id ?? '')
    setOpenDrillId(nextDrill?.id ?? '')
  }

  const chooseCase = (caseId: string) => {
    setSmSelectedEssayCase(caseId)
    setSavedCaseId(caseId)
  }

  return (
    <SmPageChrome
      title="ケース"
      description="午後Ⅰで根拠を拾う練習と、午後Ⅱで使えるインフラ案件の答案素材をまとめます。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">午後Ⅱケース</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{smEssayCases.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">インフラ案件の再利用素材</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-700" />
            <p className="text-[11px] font-bold text-slate-400">根拠ドリル</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{smEvidenceDrills.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">午後Ⅰの短答練習</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <p className="text-[11px] font-bold text-slate-400">狙い</p>
          </div>
          <p className="text-sm font-black text-slate-900 mt-2 leading-snug">知識を答案の部品にする</p>
          <p className="text-[11px] text-slate-500 mt-1">午後Ⅰの根拠と午後Ⅱの骨子を接続</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => selectTheme('all')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              themeFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-cyan-300'
            }`}
          >
            すべて
          </button>
          {sortedThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => selectTheme(theme.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                themeFilter === theme.id ? 'bg-cyan-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-cyan-300'
              }`}
            >
              #{theme.rank} {theme.title}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
        <aside className="bg-white border border-slate-200 rounded-xl p-2 h-fit">
          <div className="px-2 py-2">
            <div className="flex items-center gap-2">
              <FilePenLine className="w-4 h-4 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">午後Ⅱの事例バンク</h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              本番では題意に合わせて削り、ア・イ・ウに配置します。
            </p>
          </div>
          <div className="space-y-1">
            {visibleCases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCaseId(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  selectedCase?.id === item.id ? 'bg-cyan-50 text-cyan-900' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-black leading-snug">{item.title}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.themeIds.map((themeId) => {
                    const theme = sortedThemes.find((candidate) => candidate.id === themeId)
                    return theme ? <FrequencyBadge key={themeId} value={theme.frequency} /> : null
                  })}
                  {savedCaseId === item.id && (
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                      題材
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selectedCase && (
          <article className="bg-white border border-slate-200 rounded-xl px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-snug">{selectedCase.title}</h2>
                <p className="text-sm text-slate-700 leading-relaxed mt-2">{selectedCase.situation}</p>
                {savedCaseId === selectedCase.id && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    午後Ⅱで使う題材に選択中
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => chooseCase(selectedCase.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50 flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  題材にする
                </button>
                <Link
                  to="/it-service-manager/essay"
                  onClick={() => chooseCase(selectedCase.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
                >
                  下書きへ
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <p className="text-[11px] font-black text-slate-500">サービス</p>
                <p className="text-sm text-slate-800 leading-relaxed mt-1">{selectedCase.service}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <p className="text-[11px] font-black text-slate-500">自分の立場</p>
                <p className="text-sm text-slate-800 leading-relaxed mt-1">{selectedCase.role}</p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-3 mt-3">
              <p className="text-[11px] font-black text-amber-800">問題として書くこと</p>
              <p className="text-sm text-slate-800 leading-relaxed mt-1">{selectedCase.problem}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <p className="text-[11px] font-black text-cyan-800 mb-2">対応・工夫</p>
                <ul className="space-y-1.5">
                  {selectedCase.actions.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-slate-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <p className="text-[11px] font-black text-emerald-800 mb-2">効果測定に使う数字</p>
                <ul className="space-y-1.5">
                  {selectedCase.metrics.map((item) => (
                    <li key={item} className="text-sm text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {selectedCase.essayAngles.map((item) => (
                <div key={item.label} className="rounded-lg border border-cyan-100 bg-cyan-50/70 px-3 py-3">
                  <p className="text-[11px] font-black text-cyan-800">設問{item.label}</p>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg bg-slate-900 text-white px-3 py-3">
                <p className="text-[11px] font-black text-cyan-200 mb-2">使い回せる表現</p>
                <ul className="space-y-1.5">
                  {selectedCase.reusablePhrases.map((item) => (
                    <li key={item} className="text-xs text-slate-200 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-3">
                <p className="text-[11px] font-black text-rose-700 mb-2">答案で避ける</p>
                <ul className="space-y-1.5">
                  {selectedCase.traps.map((item) => (
                    <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-700" />
              <h2 className="text-base font-black text-slate-900">午後Ⅰの根拠回答トレーニング</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              設問要求、本文根拠、短い答案骨子を分けて確認します。
            </p>
          </div>
          <Link to="/it-service-manager/afternoon" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            午後Ⅰ演習へ
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 mt-4">
          <div className="space-y-1">
            {visibleDrills.map((drill) => {
              const theme = sortedThemes.find((item) => item.id === drill.themeId)
              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => setOpenDrillId(drill.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    openDrill?.id === drill.id ? 'bg-violet-50 text-violet-900' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-black leading-snug">{drill.title}</p>
                  {theme && <p className="text-[10px] text-slate-400 mt-1">頻出テーマ #{theme.rank}</p>}
                </button>
              )
            })}
          </div>

          {openDrill && (
            <article className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
              <h3 className="text-sm font-black text-slate-900">{openDrill.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">{openDrill.scene}</p>
              <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 mt-3">
                <p className="text-[11px] font-black text-slate-500">設問</p>
                <p className="text-sm font-bold text-slate-800 leading-relaxed mt-1">{openDrill.question}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p className="text-[11px] font-black text-violet-800">設問要求</p>
                  <ul className="space-y-1 mt-1">
                    {openDrill.requirements.map((item) => (
                      <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p className="text-[11px] font-black text-cyan-800">拾う根拠</p>
                  <ul className="space-y-1 mt-1">
                    {openDrill.evidence.map((item) => (
                      <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p className="text-[11px] font-black text-emerald-800">答案骨子</p>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">{openDrill.answerSkeleton}</p>
                </div>
              </div>
              <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 mt-3">
                <p className="text-[11px] font-black text-rose-700">失点しやすい答え</p>
                <p className="text-xs text-slate-700 leading-relaxed mt-1">{openDrill.avoid}</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </SmPageChrome>
  )
}
