import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { smAfternoonProblems, smEssayProblems, smEvidenceDrills, smFrequentThemes, smMorningQuestions } from '../../data/sm/content'
import { averageReview, getSmSummary, loadSmAfternoonRecords, loadSmEssayAttempts, loadSmEvents, loadSmEvidenceDrillAttempts, loadSmMorningRecords } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SmHistory() {
  const summary = getSmSummary()
  const events = loadSmEvents()
  const morningRecords = loadSmMorningRecords()
  const afternoonRecords = loadSmAfternoonRecords()
  const essayAttempts = loadSmEssayAttempts()
  const evidenceAttempts = loadSmEvidenceDrillAttempts()
  const weaknessMap = new Map<string, { count: number; reasons: string[] }>()

  const addWeakness = (themeId: string, reason: string) => {
    const current = weaknessMap.get(themeId) ?? { count: 0, reasons: [] }
    weaknessMap.set(themeId, {
      count: current.count + 1,
      reasons: current.reasons.includes(reason) ? current.reasons : [...current.reasons, reason],
    })
  }

  summary.morning.wrongIds.forEach((questionId) => {
    const question = smMorningQuestions.find((item) => item.id === questionId)
    if (question) addWeakness(question.themeId, `午前Ⅱ 問${question.number}の直近回答`)
  })

  afternoonRecords
    .filter((record) => record.score < 30)
    .forEach((record) => {
      const problem = smAfternoonProblems.find((item) => item.id === record.problemId)
      problem?.themeIds.forEach((themeId) => addWeakness(themeId, `午後Ⅰ 問${problem.number} ${record.score}/50点`))
    })

  essayAttempts
    .filter((attempt) => averageReview(attempt.review) < 4)
    .forEach((attempt) => {
      const problem = smEssayProblems.find((item) => item.id === attempt.problemId)
      problem?.themeIds.forEach((themeId) => addWeakness(themeId, `午後Ⅱ 問${problem.number} 自己評価${averageReview(attempt.review)}/5`))
    })

  evidenceAttempts
    .filter((attempt) => attempt.selfScore < 4)
    .forEach((attempt) => {
      const drill = smEvidenceDrills.find((item) => item.id === attempt.drillId)
      if (drill) addWeakness(drill.themeId, `根拠ドリル ${attempt.selfScore}/5`)
    })

  const weakThemes = Array.from(weaknessMap.entries())
    .map(([themeId, value]) => ({
      theme: smFrequentThemes.find((item) => item.id === themeId),
      ...value,
    }))
    .filter((item): item is { theme: NonNullable<typeof item.theme>; count: number; reasons: string[] } => !!item.theme)
    .sort((a, b) => b.count - a.count || a.theme.rank - b.theme.rank)
    .slice(0, 5)

  return (
    <SmPageChrome
      title="学習履歴"
      description="午前Ⅱの正答率、午後Ⅰの自己採点、午後Ⅱの論述練習を振り返り、次に補強するテーマを見つけます。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">午前Ⅱ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.morning.rate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{summary.morning.attempted}/{smMorningQuestions.length}問</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">午後Ⅰ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.afternoon.recordCount}回</p>
          <p className="text-[11px] text-slate-500 mt-1">{summary.afternoon.attemptedProblems}/{smAfternoonProblems.length}問</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">根拠ドリル</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.evidenceDrills.completed}本</p>
          <p className="text-[11px] text-slate-500 mt-1">回答 {summary.evidenceDrills.attemptCount}回 / 平均 {summary.evidenceDrills.averageScore ?? '-'} </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">午後Ⅱ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.essay.attemptCount}本</p>
          <p className="text-[11px] text-slate-500 mt-1">{summary.essay.attemptedProblems}/{smEssayProblems.length}テーマ</p>
        </div>
      </section>

      <section className="bg-white border border-cyan-100 rounded-xl px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <ClipboardCheck className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">演習記録を仕上げ判断に変える</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                テーマ別の仕上がり、弱点理由、次の一手はレポートでまとめて確認できます。
              </p>
            </div>
          </div>
          <Link
            to="/it-service-manager/report"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
          >
            仕上げレポートへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-black text-slate-900">次に補強するテーマ</h2>
          <Link to="/it-service-manager/themes" className="text-[11px] font-bold text-cyan-700 hover:underline">
            頻出テーマを見る
          </Link>
        </div>
        {weakThemes.length === 0 ? (
          <p className="text-sm text-slate-500 leading-relaxed">
            不正解・低得点の記録が増えると、ここに優先して見直すテーマが出ます。まずは午前Ⅱを数問解いて、午後Ⅰを1問記録してみましょう。
          </p>
        ) : (
          <div className="grid gap-2">
            {weakThemes.map(({ theme, reasons }) => (
              <Link
                key={theme.id}
                to={`/it-service-manager/themes#${theme.id}`}
                className="group rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-black flex-shrink-0">
                    {theme.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-black text-slate-900">{theme.title}</p>
                      <FrequencyBadge value={theme.frequency} />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{reasons.slice(0, 2).join(' / ')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <h2 className="text-sm font-black text-slate-900 mb-3">最近の演習記録</h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">まだ演習記録がありません。</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs font-black text-slate-800">{event.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{event.detail}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmt(event.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">午後Ⅰ記録</h2>
            {afternoonRecords.length === 0 ? (
              <p className="text-xs text-slate-400">未記録</p>
            ) : (
              <div className="space-y-1">
                {afternoonRecords.slice().reverse().map((record) => {
                  const problem = smAfternoonProblems.find((item) => item.id === record.problemId)
                  return (
                    <p key={record.id} className="text-xs text-slate-700">
                      問{problem?.number ?? ''}: {record.score}/50点 <span className="text-slate-400">{record.recordedAt.slice(0, 10)}</span>
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">午後Ⅱ記録</h2>
            {essayAttempts.length === 0 ? (
              <p className="text-xs text-slate-400">未記録</p>
            ) : (
              <div className="space-y-1">
                {essayAttempts.slice().reverse().map((attempt) => {
                  const problem = smEssayProblems.find((item) => item.id === attempt.problemId)
                  return (
                    <p key={attempt.id} className="text-xs text-slate-700">
                      問{problem?.number ?? ''}: {attempt.recordedAt.slice(0, 10)}
                      <span className="text-slate-400 ml-1">{attempt.review.reflection}</span>
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">根拠ドリル回答</h2>
            {evidenceAttempts.length === 0 ? (
              <p className="text-xs text-slate-400">未記録</p>
            ) : (
              <div className="space-y-1">
                {evidenceAttempts.slice().reverse().slice(0, 8).map((attempt) => {
                  const drill = smEvidenceDrills.find((item) => item.id === attempt.drillId)
                  return (
                    <p key={attempt.id} className="text-xs text-slate-700 leading-relaxed">
                      {drill?.title ?? '根拠ドリル'}: {attempt.selfScore}/5
                      <span className="text-slate-400 ml-1">{attempt.recordedAt.slice(0, 10)}</span>
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">午前Ⅱ直近記録</h2>
            {morningRecords.length === 0 ? (
              <p className="text-xs text-slate-400">未記録</p>
            ) : (
              <div className="grid grid-cols-5 gap-1">
                {morningRecords.slice(-25).reverse().map((record) => {
                  const question = smMorningQuestions.find((item) => item.id === record.questionId)
                  return (
                    <span
                      key={record.id}
                      className={`rounded-md px-1.5 py-1 text-center text-[10px] font-bold ${
                        record.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      問{question?.number}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </SmPageChrome>
  )
}
