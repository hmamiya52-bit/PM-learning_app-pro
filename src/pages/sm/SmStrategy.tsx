import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, CircleAlert, Clock, FilePenLine, FileText, Layers, ListChecks, Map, Sparkles, Target, Wrench } from 'lucide-react'
import {
  smAnswerPartPacks,
  smEssayAdaptationTemplates,
  smEssayCases,
  smExamTactics,
  smEvidenceDrills,
  smFinalCheckpoints,
  smFrequentThemes,
  smSimulationSets,
  smStudyPlanPhases,
  smThemeStudyRecipes,
  smWeaknessPrescriptions,
} from '../../data/sm/content'
import { getSmSummary, getSmThemeReadiness } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

const tacticIcons = {
  morning: ListChecks,
  afternoon: FileText,
  essay: FilePenLine,
} as const

export default function SmStrategy() {
  const summary = getSmSummary()
  const readiness = getSmThemeReadiness()
  const sortedThemes = [...smFrequentThemes].sort((a, b) => a.rank - b.rank)
  const sThemeIds = sortedThemes.filter((theme) => theme.frequency === 'S').map((theme) => theme.id)
  const sThemeReadiness = readiness.filter((item) => sThemeIds.includes(item.theme.id))
  const checkpointPassed: Record<string, boolean> = {
    'morning-finish': summary.morning.attempted >= summary.morning.total && summary.morning.rate >= 80,
    'afternoon-finish': summary.afternoon.attemptedProblems >= summary.afternoon.totalProblems
      && (summary.afternoon.bestScore ?? 0) >= 30
      && summary.evidenceDrills.completed >= Math.min(8, summary.evidenceDrills.total)
      && summary.evidenceDrills.attemptCount >= Math.min(8, summary.evidenceDrills.total),
    'essay-finish': summary.essay.attemptCount >= 2 && (summary.essay.averageReview ?? 0) >= 4,
    'theme-finish': sThemeReadiness.length > 0 && sThemeReadiness.every((item) => item.score >= 75),
  }
  const passedCount = smFinalCheckpoints.filter((item) => checkpointPassed[item.id]).length
  const nextWeakTheme = readiness.find((item) => item.status !== 'ready')

  return (
    <SmPageChrome
      title="攻略マップ"
      description="50時間を得点につなげるために、午前Ⅱ・午後Ⅰ・午後Ⅱで何を優先するかをまとめます。"
    >
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="bg-slate-900 text-white rounded-xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-200" />
            <h2 className="text-base font-black">合格へ近づく順番</h2>
          </div>
          <div className="grid gap-2 mt-4">
            {smStudyPlanPhases.map((phase, index) => (
              <Link
                key={phase.id}
                to={phase.route}
                className="group rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 hover:border-cyan-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black leading-snug">{phase.title}</p>
                      <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {phase.hours}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{phase.deliverable}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-200 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-700" />
            <h2 className="text-base font-black text-slate-900">本番前チェック</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            仕上げ項目 {passedCount}/{smFinalCheckpoints.length} 個が完了目安に到達しています。
          </p>
          <div className="space-y-2 mt-4">
            {smFinalCheckpoints.map((checkpoint) => {
              const passed = !!checkpointPassed[checkpoint.id]
              return (
                <Link
                  key={checkpoint.id}
                  to={checkpoint.route}
                  className={`block rounded-lg border px-3 py-3 transition-colors ${
                    passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CircleAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-snug">{checkpoint.title}</p>
                      <p className="text-[11px] font-bold text-slate-500 mt-1">{checkpoint.passLine}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{checkpoint.reason}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          {nextWeakTheme && (
            <Link
              to={nextWeakTheme.nextRoute}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
            >
              次は「{nextWeakTheme.theme.title}」
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">答案の材料を先に用意する</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              午後Ⅰは根拠を短くまとめ、午後Ⅱは再利用できるインフラ事例を問われ方に合わせて組み替えます。現在 {smEvidenceDrills.length} ドリル・{smEssayCases.length} ケース・{smEssayAdaptationTemplates.length} テンプレート・{smAnswerPartPacks.length} パーツ・{smWeaknessPrescriptions.length} 対策・{smSimulationSets.length} リハーサル。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              to="/it-service-manager/answer-parts"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
            >
              <Sparkles className="w-4 h-4" />
              答案パーツ
            </Link>
            <Link
              to="/it-service-manager/cases"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50"
            >
              ケースを見る
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/it-service-manager/prescriptions"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50"
            >
              <Wrench className="w-4 h-4" />
              弱点対策
            </Link>
            <Link
              to="/it-service-manager/simulation"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50"
            >
              本番リハーサル
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smExamTactics.map((tactic) => {
          const Icon = tacticIcons[tactic.id]
          return (
            <article key={tactic.id} className="bg-white border border-slate-200 rounded-xl px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400">{tactic.part} / {tactic.timeBox}</p>
                  <h2 className="text-sm font-black text-slate-900 leading-snug">{tactic.title}</h2>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed mt-3">{tactic.successLine}</p>
              <div className="mt-3">
                <p className="text-[11px] font-black text-cyan-800">先にやる</p>
                <ul className="space-y-1 mt-1">
                  {tactic.doFirst.map((item) => (
                    <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                <p className="text-[11px] font-black text-rose-700">避ける</p>
                <ul className="space-y-1 mt-1">
                  {tactic.avoid.map((item) => (
                    <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                  ))}
                </ul>
              </div>
              <Link
                to={tactic.route}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-cyan-700 hover:underline"
              >
                演習へ
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </article>
          )
        })}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-cyan-700" />
          <h2 className="text-base font-black text-slate-900">テーマ別の時間のかけ方</h2>
        </div>
        <div className="grid gap-3">
          {smThemeStudyRecipes.map((recipe) => {
            const theme = sortedThemes.find((item) => item.id === recipe.themeId)
            const themeStatus = readiness.find((item) => item.theme.id === recipe.themeId)
            if (!theme) return null
            return (
              <article key={recipe.themeId} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                        {theme.rank}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">{theme.title}</h3>
                      <FrequencyBadge value={theme.frequency} />
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {recipe.timeBox}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-2">{recipe.whyHighYield}</p>
                  </div>
                  {themeStatus && (
                    <Link
                      to={themeStatus.nextRoute}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
                    >
                      仕上がり {themeStatus.score}%
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
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
              </article>
            )
          })}
        </div>
      </section>
    </SmPageChrome>
  )
}
