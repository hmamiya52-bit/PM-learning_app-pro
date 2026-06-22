import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock, FilePenLine, FileText, Layers, ListChecks, Map, RotateCcw, Sparkles, Target, TimerReset, TrendingUp, Wrench } from 'lucide-react'
import { smAfternoonProblems, smAnswerPartPacks, smEssayAdaptationTemplates, smEssayCases, smEvidenceDrills, smFrequentThemes, smKnowledgeSections, smMorningQuestions, smQuickDrills, smSimulationSets, smStudyPlanPhases, smWeaknessPrescriptions } from '../data/sm/content'
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
  const todayActions = [
    {
      title: '午前Ⅱ 5問',
      text: summary.morning.attempted < smMorningQuestions.length
        ? 'R7最新年の未演習から5問解き、用語の取り違えを減らす。'
        : '直近不正解だけを解き直し、正解以外の選択肢を切る理由まで確認する。',
      to: '/it-service-manager/morning',
      label: '午前Ⅱへ',
      icon: ListChecks,
    },
    {
      title: '午後Ⅰ 1設問',
      text: summary.afternoon.attemptedProblems < smAfternoonProblems.length
        ? 'R7午後Ⅰから1問選び、本文根拠と公式解答例を照合する。'
        : '90分で3問から2問を選ぶ前提で、捨て問判断と時間配分を確認する。',
      to: '/it-service-manager/afternoon',
      label: '午後Ⅰへ',
      icon: FileText,
    },
    {
      title: '午後Ⅱ 10分',
      text: summary.essay.attemptCount < 2
        ? 'インフラ案件の題材を1つ選び、設問ア・イ・ウの骨子だけ先に作る。'
        : '既存の骨子を、設問要求・具体性・評価観点で1段落だけ直す。',
      to: '/it-service-manager/essay',
      label: '午後Ⅱへ',
      icon: FilePenLine,
    },
  ]

  return (
      <SmPageChrome
        title="ITサービスマネージャ"
      description="午後Ⅰ・午後Ⅱの直近10回分析とR7午前Ⅱ演習を使い、50時間目安で合格に必要なテーマへ集中します。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
          title="根拠ドリル"
          value={`${summary.evidenceDrills.completed}/${smEvidenceDrills.length}`}
          helper={`回答 ${summary.evidenceDrills.attemptCount}回。平均 ${summary.evidenceDrills.averageScore ?? '-'} / 5。`}
          to="/it-service-manager/cases"
          icon={Layers}
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
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-700" />
          <div>
            <h2 className="text-sm font-black text-slate-900">今日の30〜60分セット</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">午前Ⅱだけを終えてから午後へ進むのではなく、毎回3科目を少しずつ動かします。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {todayActions.map(({ title, text, to, label, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 hover:border-cyan-200 hover:bg-cyan-50/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{text}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-700 mt-2">
                    {label}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-black text-slate-900">2026年度時点のCBT前提で学習</h2>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              2026年度の案内では、知識・技能の範囲、出題形式、出題数、試験時間は変わらない前提です。現行試験制度は2026年度の試験実施をもって終了予定のため、このモードでは2026年度時点の午前Ⅱ・午後Ⅰ・午後Ⅱ対策として扱います。
            </p>
          </div>
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
              午前Ⅱで用語を整理し、午後Ⅰで本文根拠を拾い、午後Ⅱでインフラ案件をサービスマネジメント活動として書けるように進めます。
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
            <p className="text-[11px] text-slate-500 mt-1">午後Ⅰ・午後Ⅱの直近10回分析をもとに、午前Ⅱの用語学習にも転用しやすいテーマから並べています。</p>
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <Link to="/it-service-manager/strategy" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Map className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">攻略マップ</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">50時間の配分、テーマ別の学習時間、仕上がりの目安をまとめて確認します。</p>
        </Link>
        <Link to="/it-service-manager/review" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <RotateCcw className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">弱点集中</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">演習記録から、今日見直すべき午前Ⅱ・根拠ドリル・午後Ⅰ・午後Ⅱを自動で並べます。</p>
        </Link>
        <Link to="/it-service-manager/prescriptions" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Wrench className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">弱点対策</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">失点パターンから、短時間で見直す順番と戻るページを決めます。現在 {smWeaknessPrescriptions.length} 件。</p>
        </Link>
        <Link to="/it-service-manager/answer-parts" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Sparkles className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">答案パーツ</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">午後Ⅰ・午後Ⅱですぐ使える表現を、改善前と改善後の答案で比べながら覚えます。現在 {smAnswerPartPacks.length} 本。</p>
        </Link>
        <Link to="/it-service-manager/simulation" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <TimerReset className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">本番リハーサル</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">午前Ⅱ・午後Ⅰ・午後Ⅱを、制限時間と成果物を決めて通します。現在 {smSimulationSets.length} セット。</p>
        </Link>
        <Link to="/it-service-manager/cases" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Layers className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">ケース</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">午後Ⅰの根拠回答と午後Ⅱのインフラ事例を、{smEvidenceDrills.length}ドリル・{smEssayCases.length}ケース・{smEssayAdaptationTemplates.length}テンプレートで練習します。</p>
        </Link>
        <Link to="/it-service-manager/knowledge" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <BookOpen className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">知識ノート</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">頻出テーマを軸に、午前Ⅱで覚えること、午後Ⅰで読むこと、午後Ⅱで書くことをまとめます。現在 {smKnowledgeSections.length} 章・{smQuickDrills.length}ドリル。</p>
        </Link>
        <Link to="/it-service-manager/report" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <ClipboardCheck className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">仕上げレポート</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">演習記録からテーマ別の仕上がりを見て、次に見直す午前Ⅱ・午後Ⅰ・午後Ⅱを決めます。</p>
        </Link>
        <Link to="/it-service-manager/final" className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all">
          <Target className="w-5 h-5 text-cyan-700 mb-2" />
          <p className="text-sm font-black text-slate-900">直前仕上げ</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">本番前に確認するタスク、答案の最終チェック、当日の動きを一画面で確認します。</p>
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
