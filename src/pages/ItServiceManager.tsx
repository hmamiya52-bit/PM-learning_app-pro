import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock, FilePenLine, FileText, Layers, ListChecks, Map, Target, TrendingUp } from 'lucide-react'
import { smAfternoonProblems, smEssayCases, smEvidenceDrills, smFrequentThemes, smKnowledgeSections, smMorningQuestions, smQuickDrills, smStudyPlanPhases } from '../data/sm/content'
import { getSmSummary } from '../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './sm/SmPageChrome'

function StatCard({
  title,
  value,
  helper,
  to,
  icon: Icon,
}: {
  title: string
  value: string
  helper: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      to={to}
      className="group bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-400">{title}</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{helper}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 flex-shrink-0 mt-1" />
      </div>
    </Link>
  )
}

export default function ItServiceManager() {
  const summary = getSmSummary()
  const sortedThemes = [...smFrequentThemes].sort((a, b) => a.rank - b.rank)
  const topThemes = sortedThemes.slice(0, 5)
  const nextAction =
    summary.morning.attempted < smMorningQuestions.length
      ? {
          text: '午前Ⅱの未演習を5問だけ解いて、頻出テーマの穴を見つける。',
          to: '/it-service-manager/morning',
          label: '午前Ⅱを解く',
        }
      : summary.afternoon.attemptedProblems < smAfternoonProblems.length
        ? {
            text: '午後Ⅰを1問選び、公式解答例と採点講評まで確認する。',
            to: '/it-service-manager/afternoon',
            label: '午後Ⅰを解く',
          }
        : summary.essay.attemptCount < 2
          ? {
              text: '午後Ⅱの骨子を1本作り、参考答案と評価観点で見直す。',
              to: '/it-service-manager/essay',
              label: '午後Ⅱを書く',
            }
          : {
              text: '不正解・低得点・未完了テーマを仕上げレポートで確認する。',
              to: '/it-service-manager/report',
              label: 'レポートを見る',
            }

  return (
    <SmPageChrome
      title="ITサービスマネージャ"
      description="直近10回の頻出テーマから、午前Ⅱ・午後Ⅰ・午後Ⅱを50時間目安で一気に仕上げる対策モードです。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <StatCard
          title="午前Ⅱ"
          value={`${summary.morning.rate}%`}
          helper={`${summary.morning.attempted}/${summary.morning.total}問演習。合格ライン60%、推奨80%。`}
          to="/it-service-manager/morning"
          icon={ListChecks}
        />
        <StatCard
          title="午後Ⅰ"
          value={summary.afternoon.bestScore === null ? '未演習' : `${summary.afternoon.bestScore}/50`}
          helper={`${summary.afternoon.attemptedProblems}/${summary.afternoon.totalProblems}問に着手。1問50点で自己採点。`}
          to="/it-service-manager/afternoon"
          icon={FileText}
        />
        <StatCard
          title="午後Ⅱ"
          value={`${summary.essay.attemptCount}本`}
          helper={`骨子・論述練習。自己評価平均 ${summary.essay.averageReview ?? '-'} / 5。`}
          to="/it-service-manager/essay"
          icon={FilePenLine}
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-700" />
              <h2 className="text-sm font-black text-slate-900">次にやること</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{nextAction.text}</p>
          </div>
          <Link
            to={nextAction.to}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
          >
            {nextAction.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Map className="w-5 h-5 text-cyan-200" />
              <h2 className="text-sm font-black">攻略マップ</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              午前Ⅱで言葉を固め、午後Ⅰで根拠を拾い、午後Ⅱでインフラ案件を改善活動として書く順番で進めます。
            </p>
          </div>
          <Link
            to="/it-service-manager/strategy"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
          >
            攻略を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-700" />
            <h2 className="text-sm font-black text-slate-900">50時間ロードマップ</h2>
          </div>
          <Link to="/it-service-manager/plan" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            プランで進める
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {smStudyPlanPhases.map((phase) => (
            <Link
              key={phase.id}
              to="/it-service-manager/plan"
              className="group rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {phase.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{phase.title}</p>
                    <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {phase.hours}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{phase.goal}</p>
                  <div className="flex items-start gap-1.5 mt-2">
                    <Target className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{phase.deliverable}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-black text-slate-900">まず押さえる頻出テーマ Top 5</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">直近10回分の出題傾向を学習順序に変換したものです。</p>
          </div>
          <Link to="/it-service-manager/themes" className="text-[11px] font-bold text-cyan-700 hover:underline flex-shrink-0">
            すべて見る
          </Link>
        </div>
        <div className="grid gap-2">
          {topThemes.map((theme) => (
            <Link
              key={theme.id}
              to={`/it-service-manager/themes#${theme.id}`}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                {theme.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-black text-slate-800">{theme.title}</p>
                  <FrequencyBadge value={theme.frequency} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{theme.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <Link to="/it-service-manager/strategy" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Map className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">攻略マップ</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">50時間の使い方、テーマ別の時間配分、仕上げ判定をまとめて確認します。</p>
        </Link>
        <Link to="/it-service-manager/cases" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Layers className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">ケース</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">午後Ⅰの根拠回答と午後Ⅱのインフラ事例を、{smEvidenceDrills.length}ドリル・{smEssayCases.length}ケースで練習します。</p>
        </Link>
        <Link to="/it-service-manager/knowledge" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <BookOpen className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">知識ノート</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">頻出テーマを軸に、午前Ⅱで覚えること、午後Ⅰで読むこと、午後Ⅱで書くことをまとめます。現在 {smKnowledgeSections.length} 章・{smQuickDrills.length}ドリル。</p>
        </Link>
        <Link to="/it-service-manager/report" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <ClipboardCheck className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">仕上げレポート</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">演習記録からテーマ別の仕上がりを見て、次に戻るべき午前Ⅱ・午後Ⅰ・午後Ⅱを決めます。</p>
        </Link>
        <Link to="/it-service-manager/history" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <TrendingUp className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">学習履歴</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">午前Ⅱの正答率、午後Ⅰの自己採点、午後Ⅱの練習本数をまとめて振り返ります。</p>
        </Link>
      </section>
    </SmPageChrome>
  )
}
