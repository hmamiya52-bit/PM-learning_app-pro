import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FilePenLine, FileText, RotateCcw, Sparkles, Target } from 'lucide-react'
import { smAnswerPartPacks, smFrequentThemes } from '../../data/sm/content'
import type { SmAnswerPartUse, SmFrequency } from '../../data/sm/types'
import {
  clearSmAnswerPartChecks,
  loadSmAnswerPartChecks,
  setSmAnswerPartCheck,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type PartFilter = 'all' | SmAnswerPartUse | SmFrequency

const useLabel: Record<SmAnswerPartUse, string> = {
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
  both: '午後Ⅰ・午後Ⅱ',
}

const filters: { id: PartFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'both', label: '横断' },
  { id: 'afternoon', label: '午後Ⅰ' },
  { id: 'essay', label: '午後Ⅱ' },
  { id: 'S', label: '頻出S' },
  { id: 'A', label: '頻出A' },
]

function themeOf(themeId: string) {
  return smFrequentThemes.find((theme) => theme.id === themeId) ?? smFrequentThemes[0]
}

export default function SmAnswerParts() {
  const [filter, setFilter] = useState<PartFilter>('all')
  const [checks, setChecks] = useState(() => loadSmAnswerPartChecks())
  const sortedPacks = useMemo(
    () => [...smAnswerPartPacks].sort((a, b) => themeOf(a.themeId).rank - themeOf(b.themeId).rank || a.title.localeCompare(b.title)),
    [],
  )
  const visiblePacks = sortedPacks.filter((pack) => {
    if (filter === 'all') return true
    if (filter === 'S' || filter === 'A' || filter === 'B') return themeOf(pack.themeId).frequency === filter
    if (filter === 'both') return pack.use === 'both'
    return pack.use === filter || pack.use === 'both'
  })
  const completedCount = smAnswerPartPacks.filter((pack) => checks[pack.id]).length
  const sRemaining = smAnswerPartPacks.filter((pack) => themeOf(pack.themeId).frequency === 'S' && !checks[pack.id]).length
  const minutes = visiblePacks.reduce((sum, pack) => sum + (Number.parseInt(pack.timeBox, 10) || 0), 0)

  const toggle = (id: string, label: string, checked: boolean) => {
    setSmAnswerPartCheck(id, checked, label)
    setChecks(loadSmAnswerPartChecks())
  }

  const reset = () => {
    if (!confirm('答案パーツの完了チェックだけをリセットしますか？')) return
    clearSmAnswerPartChecks()
    setChecks({})
  }

  return (
    <SmPageChrome
      title="答案パーツ"
      description="頻出テーマを、午後Ⅰの短答と午後Ⅱの論述でそのまま使える表現へ変換します。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">答案パーツ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{smAnswerPartPacks.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">弱い答案から強い答案へ変換</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">完了</p>
          <p className="text-xl font-black text-slate-900 mt-1">{completedCount}/{smAnswerPartPacks.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">チェック済み</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">頻出Sの残り</p>
          <p className="text-xl font-black text-slate-900 mt-1">{sRemaining}</p>
          <p className="text-[11px] text-slate-500 mt-1">先に暗唱する候補</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">表示分の目安</p>
          <p className="text-xl font-black text-slate-900 mt-1">{minutes}分</p>
          <p className="text-[11px] text-slate-500 mt-1">{visiblePacks.length}本</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  filter === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-cyan-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-rose-300 hover:text-rose-700 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            チェックをリセット
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {visiblePacks.map((pack) => {
          const theme = themeOf(pack.themeId)
          const checked = !!checks[pack.id]
          return (
            <article
              key={pack.id}
              className={`rounded-xl border px-4 py-4 ${
                checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-black">
                      #{theme.rank}
                    </span>
                    <FrequencyBadge value={theme.frequency} />
                    <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      {useLabel[pack.use]} / {pack.timeBox}
                    </span>
                    {checked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        完了
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-black text-slate-900 leading-snug mt-2">{pack.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{theme.title}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <label className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggle(pack.id, pack.title, event.target.checked)}
                    />
                    完了
                  </label>
                  <Link
                    to={`/it-service-manager/themes#${theme.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
                  >
                    テーマ
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 mt-3">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">{pack.trigger}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-3">
                  <p className="text-[11px] font-black text-rose-700">弱い答案</p>
                  <p className="text-sm text-slate-700 leading-relaxed mt-1">{pack.weakAnswer}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-3">
                  <p className="text-[11px] font-black text-emerald-700">強い答案</p>
                  <p className="text-sm text-slate-800 leading-relaxed mt-1">{pack.strongAnswer}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-3 mt-3">
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-700" />
                    <p className="text-[11px] font-black text-slate-500">使い回す表現</p>
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {pack.reusablePhrases.map((phrase) => (
                      <li key={phrase} className="text-xs text-slate-700 leading-relaxed">・{phrase}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-3">
                  <p className="text-[11px] font-black text-slate-500">採点で拾われる要素</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pack.scoringKeys.map((key) => (
                      <span key={key} className="rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div className="rounded-lg bg-cyan-50/70 border border-cyan-100 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    <p className="text-[11px] font-black text-cyan-900">午後Ⅰで使う</p>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">{pack.afternoonUse}</p>
                </div>
                <div className="rounded-lg bg-violet-50/70 border border-violet-100 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FilePenLine className="w-4 h-4 text-violet-700" />
                    <p className="text-[11px] font-black text-violet-900">午後Ⅱで使う</p>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">{pack.essayUse}</p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mt-3">
                <p className="text-[11px] font-black text-amber-800">避ける</p>
                <p className="text-xs text-slate-700 leading-relaxed mt-1">{pack.avoid}</p>
              </div>
            </article>
          )
        })}
      </section>
    </SmPageChrome>
  )
}
