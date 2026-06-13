import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock, Layers, ListChecks, Sparkles, Target, TrendingUp, Wrench } from 'lucide-react'
import { smAnswerPartPacks, smEssayAdaptationTemplates, smEssayCases, smFinalCheckpoints, smFrequentThemes, smSimulationSets, smWeaknessPrescriptions } from '../../data/sm/content'
import type { SmFrequency } from '../../data/sm/types'
import { getSmSummary, getSmThemeReadiness, loadSmAnswerPartChecks, loadSmPrescriptionChecks, loadSmSelectedEssayCase, loadSmSimulationAttempts } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type ReportFilter = 'priority' | 'all' | SmFrequency

const statusLabel = {
  ready: '仕上げ済み',
  review: '補強中',
  start: 'これから',
} as const

const statusClass = {
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  review: 'bg-amber-50 text-amber-700 border-amber-200',
  start: 'bg-rose-50 text-rose-700 border-rose-200',
} as const

export default function SmReport() {
  const summary = getSmSummary()
  const readiness = getSmThemeReadiness()
  const [filter, setFilter] = useState<ReportFilter>('priority')
  const averageScore = readiness.length > 0
    ? Math.round(readiness.reduce((sum, item) => sum + item.score, 0) / readiness.length)
    : 0
  const needsWork = readiness.filter((item) => item.status !== 'ready').length
  const readyCount = readiness.filter((item) => item.status === 'ready').length
  const priorityActions = readiness.filter((item) => item.status !== 'ready').slice(0, 3)
  const sThemeReadiness = readiness.filter((item) => item.theme.frequency === 'S')
  const checkpointPassed: Record<string, boolean> = {
    'morning-finish': summary.morning.attempted >= summary.morning.total && summary.morning.rate >= 80,
    'afternoon-finish': summary.afternoon.attemptedProblems >= summary.afternoon.totalProblems
      && (summary.afternoon.bestScore ?? 0) >= 30
      && summary.evidenceDrills.completed >= Math.min(8, summary.evidenceDrills.total)
      && summary.evidenceDrills.attemptCount >= Math.min(8, summary.evidenceDrills.total),
    'essay-finish': summary.essay.attemptCount >= 2 && (summary.essay.averageReview ?? 0) >= 3.5,
    'theme-finish': sThemeReadiness.length > 0 && sThemeReadiness.every((item) => item.score >= 75),
  }
  const passedCheckpointCount = smFinalCheckpoints.filter((item) => checkpointPassed[item.id]).length
  const selectedCase = smEssayCases.find((item) => item.id === loadSmSelectedEssayCase()?.caseId)
  const selectedCaseTemplateCount = selectedCase
    ? smEssayAdaptationTemplates.filter((template) => template.themeIds.some((themeId) => selectedCase.themeIds.includes(themeId))).length
    : 0
  const answerPartChecks = loadSmAnswerPartChecks()
  const answerPartCompleted = smAnswerPartPacks.filter((pack) => answerPartChecks[pack.id]).length
  const answerPartSCompleted = smAnswerPartPacks.filter((pack) => {
    const theme = smFrequentThemes.find((item) => item.id === pack.themeId)
    return theme?.frequency === 'S' && answerPartChecks[pack.id]
  }).length
  const answerPartSTotal = smAnswerPartPacks.filter((pack) => smFrequentThemes.find((item) => item.id === pack.themeId)?.frequency === 'S').length
  const simulationAttempts = loadSmSimulationAttempts()
  const simulationCompleted = new Set(simulationAttempts.map((attempt) => attempt.setId)).size
  const simulationPassed = smSimulationSets.filter((set) => {
    const latest = simulationAttempts
      .filter((attempt) => attempt.setId === set.id)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
    return latest ? latest.selfScore >= 4 && latest.withinTime : false
  }).length
  const nextSimulation = smSimulationSets.find((set) => {
    const latest = simulationAttempts
      .filter((attempt) => attempt.setId === set.id)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
    return !latest || latest.selfScore < 4 || !latest.withinTime
  })
  const prescriptionChecks = loadSmPrescriptionChecks()
  const prescriptionCompleted = smWeaknessPrescriptions.filter((item) => prescriptionChecks[item.id]).length
  const prescriptionSItems = smWeaknessPrescriptions.filter((item) => item.priority === 'S')
  const prescriptionSCompleted = prescriptionSItems.filter((item) => prescriptionChecks[item.id]).length
  const nextPrescription = smWeaknessPrescriptions.find((item) => !prescriptionChecks[item.id])

  const visibleItems = filter === 'priority'
    ? readiness.filter((item) => item.status !== 'ready').slice(0, 6)
    : filter === 'all'
      ? readiness
      : readiness.filter((item) => item.theme.frequency === filter)

  return (
    <SmPageChrome
      title="仕上げレポート"
      description="午前Ⅱ・午後Ⅰ・午後Ⅱの演習記録から、次に戻るテーマを優先順で確認します。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-700" />
            <p className="text-[11px] font-bold text-slate-400">平均仕上がり</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{averageScore}%</p>
          <p className="text-[11px] text-slate-500 mt-1">テーマ別スコアの平均</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <p className="text-[11px] font-bold text-slate-400">補強テーマ</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{needsWork}</p>
          <p className="text-[11px] text-slate-500 mt-1">優先して戻る候補</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-[11px] font-bold text-slate-400">仕上げ済み</p>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{readyCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">現時点で安定しているテーマ</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">今の優先順位</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              不正解、低得点、未着手が残るテーマを上に出します。記録を追加すると順位が変わります。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center min-w-[260px]">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2">
              <p className="text-[10px] font-black text-slate-400">午前Ⅱ</p>
              <p className="text-sm font-black text-slate-900">{summary.morning.attempted}/{summary.morning.total}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2">
              <p className="text-[10px] font-black text-slate-400">午後Ⅰ</p>
              <p className="text-sm font-black text-slate-900">{summary.afternoon.attemptedProblems}/{summary.afternoon.totalProblems}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2">
              <p className="text-[10px] font-black text-slate-400">根拠ドリル</p>
              <p className="text-sm font-black text-slate-900">{summary.evidenceDrills.completed}/{summary.evidenceDrills.total}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2">
              <p className="text-[10px] font-black text-slate-400">午後Ⅱ</p>
              <p className="text-sm font-black text-slate-900">{summary.essay.attemptCount}本</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900">本番前チェック</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              合格に近い状態かを、演習記録から4項目で見ます。今は {passedCheckpointCount}/{smFinalCheckpoints.length} 個が完了目安です。
            </p>
          </div>
          <Link to="/it-service-manager/strategy" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            攻略マップへ
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          {smFinalCheckpoints.map((checkpoint) => {
            const passed = !!checkpointPassed[checkpoint.id]
            return (
              <Link
                key={checkpoint.id}
                to={checkpoint.route}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  passed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-cyan-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 ${passed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`} />
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-snug">{checkpoint.title}</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">{checkpoint.passLine}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black">次の3アクション</h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              今の記録から、最短で点に変わりやすい順に並べています。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/it-service-manager/review" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              弱点集中へ
            </Link>
            <Link to="/it-service-manager/answer-parts" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              答案パーツへ
            </Link>
            <Link to="/it-service-manager/prescriptions" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              処方箋へ
            </Link>
            <Link to="/it-service-manager/simulation" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              本番リハへ
            </Link>
            <Link to="/it-service-manager/cases" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              ケースを見る
            </Link>
            <Link to="/it-service-manager/plan" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              50時間プランへ
            </Link>
            <Link to="/it-service-manager/history" className="text-[11px] font-bold text-cyan-200 hover:underline flex-shrink-0">
              演習記録を見る
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          {priorityActions.map((item, index) => (
            <Link
              key={item.theme.id}
              to={item.nextRoute}
              className="group rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 hover:border-cyan-400 transition-colors"
            >
              <p className="text-[10px] font-black text-cyan-200">ACTION {index + 1}</p>
              <p className="text-sm font-black leading-snug mt-1">{item.theme.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{item.nextAction}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                {item.reasons[0] ?? `仕上がり ${item.score}%`}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 mt-3">
                開く
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">本番リハーサル</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                制限時間に近い形で、午前Ⅱ・午後Ⅰ・午後Ⅱの成果物を作れるかを確認します。
              </p>
            </div>
          </div>
          <Link
            to="/it-service-manager/simulation"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
          >
            本番リハへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">記録済み</p>
            <p className="text-lg font-black text-slate-900">{simulationCompleted}/{smSimulationSets.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">合格ライン到達</p>
            <p className="text-lg font-black text-slate-900">{simulationPassed}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">次に通す</p>
            <p className="text-sm font-black text-slate-900 leading-snug">{nextSimulation?.title ?? '直前仕上げで確認'}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="flex items-start gap-2">
            <Wrench className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">弱点処方箋</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                演習で出た失点の症状を、短時間で直すドリルへ変換します。
              </p>
            </div>
          </div>
          <Link
            to="/it-service-manager/prescriptions"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
          >
            処方箋へ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">完了</p>
            <p className="text-lg font-black text-slate-900">{prescriptionCompleted}/{smWeaknessPrescriptions.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">頻出S</p>
            <p className="text-lg font-black text-slate-900">{prescriptionSCompleted}/{prescriptionSItems.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">次に直す</p>
            <p className="text-sm font-black text-slate-900 leading-snug">{nextPrescription?.title ?? '本番リハで確認'}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">答案パーツの仕上がり</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                午後Ⅰの短答と午後Ⅱの論述で使い回す表現を、頻出Sから先に固めます。
              </p>
            </div>
          </div>
          <Link
            to="/it-service-manager/answer-parts"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
          >
            答案パーツへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">完了</p>
            <p className="text-lg font-black text-slate-900">{answerPartCompleted}/{smAnswerPartPacks.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">頻出S</p>
            <p className="text-lg font-black text-slate-900">{answerPartSCompleted}/{answerPartSTotal}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-[10px] font-black text-slate-400">次に効く</p>
            <p className="text-sm font-black text-slate-900 leading-snug">
              {answerPartCompleted < smAnswerPartPacks.length ? '未完了の頻出表現を暗唱する' : '午後Ⅰ・午後Ⅱで使って定着させる'}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">午後Ⅱで使う題材</h2>
            </div>
            {selectedCase ? (
              <>
                <p className="text-sm font-black text-slate-900 leading-snug mt-2">{selectedCase.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {selectedCase.service} / {selectedCase.metrics[0]}
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  この題材で使いやすい題意テンプレ {selectedCaseTemplateCount} 本
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                インフラ案件の題材を1つ決めると、午後Ⅱの骨子が作りやすくなります。
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              to="/it-service-manager/cases"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
            >
              題材を選ぶ
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {selectedCase && (
              <Link
                to="/it-service-manager/essay"
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
              >
                題意で組み替える
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-1.5">
        {([
          ['priority', '優先順'],
          ['all', 'すべて'],
          ['S', '頻出S'],
          ['A', '頻出A'],
          ['B', '頻出B'],
        ] as [ReportFilter, string][]).map(([value, label]) => (
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

      <section className="grid gap-3">
        {visibleItems.map((item) => (
          <article key={item.theme.id} className="bg-white border border-slate-200 rounded-xl px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    {item.theme.rank}
                  </span>
                  <h2 className="text-base font-black text-slate-900">{item.theme.title}</h2>
                  <FrequencyBadge value={item.theme.frequency} />
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mt-3">{item.theme.summary}</p>
              </div>
              <div className="lg:w-44">
                <div className="flex items-end justify-between gap-2">
                  <p className="text-[11px] font-black text-slate-400">仕上がり</p>
                  <p className="text-2xl font-black text-slate-900">{item.score}%</p>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'ready' ? 'bg-emerald-500' : item.status === 'review' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(4, item.score)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-cyan-700" />
                  <p className="text-[11px] font-black text-slate-500">午前Ⅱ</p>
                </div>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {item.morning.correct}/{item.morning.total}正解
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  演習 {item.morning.attempted}/{item.morning.total}問 / 不正解 {item.morning.wrong}問
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[11px] font-black text-slate-500">午後Ⅰ</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {item.afternoon.bestScore === null ? '未記録' : `${item.afternoon.bestScore}/50点`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  着手 {item.afternoon.attempted}/{item.afternoon.total}問 / 30点未満 {item.afternoon.lowScoreCount}回
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[11px] font-black text-slate-500">根拠ドリル</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {item.afternoon.evidenceTotal === 0 ? '対象なし' : `${item.afternoon.evidenceCompleted}/${item.afternoon.evidenceTotal}本`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  頻出テーマの短答練習
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[11px] font-black text-slate-500">午後Ⅱ</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {item.essay.averageReview === null ? '未記録' : `${item.essay.averageReview}/5`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  練習 {item.essay.attempts}本 / 評価3.5未満 {item.essay.lowReviewCount}回
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50/70 px-3 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black text-cyan-900">次の一手</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed mt-1">{item.nextAction}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    {item.reasons.length > 0 ? item.reasons.join(' / ') : '大きな弱点記録はありません。軽く見直して維持します。'}
                  </p>
                </div>
                <Link
                  to={item.nextRoute}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
                >
                  開く
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </SmPageChrome>
  )
}
