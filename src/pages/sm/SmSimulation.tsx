import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, FilePenLine, FileText, Layers, ListChecks, RotateCcw, Save, Target } from 'lucide-react'
import { smFrequentThemes, smSimulationSets } from '../../data/sm/content'
import type { SmFrequency, SmSimulationPart } from '../../data/sm/types'
import {
  addSmSimulationAttempt,
  clearSmSimulationAttempts,
  loadSmSimulationAttempts,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type SimulationFilter = 'all' | SmSimulationPart | SmFrequency

const partLabel: Record<SmSimulationPart, string> = {
  morning: '午前Ⅱ',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
  mixed: '横断',
}

const partIcon = {
  morning: ListChecks,
  afternoon: FileText,
  essay: FilePenLine,
  mixed: Layers,
} as const

const filters: { id: SimulationFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'mixed', label: '横断' },
  { id: 'morning', label: '午前Ⅱ' },
  { id: 'afternoon', label: '午後Ⅰ' },
  { id: 'essay', label: '午後Ⅱ' },
  { id: 'S', label: '頻出S' },
]

type Draft = {
  selfScore: number
  withinTime: boolean
  reflection: string
  nextFix: string
}

const defaultDraft: Draft = {
  selfScore: 3,
  withinTime: true,
  reflection: '',
  nextFix: '',
}

function themeOf(themeId: string) {
  return smFrequentThemes.find((theme) => theme.id === themeId) ?? smFrequentThemes[0]
}

function latestAttempt(setId: string, attempts: ReturnType<typeof loadSmSimulationAttempts>) {
  return attempts
    .filter((attempt) => attempt.setId === setId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
}

export default function SmSimulation() {
  const [filter, setFilter] = useState<SimulationFilter>('all')
  const [attempts, setAttempts] = useState(() => loadSmSimulationAttempts())
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const sortedSets = useMemo(
    () => [...smSimulationSets].sort((a, b) => a.minutes - b.minutes || a.title.localeCompare(b.title)),
    [],
  )
  const visibleSets = sortedSets.filter((set) => {
    if (filter === 'all') return true
    if (filter === 'S' || filter === 'A' || filter === 'B') {
      return set.themeIds.some((themeId) => themeOf(themeId).frequency === filter)
    }
    return set.part === filter
  })
  const completedSetCount = new Set(attempts.map((attempt) => attempt.setId)).size
  const passedSetCount = smSimulationSets.filter((set) => {
    const attempt = latestAttempt(set.id, attempts)
    return attempt ? attempt.selfScore >= 4 && attempt.withinTime : false
  }).length
  const averageScore = attempts.length > 0
    ? Math.round((attempts.reduce((sum, attempt) => sum + attempt.selfScore, 0) / attempts.length) * 10) / 10
    : null
  const nextSet = sortedSets.find((set) => {
    const attempt = latestAttempt(set.id, attempts)
    return !attempt || attempt.selfScore < 4 || !attempt.withinTime
  })

  const updateDraft = (setId: string, patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [setId]: {
        ...(current[setId] ?? defaultDraft),
        ...patch,
      },
    }))
  }

  const recordAttempt = (setId: string) => {
    const draft = drafts[setId] ?? defaultDraft
    addSmSimulationAttempt({
      setId,
      selfScore: draft.selfScore,
      withinTime: draft.withinTime,
      reflection: draft.reflection,
      nextFix: draft.nextFix,
    })
    setAttempts(loadSmSimulationAttempts())
    setDrafts((current) => ({
      ...current,
      [setId]: defaultDraft,
    }))
  }

  const reset = () => {
    if (!confirm('本番リハーサルの記録だけをリセットしますか？')) return
    clearSmSimulationAttempts()
    setAttempts([])
  }

  return (
    <SmPageChrome
      title="本番リハーサル"
      description="午前Ⅱ・午後Ⅰ・午後Ⅱを、本番で作る成果物と時間配分に近い形で通します。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">リハーサル</p>
          <p className="text-xl font-black text-slate-900 mt-1">{completedSetCount}/{smSimulationSets.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">記録済みセット</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">合格ライン到達</p>
          <p className="text-xl font-black text-slate-900 mt-1">{passedSetCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">自己評価4以上かつ時間内</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">平均自己評価</p>
          <p className="text-xl font-black text-slate-900 mt-1">{averageScore ?? '-'}</p>
          <p className="text-[11px] text-slate-500 mt-1">5段階</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">次に通す</p>
          <p className="text-sm font-black text-slate-900 leading-snug mt-2">{nextSet?.title ?? '直前仕上げへ'}</p>
          <p className="text-[11px] text-slate-500 mt-1">{nextSet ? `${nextSet.minutes}分` : '大きな穴なし'}</p>
        </div>
      </section>

      {nextSet && (
        <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-200" />
                <h2 className="text-sm font-black">次のリハーサル</h2>
              </div>
              <p className="text-base font-black leading-snug mt-1">{nextSet.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{nextSet.purpose}</p>
            </div>
            <Link
              to={nextSet.steps[0]?.route ?? '/it-service-manager/review'}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
            >
              開始ページへ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

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
            記録をリセット
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {visibleSets.map((set) => {
          const Icon = partIcon[set.part]
          const primaryTheme = themeOf(set.themeIds[0])
          const latest = latestAttempt(set.id, attempts)
          const draft = drafts[set.id] ?? defaultDraft
          const passed = latest ? latest.selfScore >= 4 && latest.withinTime : false
          return (
            <article
              key={set.id}
              className={`rounded-xl border px-4 py-4 ${passed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      <Icon className="w-3 h-3" />
                      {partLabel[set.part]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      <Clock className="w-3 h-3" />
                      {set.minutes}分
                    </span>
                    <FrequencyBadge value={primaryTheme.frequency} />
                    {passed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        到達
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-black text-slate-900 leading-snug mt-2">{set.title}</h2>
                  <p className="text-sm text-slate-700 leading-relaxed mt-2">{set.purpose}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link
                    to={set.steps[0]?.route ?? '/it-service-manager/review'}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
                  >
                    開始
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={set.retryRoute}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
                  >
                    戻る先
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mt-4">
                <div className="space-y-2">
                  {set.steps.map((step, index) => (
                    <Link
                      key={`${set.id}:${step.label}`}
                      to={step.route}
                      className="group block rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-[11px] font-black flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 leading-snug">{step.label}</p>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">{step.detail}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-600 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg bg-cyan-50/70 border border-cyan-100 px-3 py-2">
                    <p className="text-[11px] font-black text-cyan-900">成果物</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{set.output}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 px-3 py-2">
                    <p className="text-[11px] font-black text-emerald-900">合格ライン</p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{set.passLine}</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                    <p className="text-[11px] font-black text-rose-700">失敗サイン</p>
                    <ul className="space-y-1 mt-1">
                      {set.failureSignals.map((item) => (
                        <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 mt-3">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-slate-500">リハーサル記録</p>
                    {latest ? (
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        最新: {latest.selfScore}/5 / {latest.withinTime ? '時間内' : '時間超過'} / {latest.reflection || '振り返りなし'}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">まだ記録がありません。</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => recordAttempt(set.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700 flex-shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    記録する
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[180px_160px_1fr] gap-2 mt-3">
                  <label className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                    <span className="flex items-center justify-between">
                      自己評価
                      <span>{draft.selfScore}/5</span>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={draft.selfScore}
                      onChange={(event) => updateDraft(set.id, { selfScore: Number(event.target.value) })}
                      className="w-full"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.withinTime}
                      onChange={(event) => updateDraft(set.id, { withinTime: event.target.checked })}
                    />
                    時間内
                  </label>
                  <input
                    value={draft.reflection}
                    onChange={(event) => updateDraft(set.id, { reflection: event.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="振り返り（例: 根拠は拾えたが、設問ウの効果測定が弱い）"
                  />
                </div>
                <input
                  value={draft.nextFix}
                  onChange={(event) => updateDraft(set.id, { nextFix: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={`次に戻ること（例: ${set.retryPlan}）`}
                />
              </div>
            </article>
          )
        })}
      </section>
    </SmPageChrome>
  )
}
