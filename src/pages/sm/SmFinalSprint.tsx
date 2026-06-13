import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardCheck, FilePenLine, FileText, ListChecks, RotateCcw, Target } from 'lucide-react'
import { smExamDaySteps, smFinalSprintTasks, smFinalCheckpoints, smFrequentThemes } from '../../data/sm/content'
import {
  clearSmFinalSprintChecks,
  getSmSummary,
  getSmThemeReadiness,
  loadSmFinalSprintChecks,
  setSmFinalSprintCheck,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

const partLabel = {
  all: '全体',
  morning: '午前Ⅱ',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
} as const

const partIcon = {
  all: ClipboardCheck,
  morning: ListChecks,
  afternoon: FileText,
  essay: FilePenLine,
} as const

function checkpointDone(summary: ReturnType<typeof getSmSummary>, sThemesReady: boolean, checkpointId: string): boolean {
  if (checkpointId === 'morning-finish') return summary.morning.attempted >= summary.morning.total && summary.morning.rate >= 80
  if (checkpointId === 'afternoon-finish') {
    return summary.afternoon.attemptedProblems >= summary.afternoon.totalProblems
      && (summary.afternoon.bestScore ?? 0) >= 30
      && summary.evidenceDrills.completed >= Math.min(8, summary.evidenceDrills.total)
      && summary.evidenceDrills.attemptCount >= Math.min(8, summary.evidenceDrills.total)
  }
  if (checkpointId === 'essay-finish') return summary.essay.attemptCount >= 2 && (summary.essay.averageReview ?? 0) >= 3.5
  if (checkpointId === 'theme-finish') return sThemesReady
  return false
}

export default function SmFinalSprint() {
  const summary = getSmSummary()
  const readiness = getSmThemeReadiness()
  const [checks, setChecks] = useState(() => loadSmFinalSprintChecks())
  const sortedTasks = useMemo(() => smFinalSprintTasks, [])
  const completedCount = sortedTasks.filter((task) => checks[task.id]).length
  const completionRate = Math.round((completedCount / sortedTasks.length) * 100)
  const sThemeReadiness = readiness.filter((item) => item.theme.frequency === 'S')
  const sThemesReady = sThemeReadiness.length > 0 && sThemeReadiness.every((item) => item.score >= 75)
  const passedCheckpointCount = smFinalCheckpoints.filter((item) => checkpointDone(summary, sThemesReady, item.id)).length
  const nextTask = sortedTasks.find((task) => !checks[task.id])
  const topWeakThemes = readiness.filter((item) => item.status !== 'ready').slice(0, 3)

  const toggle = (id: string, title: string, checked: boolean) => {
    setSmFinalSprintCheck(id, checked, title)
    setChecks(loadSmFinalSprintChecks())
  }

  const reset = () => {
    if (!confirm('直前仕上げチェックだけをリセットしますか？')) return
    clearSmFinalSprintChecks()
    setChecks({})
  }

  return (
    <SmPageChrome
      title="直前仕上げ"
      description="本番前に残り時間を点に変えるための、午前Ⅱ・午後Ⅰ・午後Ⅱの最終チェックリストです。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">直前タスク</p>
          <p className="text-xl font-black text-slate-900 mt-1">{completionRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount}/{sortedTasks.length}項目</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">本番前チェック</p>
          <p className="text-xl font-black text-slate-900 mt-1">{passedCheckpointCount}/{smFinalCheckpoints.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">仕上げ判定の到達数</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">根拠ドリル回答</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.evidenceDrills.attemptCount}回</p>
          <p className="text-[11px] text-slate-500 mt-1">平均 {summary.evidenceDrills.averageScore ?? '-'} / 5</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">午後Ⅱ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.essay.attemptCount}本</p>
          <p className="text-[11px] text-slate-500 mt-1">自己評価平均 {summary.essay.averageReview ?? '-'} / 5</p>
        </div>
      </section>

      {nextTask && (
        <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-cyan-200">次に潰す</p>
              <h2 className="text-base font-black leading-snug mt-1">{nextTask.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{nextTask.goal}</p>
            </div>
            <Link
              to={nextTask.route}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
            >
              開く
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const Icon = partIcon[task.part]
            const relatedThemes = task.themeIds
              .map((id) => smFrequentThemes.find((theme) => theme.id === id))
              .filter((theme): theme is NonNullable<typeof theme> => !!theme)
            const checked = !!checks[task.id]
            return (
              <article
                key={task.id}
                className={`rounded-xl border px-4 py-4 ${
                  checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                        <Icon className="w-3 h-3" />
                        {partLabel[task.part]} / {task.minutes}分
                      </span>
                      {relatedThemes.slice(0, 2).map((theme) => (
                        <FrequencyBadge key={theme.id} value={theme.frequency} />
                      ))}
                    </div>
                    <h2 className="text-base font-black text-slate-900 leading-snug mt-2">{task.title}</h2>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1">{task.goal}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggle(task.id, task.title, event.target.checked)}
                    />
                    完了
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 mt-3">
                  <div className="rounded-lg bg-white border border-slate-100 px-3 py-3">
                    <p className="text-[11px] font-black text-slate-500">やること</p>
                    <ul className="space-y-1.5 mt-2">
                      {task.actions.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-sm text-slate-700 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 px-3 py-3">
                    <p className="text-[11px] font-black text-cyan-800">完了ライン</p>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed mt-2">{task.successLine}</p>
                    <Link
                      to={task.route}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-cyan-700 hover:underline"
                    >
                      対象ページへ
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="space-y-3">
          <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">まだ戻る候補</h2>
            </div>
            <div className="space-y-2 mt-3">
              {topWeakThemes.length === 0 ? (
                <p className="text-xs text-slate-500 leading-relaxed">優先して戻るテーマはありません。</p>
              ) : (
                topWeakThemes.map((item) => (
                  <Link
                    key={item.theme.id}
                    to={item.nextRoute}
                    className="block rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 hover:border-cyan-200"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900">#{item.theme.rank} {item.theme.title}</p>
                      <FrequencyBadge value={item.theme.frequency} />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.nextAction}</p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">本番当日の動き</h2>
            </div>
            <div className="space-y-2 mt-3">
              {smExamDaySteps.map((step) => (
                <details key={step.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2" open={step.id === 'exam-pm1'}>
                  <summary className="cursor-pointer text-xs font-black text-slate-900">
                    {step.title}
                    <span className="ml-2 text-[10px] font-black text-cyan-700">{step.timeBox}</span>
                  </summary>
                  <ul className="space-y-1 mt-2">
                    {step.actions.map((item) => (
                      <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-rose-700 leading-relaxed mt-2">避ける: {step.avoid}</p>
                </details>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-rose-300 hover:text-rose-700"
          >
            <RotateCcw className="w-4 h-4" />
            直前チェックをリセット
          </button>
        </aside>
      </section>
    </SmPageChrome>
  )
}
