import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, FileText, RotateCcw, Target } from 'lucide-react'
import { smEvidenceDrills, smFrequentThemes, smStudyPlanPhases } from '../../data/sm/content'
import {
  clearSmStudyPlanChecks,
  getSmSummary,
  loadSmStudyPlanChecks,
  setSmStudyPlanCheck,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

function actionId(phaseId: string, index: number): string {
  return `${phaseId}:action:${index}`
}

function deliverableId(phaseId: string): string {
  return `${phaseId}:deliverable`
}

export default function SmPlan() {
  const summary = getSmSummary()
  const [checks, setChecks] = useState(() => loadSmStudyPlanChecks())
  const planItems = useMemo(() => {
    return smStudyPlanPhases.flatMap((phase) => [
      ...phase.actions.map((action, index) => ({
        id: actionId(phase.id, index),
        label: action,
        phase,
        route: phase.actionRoutes?.[index] ?? phase.route,
      })),
      {
        id: deliverableId(phase.id),
        label: phase.deliverable,
        phase,
        route: phase.route,
      },
    ])
  }, [])
  const completedCount = planItems.filter((item) => checks[item.id]).length
  const completionRate = planItems.length > 0 ? Math.round((completedCount / planItems.length) * 100) : 0
  const nextItem = planItems.find((item) => !checks[item.id])
  const completedPhaseCount = smStudyPlanPhases.filter((phase) => {
    const ids = [
      ...phase.actions.map((_, index) => actionId(phase.id, index)),
      deliverableId(phase.id),
    ]
    return ids.every((id) => checks[id])
  }).length

  const toggle = (id: string, label: string, checked: boolean) => {
    setSmStudyPlanCheck(id, checked, label)
    setChecks(loadSmStudyPlanChecks())
  }

  const reset = () => {
    if (!confirm('50時間プランのチェックだけをリセットしますか？')) return
    clearSmStudyPlanChecks()
    setChecks({})
  }

  return (
    <SmPageChrome
      title="50時間プラン"
      description="頻出テーマ、午前Ⅱ、知識ノート、午後Ⅰ、午後Ⅱ、仕上げを、合格に近づく順で潰していきます。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-[11px] font-bold text-slate-400">プラン進捗</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{completionRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount}/{planItems.length}項目</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">完了フェーズ</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{completedPhaseCount}/6</p>
          <p className="text-[11px] text-slate-500 mt-1">成果物までチェック済み</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <p className="text-[11px] font-bold text-slate-400">演習状況</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.morning.rate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">午前Ⅱ {summary.morning.attempted}/{summary.morning.total}問</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">根拠ドリル</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.evidenceDrills.completed}/{smEvidenceDrills.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">午後Ⅰ対策の短答練習</p>
        </div>
      </section>

      {nextItem && (
        <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-cyan-200">次に潰す項目</p>
              <h2 className="text-base font-black leading-snug mt-1">{nextItem.label}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {nextItem.phase.title} / {nextItem.phase.hours}
              </p>
            </div>
            <Link
              to={nextItem.route}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
            >
              開く
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-3">
        {smStudyPlanPhases.map((phase) => {
          const phaseIds = [
            ...phase.actions.map((_, index) => actionId(phase.id, index)),
            deliverableId(phase.id),
          ]
          const phaseCompleted = phaseIds.filter((id) => checks[id]).length
          const phaseRate = Math.round((phaseCompleted / phaseIds.length) * 100)
          const relatedThemes = phase.themeIds
            .map((id) => smFrequentThemes.find((theme) => theme.id === id))
            .filter((theme): theme is NonNullable<typeof theme> => !!theme)
          return (
            <article key={phase.id} className="bg-white border border-slate-200 rounded-xl px-4 py-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                      {phase.order}
                    </span>
                    <h2 className="text-base font-black text-slate-900">{phase.title}</h2>
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {phase.hours}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mt-3">{phase.goal}</p>
                </div>
                <div className="lg:w-40">
                  <div className="flex items-end justify-between">
                    <p className="text-[11px] font-black text-slate-400">進捗</p>
                    <p className="text-xl font-black text-slate-900">{phaseRate}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(4, phaseRate)}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 mt-4">
                <div className="space-y-2">
                  {phase.actions.map((action, index) => {
                    const id = actionId(phase.id, index)
                    return (
                      <label key={id} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={!!checks[id]}
                          onChange={(event) => toggle(id, action, event.target.checked)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-slate-700 leading-relaxed">{action}</span>
                      </label>
                    )
                  })}
                  <label className="flex items-start gap-2 rounded-lg bg-cyan-50 border border-cyan-100 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!checks[deliverableId(phase.id)]}
                      onChange={(event) => toggle(deliverableId(phase.id), phase.deliverable, event.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-sm font-bold text-slate-800 leading-relaxed">成果物: {phase.deliverable}</span>
                  </label>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                  <p className="text-[11px] font-black text-slate-500">関連テーマ</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {relatedThemes.map((theme) => (
                      <Link
                        key={theme.id}
                        to={`/it-service-manager/themes#${theme.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 hover:border-cyan-300"
                      >
                        #{theme.rank}
                        <FrequencyBadge value={theme.frequency} />
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={phase.route}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
                  >
                    このフェーズを進める
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-rose-300 hover:text-rose-700"
      >
        <RotateCcw className="w-4 h-4" />
        プランのチェックをリセット
      </button>
    </SmPageChrome>
  )
}
