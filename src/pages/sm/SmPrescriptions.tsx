import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, CircleAlert, Clock, FilePenLine, FileText, ListChecks, RotateCcw, Sparkles, Target, Wrench } from 'lucide-react'
import { smFrequentThemes, smWeaknessPrescriptions } from '../../data/sm/content'
import type { SmFrequency, SmPrescriptionPart } from '../../data/sm/types'
import {
  clearSmPrescriptionChecks,
  loadSmPrescriptionChecks,
  setSmPrescriptionCheck,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type PrescriptionFilter = 'all' | SmPrescriptionPart | SmFrequency

const partLabel: Record<SmPrescriptionPart, string> = {
  foundation: '基礎',
  morning: '午前Ⅱ',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
  cross: '横断',
}

const partIcon = {
  foundation: Sparkles,
  morning: ListChecks,
  afternoon: FileText,
  essay: FilePenLine,
  cross: Target,
} as const

const filters: { id: PrescriptionFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'S', label: '頻出S' },
  { id: 'A', label: '頻出A' },
  { id: 'morning', label: '午前Ⅱ' },
  { id: 'afternoon', label: '午後Ⅰ' },
  { id: 'essay', label: '午後Ⅱ' },
  { id: 'cross', label: '横断' },
  { id: 'foundation', label: '基礎' },
]

function priorityOrder(value: SmFrequency): number {
  return value === 'S' ? 0 : value === 'A' ? 1 : 2
}

export default function SmPrescriptions() {
  const [checks, setChecks] = useState(() => loadSmPrescriptionChecks())
  const [filter, setFilter] = useState<PrescriptionFilter>('all')
  const sortedPrescriptions = useMemo(
    () => [...smWeaknessPrescriptions].sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority) || a.minutes - b.minutes),
    []
  )
  const visibleItems = sortedPrescriptions.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'S' || filter === 'A' || filter === 'B') return item.priority === filter
    return item.part === filter
  })
  const completedCount = sortedPrescriptions.filter((item) => checks[item.id]).length
  const uncheckedItems = sortedPrescriptions.filter((item) => !checks[item.id])
  const todaySet = uncheckedItems.slice(0, 4)
  const todayMinutes = todaySet.reduce((sum, item) => sum + item.minutes, 0)
  const sItems = sortedPrescriptions.filter((item) => item.priority === 'S')
  const sCompleted = sItems.filter((item) => checks[item.id]).length
  const completionRate = sortedPrescriptions.length > 0 ? Math.round((completedCount / sortedPrescriptions.length) * 100) : 100
  const nextItem = uncheckedItems[0]

  const toggle = (id: string, title: string, checked: boolean) => {
    setSmPrescriptionCheck(id, checked, title)
    setChecks(loadSmPrescriptionChecks())
  }

  const reset = () => {
    if (!confirm('弱点処方箋の完了チェックだけをリセットしますか？')) return
    clearSmPrescriptionChecks()
    setChecks({})
  }

  return (
    <SmPageChrome
      title="弱点処方箋"
      description="失点の症状から、短時間で直す順番と戻るページを決めます。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">処方箋</p>
          <p className="text-xl font-black text-slate-900 mt-1">{completionRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount}/{sortedPrescriptions.length}項目</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">今日の処方</p>
          <p className="text-xl font-black text-slate-900 mt-1">{todaySet.length}件</p>
          <p className="text-[11px] text-slate-500 mt-1">目安 {todayMinutes}分</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">頻出S</p>
          <p className="text-xl font-black text-slate-900 mt-1">{sCompleted}/{sItems.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">優先して潰す症状</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">次に直す</p>
          <p className="text-sm font-black text-slate-900 leading-snug mt-2">{nextItem?.title ?? '仕上げレポートで確認'}</p>
        </div>
      </section>

      {todaySet.length > 0 && (
        <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-200" />
                <h2 className="text-sm font-black">今日の処方セット</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                頻出度が高く、本番で失点に直結しやすい症状から並べています。
              </p>
            </div>
            <Link
              to={todaySet[0].routes[0]?.to ?? '/it-service-manager/review'}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
            >
              最初を直す
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">
            {todaySet.map((item, index) => {
              const Icon = partIcon[item.part]
              return (
                <Link key={item.id} to={item.routes[0]?.to ?? '/it-service-manager/review'} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 hover:border-cyan-400">
                  <p className="text-[10px] font-black text-cyan-200">STEP {index + 1} / {item.minutes}分</p>
                  <div className="flex items-start gap-1.5 mt-1">
                    <Icon className="w-4 h-4 text-cyan-200 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-black leading-snug">{item.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">{item.quickFix}</p>
                </Link>
              )
            })}
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
            チェックをリセット
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {visibleItems.map((item) => {
          const Icon = partIcon[item.part]
          const checked = !!checks[item.id]
          const themes = item.themeIds
            .map((themeId) => smFrequentThemes.find((theme) => theme.id === themeId))
            .filter((theme): theme is NonNullable<typeof theme> => !!theme)
          return (
            <article
              key={item.id}
              className={`rounded-xl border px-4 py-4 ${
                checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      <Icon className="w-3 h-3" />
                      {partLabel[item.part]} / {item.minutes}分
                    </span>
                    <FrequencyBadge value={item.priority} />
                    {themes.slice(0, 2).map((theme) => (
                      <span key={theme.id} className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        #{theme.rank} {theme.title}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-black text-slate-900 leading-snug mt-2">{item.title}</h2>
                  <p className="text-sm text-slate-700 leading-relaxed mt-2">{item.symptom}</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggle(item.id, item.title, event.target.checked)}
                  />
                  完了
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mt-3">
                <div className="space-y-2">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                    <div className="flex items-start gap-2">
                      <CircleAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black text-slate-500">原因の見立て</p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">{item.likelyCause}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 px-3 py-3">
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black text-cyan-800">すぐ直すなら</p>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed mt-1">{item.quickFix}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-100 px-3 py-3">
                    <p className="text-[11px] font-black text-slate-500">短時間ドリル</p>
                    <ul className="space-y-1.5 mt-2">
                      {item.drillSteps.map((step) => (
                        <li key={step} className="flex items-start gap-1.5 text-xs text-slate-700 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <aside className="space-y-2">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black text-emerald-800">完了ライン</p>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed mt-1">{item.passLine}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-3">
                    <p className="text-[11px] font-black text-rose-700">避ける</p>
                    <ul className="space-y-1 mt-2">
                      {item.badPatterns.map((pattern) => (
                        <li key={pattern} className="text-xs text-slate-700 leading-relaxed">・{pattern}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.routes.map((route) => (
                      <Link
                        key={`${item.id}:${route.to}:${route.label}`}
                        to={route.to}
                        className="inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-cyan-700 hover:bg-cyan-50"
                      >
                        {route.label}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </aside>
              </div>
            </article>
          )
        })}
      </section>

      <section className="bg-white border border-cyan-100 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">処方したら本番形式で確認</h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              直した症状は、弱点集中または本番リハーサルで時間内に再現できるかを確認します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              to="/it-service-manager/review"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50"
            >
              弱点集中へ
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/it-service-manager/simulation"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
            >
              本番リハへ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </SmPageChrome>
  )
}
