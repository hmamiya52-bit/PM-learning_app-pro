import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
// 集計に必要なのは件数と id/topicId だけなので、問題本体ではなくメタデータを使う
// （初期バンドルから questions / officialMorningQuestions 本体を外すため。M1 Step3）
import { getAllProgress, getQuestionMastery } from '../lib/storage'
import CategoryCard from '../components/CategoryCard'
import LevelWidget from '../components/gamification/LevelWidget'
import { getRecentDaySummaries } from '../lib/activityLog'
import { StudyHistoryList } from '../components/history/StudyHistoryList'
import { questionMeta, officialMorningQuestionIds } from '../data/questionMeta'
import { loadMorningRecords } from '../lib/morningRecords'
import { afternoonProblems } from '../data/afternoonProblems'
import { loadRecords } from '../lib/tracker'
import { essayProblems } from '../data/essayProblems'
import { loadAttempts } from '../lib/essay'
import type { EssaySelfReview } from '../types'

const AFTERNOON_PASS_SCORE = 30
const ESSAY_PASS_AVERAGE = 4.5

// ----------------------------------------------------------------
// Menu card data
// 設計書 §5.1 line 3006-3022 の MENU_CARDS リスト（PM 14項目）
// サイドバー順（ホーム除く 1〜14）と一致させる。
// ----------------------------------------------------------------

interface MenuCard {
  to: string
  title: string
  description: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  /** weakness モードのように、未学習だと無効化する判定が必要なもの */
  disableWhenNoStudy?: boolean
}

function IconHelp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconSeed({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0C8 13 5 10.5 5 7V4h3c3.5 0 6 2.5 6 6v3Zm0 0c4 0 7-2.5 7-6V4h-3c-3.5 0-6 2.5-6 6" />
    </svg>
  )
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconShuffle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5l3 8h5m0 0l-3 3m3-3l-3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h5l7-8" />
    </svg>
  )
}

function IconFileText({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function IconPen({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconServer({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2M7 8h.01M7 16h.01" />
    </svg>
  )
}

function IconSync({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0118.5 6M4.582 9H9m11 11v-5h-.581m0 0A7.5 7.5 0 015.5 18m13.919-3H15" />
    </svg>
  )
}

/**
 * 学習メニュー（7項目）— F1-P6 後の UX 整理（2回目）:
 *   削除済み:
 *     - 重要問題モード:  ModeSelect の「重要のみ」トグルで実現
 *     - 弱点克服モード:  ModeSelect の「弱点のみ」トグルで実現（F1-P6 後改修）
 *     - カテゴリ別学習:  ノートモードの動線と重複のため削除
 *     - ランダム出題:    「カテゴリ一覧」セクション右上のボタンから起動
 *     - 検索:            ヘッダの検索アイコンから常時アクセス可
 *     - バッジ:          LevelWidget をクリックすると遷移
 *     - 学習履歴:        ページ下部の「学習履歴」セクションで直接表示
 *     - 設定:            ヘッダの歯車アイコンから常時アクセス可
 *
 * 試験区分の名称:
 *   - 「公式午前Ⅱ問題」→「午前Ⅱ問題演習」
 *   - 「午後Ⅰ問題」→「午後Ⅰ問題演習」
 *   - 「論述トレーニング」→「午後Ⅱ問題演習」
 */
const MENU_CARDS: MenuCard[] = [
  // 1. アプリの使い方
  { to: '/how-to-use',          title: 'アプリの使い方',     description: '各学習モードの活用方法',     iconBg: 'bg-brand-light',    iconColor: 'text-brand',      icon: <IconHelp className="w-6 h-6 text-brand" /> },
  // 2. 応用情報マネジメント
  { to: '/applied-refresh',     title: '応用情報マネジメント', description: 'Re: APから始めるPM対策',  iconBg: 'bg-emerald-50',     iconColor: 'text-emerald-600', icon: <IconSeed className="w-6 h-6 text-emerald-600" /> },
  // 3. ノートモード
  { to: '/notes',               title: 'ノートモード',       description: '分野別の重要知識まとめ',     iconBg: 'bg-teal-50',        iconColor: 'text-teal-600',   icon: <IconBook className="w-6 h-6 text-teal-600" /> },
  // 4. 午前Ⅱ問題演習
  { to: '/morning',             title: '午前Ⅱ問題演習',     description: '過去問4択 出典:IPA',         iconBg: 'bg-indigo-50',      iconColor: 'text-indigo-600', icon: <IconFileText className="w-6 h-6 text-indigo-600" /> },
  // 5. 午後Ⅰ問題演習
  { to: '/afternoon',           title: '午後Ⅰ問題演習',     description: '自己採点・記録',             iconBg: 'bg-purple-50',      iconColor: 'text-purple-600', icon: <IconClipboard className="w-6 h-6 text-purple-600" /> },
  // 6. 午後Ⅱ問題演習（論述）
  { to: '/essay',               title: '午後Ⅱ問題演習',     description: '論述・自己採点',             iconBg: 'bg-pink-50',        iconColor: 'text-pink-600',   icon: <IconPen className="w-6 h-6 text-pink-600" /> },
  // 7. ITサービスマネージャ
  { to: '/it-service-manager',   title: 'ITサービスマネージャ', description: '50時間目安で合格へ',          iconBg: 'bg-cyan-50',        iconColor: 'text-cyan-600',   icon: <IconServer className="w-6 h-6 text-cyan-600" /> },
  // 8. デバイス同期
  { to: '/sync',                title: 'デバイス同期',       description: 'QRコードで他端末へ',         iconBg: 'bg-sky-50',         iconColor: 'text-sky-600',    icon: <IconSync className="w-6 h-6 text-sky-600" /> },
]

function MenuCardGrid({ cards, studiedCount }: { cards: MenuCard[]; studiedCount: number }) {
  return (
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {cards.map((card) => {
        const disabled = card.disableWhenNoStudy && studiedCount === 0
        return disabled ? (
          <div
            key={`${card.to}-${card.title}`}
            className="flex items-center gap-1.5 sm:gap-3 bg-slate-50 rounded-xl border border-slate-200 px-2.5 py-2 sm:px-3 sm:py-2.5 opacity-60 cursor-not-allowed"
          >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-6 sm:[&>svg]:h-6 flex">
                {card.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-500 leading-tight truncate">
                {card.title}
              </p>
              <p className="text-[9px] sm:text-[11px] text-slate-400 leading-tight truncate">問題を解くと使えます</p>
            </div>
          </div>
        ) : (
          <Link
            key={`${card.to}-${card.title}`}
            to={card.to}
            className="group relative flex items-center gap-1.5 sm:gap-3 bg-white rounded-xl border border-slate-200 px-2.5 py-2 sm:px-3 sm:py-2.5 hover:border-brand hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-6 sm:[&>svg]:h-6 flex">
                {card.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight group-hover:text-brand-dark transition-colors truncate">
                {card.title}
              </p>
              <p className="text-[9px] sm:text-[11px] text-slate-400 leading-tight truncate">{card.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

interface ProgressSegment {
  label: string
  count: number
  color: string
}

interface MasterySummary {
  consecutive: number
  correct: number
  incorrect: number
  total: number
}

function ratioWidth(count: number, total: number): string {
  return total > 0 ? `${(count / total) * 100}%` : '0%'
}

function MasteryProgressRow({ title, mastery }: { title: string; mastery: MasterySummary }) {
  const { consecutive, correct, incorrect, total } = mastery
  const unattempted = Math.max(0, total - consecutive - correct - incorrect)
  const achieved = consecutive + correct
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[11px] font-bold text-slate-500">{title}</span>
        <span className="text-[10px] font-bold tabular-nums text-slate-400">
          {achieved}/{total}
        </span>
      </div>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${title} 達成度`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={achieved}
      >
        {consecutive > 0 && <div className="h-full bg-sky-500 flex-shrink-0 transition-all duration-500" style={{ width: ratioWidth(consecutive, total) }} />}
        {correct > 0 && <div className="h-full bg-emerald-500 flex-shrink-0 transition-all duration-500" style={{ width: ratioWidth(correct, total) }} />}
        {incorrect > 0 && <div className="h-full bg-orange-400 flex-shrink-0 transition-all duration-500" style={{ width: ratioWidth(incorrect, total) }} />}
        {unattempted > 0 && <div className="h-full bg-slate-200 flex-shrink-0" style={{ width: ratioWidth(unattempted, total) }} />}
      </div>
    </div>
  )
}

function ProgressStatusRow({
  title,
  total,
  segments,
}: {
  title: string
  total: number
  segments: ProgressSegment[]
}) {
  const detail = segments.map((segment) => `${segment.label} ${segment.count}`).join(' / ')
  const achieved = segments[0]?.count ?? 0
  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[11px] font-bold text-slate-500">{title}</span>
        <span className="text-[10px] font-bold tabular-nums text-slate-400">{rate}%</span>
      </div>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`${title}: ${detail}`}
      >
        {segments.map((segment) => (
          segment.count > 0 && (
            <div
              key={segment.label}
              title={`${segment.label} ${segment.count}`}
              className={`h-full flex-shrink-0 transition-all duration-500 ${segment.color}`}
              style={{ width: ratioWidth(segment.count, total) }}
            />
          )
        ))}
      </div>
    </div>
  )
}

function averageEssayReview(review: EssaySelfReview): number {
  const { relevance, structure, concreteness, consistency, charCount } = review
  return Math.round(((relevance + structure + concreteness + consistency + charCount) / 5) * 10) / 10
}

// ----------------------------------------------------------------
// Home
// ----------------------------------------------------------------

export default function Home() {
  // --- Data ---
  const allProgress = useMemo(() => getAllProgress(), [])
  const daySummaries = useMemo(() => getRecentDaySummaries(10), [])

  // 弱点克服モードの非活性化判定用：1問でも回答していれば学習済みとみなす
  const studiedCount = useMemo(() => {
    const studiedTopicIds = new Set(
      allProgress.filter((p) => p.totalAttempts > 0).map((p) => p.topicId),
    )
    return questionMeta.filter((q) => studiedTopicIds.has(q.topicId)).length
  }, [allProgress])

  // 4択／記述の正答率は分離して算出
  const globalMcRate = useMemo(() => {
    const total = allProgress.reduce((s, p) => s + p.mcAttempts, 0)
    const correct = allProgress.reduce((s, p) => s + p.mcCorrect, 0)
    if (total === 0) return null
    return Math.round((correct / total) * 100)
  }, [allProgress])

  const globalWrRate = useMemo(() => {
    const total = allProgress.reduce((s, p) => s + p.wrAttempts, 0)
    const correct = allProgress.reduce((s, p) => s + p.wrCorrect, 0)
    if (total === 0) return null
    return Math.round((correct / total) * 100)
  }, [allProgress])

  const morningAchievement = useMemo(() => {
    const latestResults = new Map<string, boolean>()
    for (const record of loadMorningRecords()) {
      if (!latestResults.has(record.questionId)) {
        latestResults.set(record.questionId, record.isCorrect)
      }
    }
    let correct = 0
    let incorrect = 0
    for (const questionId of officialMorningQuestionIds) {
      const latest = latestResults.get(questionId)
      if (latest === true) correct++
      else if (latest === false) incorrect++
    }
    const unstarted = Math.max(0, officialMorningQuestionIds.length - correct - incorrect)
    return {
      total: officialMorningQuestionIds.length,
      segments: [
        { label: '正解', count: correct, color: 'bg-emerald-500' },
        { label: '不正解', count: incorrect, color: 'bg-orange-400' },
        { label: '未着手', count: unstarted, color: 'bg-slate-200' },
      ],
    }
  }, [])

  const afternoonAchievement = useMemo(() => {
    const scoresByProblem = new Map<string, number[]>()
    for (const record of loadRecords()) {
      const scores = scoresByProblem.get(record.problemId) ?? []
      scores.push(record.score)
      scoresByProblem.set(record.problemId, scores)
    }

    let passed = 0
    let failed = 0
    for (const problem of afternoonProblems) {
      const scores = scoresByProblem.get(problem.id) ?? []
      if (scores.length === 0) continue
      if (scores.some((score) => score >= AFTERNOON_PASS_SCORE)) passed++
      else failed++
    }
    const unstarted = Math.max(0, afternoonProblems.length - passed - failed)
    return {
      total: afternoonProblems.length,
      segments: [
        { label: '合格', count: passed, color: 'bg-emerald-500' },
        { label: '不合格', count: failed, color: 'bg-red-400' },
        { label: '未着手', count: unstarted, color: 'bg-slate-200' },
      ],
    }
  }, [])

  const essayAchievement = useMemo(() => {
    const averagesByProblem = new Map<string, number[]>()
    for (const attempt of loadAttempts()) {
      const averages = averagesByProblem.get(attempt.problemId) ?? []
      averages.push(averageEssayReview(attempt.selfReview))
      averagesByProblem.set(attempt.problemId, averages)
    }

    let passed = 0
    let failed = 0
    for (const problem of essayProblems) {
      const averages = averagesByProblem.get(problem.id) ?? []
      if (averages.length === 0) continue
      if (averages.some((average) => average >= ESSAY_PASS_AVERAGE)) passed++
      else failed++
    }
    const unstarted = Math.max(0, essayProblems.length - passed - failed)
    return {
      total: essayProblems.length,
      segments: [
        { label: '合格', count: passed, color: 'bg-emerald-500' },
        { label: '不合格', count: failed, color: 'bg-red-400' },
        { label: '未着手', count: unstarted, color: 'bg-slate-200' },
      ],
    }
  }, [])

  const categoryStats = useMemo(() => {
    const masteryMap = getQuestionMastery()
    return categories.map((cat) => {
      const catQuestions = questionMeta.filter((q) => q.topicId === cat.id)
      const catProgress = allProgress.filter((p) => p.topicId === cat.id)
      const mcTotal = catProgress.reduce((s, p) => s + p.mcAttempts, 0)
      const mcCorrect = catProgress.reduce((s, p) => s + p.mcCorrect, 0)
      const wrTotal = catProgress.reduce((s, p) => s + p.wrAttempts, 0)
      const wrCorrect = catProgress.reduce((s, p) => s + p.wrCorrect, 0)
      const mcRate = mcTotal > 0 ? Math.round((mcCorrect / mcTotal) * 100) : null
      const wrRate = wrTotal > 0 ? Math.round((wrCorrect / wrTotal) * 100) : null

      const mcMastery = { consecutive: 0, correct: 0, incorrect: 0 }
      const wrMastery = { consecutive: 0, correct: 0, incorrect: 0 }
      for (const q of catQuestions) {
        const ms = masteryMap[`${q.id}:multiple-choice`]
        if (ms === 'consecutive') mcMastery.consecutive++
        else if (ms === 'correct') mcMastery.correct++
        else if (ms === 'incorrect') mcMastery.incorrect++
        const ws = masteryMap[`${q.id}:written`]
        if (ws === 'consecutive') wrMastery.consecutive++
        else if (ws === 'correct') wrMastery.correct++
        else if (ws === 'incorrect') wrMastery.incorrect++
      }

      const lastStudied =
        catProgress
          .filter((p) => p.lastStudiedAt)
          .sort((a, b) => (b.lastStudiedAt > a.lastStudiedAt ? 1 : -1))[0]
          ?.lastStudiedAt ?? ''
      return {
        category: cat,
        questionCount: catQuestions.length,
        mcRate,
        wrRate,
        mcMastery: { ...mcMastery, total: catQuestions.length },
        wrMastery: { ...wrMastery, total: catQuestions.length },
        lastStudiedAt: lastStudied,
      }
    })
  }, [allProgress])

  // 全カテゴリの mastery を集計（凡例バー用）
  const globalMastery = useMemo(() => {
    const mc = { consecutive: 0, correct: 0, incorrect: 0, total: 0 }
    const wr = { consecutive: 0, correct: 0, incorrect: 0, total: 0 }
    for (const s of categoryStats) {
      mc.consecutive += s.mcMastery.consecutive
      mc.correct += s.mcMastery.correct
      mc.incorrect += s.mcMastery.incorrect
      mc.total += s.mcMastery.total
      wr.consecutive += s.wrMastery.consecutive
      wr.correct += s.wrMastery.correct
      wr.incorrect += s.wrMastery.incorrect
      wr.total += s.wrMastery.total
    }
    return { mc, wr }
  }, [categoryStats])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-4 pt-4">

        {/* ===== タイトル =====
            NOTE: hex色 #9d5b8b は F1-P6 ブランド適用マップで brand 系へ機械置換予定（D-UI-02） */}
        <h1
          className="text-center font-black leading-tight pt-2 pb-1"
          style={{ color: '#9d5b8b', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
        >
          <span
            className="inline-block pb-1"
            style={{
              borderBottom: '2px solid rgba(157, 91, 139, 0.72)',
              textShadow: '0 0 12px rgba(157, 91, 139, 0.22)',
            }}
          >
            PM Learning App
          </span>
        </h1>
        <p className="text-center text-xs text-slate-500 -mt-1">プロジェクトマネージャ試験 学習アプリ</p>

        <LevelWidget />

        {/* ===== 学習メニュー（14項目） ===== */}
        <section aria-labelledby="menu-heading">
          <h2
            id="menu-heading"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
          >
            学習メニュー
          </h2>
          <MenuCardGrid cards={MENU_CARDS} studiedCount={studiedCount} />
        </section>

        {/* ===== 全体の学習進捗 ===== */}
        <section aria-labelledby="progress-heading">
          <h2
            id="progress-heading"
            className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            全体の学習進捗
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
            <div className="space-y-2">
              <MasteryProgressRow title="4択 達成度" mastery={globalMastery.mc} />
              <MasteryProgressRow title="記述 達成度" mastery={globalMastery.wr} />

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
                {[
                  { color: 'bg-sky-500', label: '連続正解' },
                  { color: 'bg-emerald-500', label: '１回正解' },
                  { color: 'bg-orange-400', label: '不正解' },
                  { color: 'bg-slate-200', label: '未着手' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <ProgressStatusRow
                  title="午前Ⅱ達成度"
                  total={morningAchievement.total}
                  segments={morningAchievement.segments}
                />
                <ProgressStatusRow
                  title="午後Ⅰ達成度"
                  total={afternoonAchievement.total}
                  segments={afternoonAchievement.segments}
                />
                <ProgressStatusRow
                  title="午後Ⅱ達成度"
                  total={essayAchievement.total}
                  segments={essayAchievement.segments}
                />
              </div>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400">午前Ⅱ</span>
                {[
                  { color: 'bg-emerald-500', label: '正解' },
                  { color: 'bg-orange-400', label: '不正解' },
                  { color: 'bg-slate-200', label: '未着手' },
                ].map(({ color, label }) => (
                  <span key={`morning-${label}`} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                    {label}
                  </span>
                ))}
                <span className="text-[10px] font-bold text-slate-400">午後</span>
                {[
                  { color: 'bg-emerald-500', label: '合格' },
                  { color: 'bg-red-400', label: '不合格' },
                  { color: 'bg-slate-200', label: '未着手' },
                ].map(({ color, label }) => (
                  <span key={`afternoon-${label}`} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                    {label}
                  </span>
                ))}
              </div>

              {(globalMcRate !== null || globalWrRate !== null) && (
                <div className="text-[11px] text-slate-400 pt-0.5">
                  {globalMcRate !== null && (
                    <>４択正答率 <span className="font-medium text-slate-500">{globalMcRate}%</span></>
                  )}
                  {globalMcRate !== null && globalWrRate !== null && <span> ｜ </span>}
                  {globalWrRate !== null && (
                    <>記述正答率 <span className="font-medium text-slate-500">{globalWrRate}%</span></>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== カテゴリ一覧（12分野） ===== */}
        <section aria-labelledby="categories-heading" id="categories">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="categories-heading"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              カテゴリ一覧（{categories.length}分野）
            </h2>
            <Link
              to="/quiz?mode=random"
              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="ランダム出題で学習する"
            >
              <IconShuffle className="h-3.5 w-3.5" />
              ランダム出題
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryStats.map(({ category, questionCount, mcRate, wrRate, mcMastery, wrMastery, lastStudiedAt }) => (
              <CategoryCard
                key={category.id}
                category={category}
                questionCount={questionCount}
                mcRate={mcRate}
                wrRate={wrRate}
                mcMastery={mcMastery}
                wrMastery={wrMastery}
                lastStudiedAt={lastStudiedAt}
              />
            ))}
          </div>
        </section>

        {/* ===== 学習履歴 ===== */}
        <section aria-labelledby="history-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="history-heading"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              学習履歴（直近10日）
            </h2>
          </div>
          <StudyHistoryList daySummaries={daySummaries} />
          {daySummaries.length > 0 && (
            <div className="mt-2 flex justify-end">
              <Link
                to="/history"
                className="text-xs text-brand hover:text-brand-dark hover:underline transition-colors"
              >
                全件表示 →
              </Link>
            </div>
          )}
        </section>

        {/* フッター注記（PM 用に文言調整） */}
        <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
          PM Learning App は開発中の Beta 版です。
        </p>

      </div>
    </div>
  )
}
