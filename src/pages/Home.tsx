import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { questions } from '../data/questions'
import { getAllProgress, getAnswerRecords, getQuestionMastery } from '../lib/storage'
import CategoryCard from '../components/CategoryCard'
import LevelWidget from '../components/gamification/LevelWidget'
import { getRecentDaySummaries } from '../lib/activityLog'
import { StudyHistoryList } from '../components/history/StudyHistoryList'
import { getImportantIds } from '../lib/importantMarks'

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

function IconBook({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

function IconTrendingDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
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

function IconLayers({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

function IconSearch({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function IconMedal({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

function IconBarChart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M6 16V8m6 8V4m6 12v-5" />
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

function IconGear({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const MENU_CARDS: MenuCard[] = [
  // 1. アプリの使い方
  { to: '/how-to-use',          title: 'アプリの使い方',     description: '5つの学習モードの活用方法', iconBg: 'bg-brand-light',    iconColor: 'text-brand',   icon: <IconHelp className="w-6 h-6 text-brand" /> },
  // 2. ノートモード
  { to: '/notes',               title: 'ノートモード',       description: '分野別の重要知識まとめ',     iconBg: 'bg-teal-50',    iconColor: 'text-teal-600',   icon: <IconBook className="w-6 h-6 text-teal-600" /> },
  // 3. 重要問題モード
  { to: '/quiz?mode=important', title: '重要問題モード',     description: 'マーク済み問題のみ',         iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',  icon: <IconStar className="w-6 h-6 text-amber-500" /> },
  // 4. 弱点克服モード（未学習時は無効）
  { to: '/quiz?mode=weakness',  title: '弱点克服モード',     description: '不正解の多い問題',           iconBg: 'bg-red-50',     iconColor: 'text-red-500',    icon: <IconTrendingDown className="w-6 h-6 text-red-500" />, disableWhenNoStudy: true },
  // 5. ランダム出題
  { to: '/quiz?mode=random',    title: 'ランダム出題',       description: '全カテゴリから',             iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',icon: <IconShuffle className="w-6 h-6 text-emerald-600" /> },
  // 6. カテゴリ別学習（/notes に飛ばし、ユーザがカテゴリ選択経由でクイズへ。DP-P1-1）
  { to: '/notes',               title: 'カテゴリ別学習',     description: 'カテゴリを選んで学習',       iconBg: 'bg-cyan-50',    iconColor: 'text-cyan-600',   icon: <IconLayers className="w-6 h-6 text-cyan-600" /> },
  // 7. 公式午前II問題（F1-P4 で本格実装、現状は 404 へ）
  { to: '/morning',             title: '公式午前II問題',     description: '過去問25問×全年度',          iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600', icon: <IconFileText className="w-6 h-6 text-indigo-600" /> },
  // 8. 午後問題
  { to: '/afternoon',           title: '午後問題',           description: '自己採点・記録',             iconBg: 'bg-purple-50',  iconColor: 'text-purple-600', icon: <IconClipboard className="w-6 h-6 text-purple-600" /> },
  // 9. 論述トレーニング（F1-P5 で本格実装、現状は 404 へ）
  { to: '/essay',               title: '論述トレーニング',   description: '午後II対応',                 iconBg: 'bg-pink-50',    iconColor: 'text-pink-600',   icon: <IconPen className="w-6 h-6 text-pink-600" /> },
  // 10. 検索
  { to: '/search',              title: '検索',               description: '全コンテンツ検索',           iconBg: 'bg-slate-50',   iconColor: 'text-slate-600',  icon: <IconSearch className="w-6 h-6 text-slate-600" /> },
  // 11. バッジ
  { to: '/badges',              title: 'バッジ',             description: '解錠状況',                   iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-600', icon: <IconMedal className="w-6 h-6 text-yellow-600" /> },
  // 12. 学習履歴
  { to: '/history',             title: '学習履歴',           description: '日次・週次サマリ',           iconBg: 'bg-violet-50',  iconColor: 'text-violet-600', icon: <IconBarChart className="w-6 h-6 text-violet-600" /> },
  // 13. デバイス同期
  { to: '/sync',                title: 'デバイス同期',       description: 'QRコードで他端末へ',         iconBg: 'bg-sky-50',     iconColor: 'text-sky-600',    icon: <IconSync className="w-6 h-6 text-sky-600" /> },
  // 14. 設定
  { to: '/settings',            title: '設定',               description: 'リセット・重要マーク管理',   iconBg: 'bg-slate-100',  iconColor: 'text-slate-700',  icon: <IconGear className="w-6 h-6 text-slate-700" /> },
]

function MenuCardGrid({ cards, studiedCount }: { cards: MenuCard[]; studiedCount: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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

// ----------------------------------------------------------------
// Home
// ----------------------------------------------------------------

export default function Home() {
  // --- Data ---
  const allProgress = useMemo(() => getAllProgress(), [])
  const daySummaries = useMemo(() => getRecentDaySummaries(10), [])

  const totalQuestions = questions.length
  // ★F1-P2: 静的 isImportant フラグ廃止 → importantMarks LocalStorage 参照に変更
  const importantCount = useMemo(
    () => getImportantIds().filter((id) => id.startsWith('q-')).length,
    [],
  )

  // 「達成」した問題ID集合：1回でも正解した問題の questionId（重複は1つに集約）
  const achievedQuestionIds = useMemo(() => {
    const set = new Set<string>()
    for (const r of getAnswerRecords()) {
      if (r.isCorrect) set.add(r.questionId)
    }
    return set
  }, [])

  // 全体達成数 = 達成済みのうち、現在も questions に存在する ID の数
  const achievedCount = useMemo(
    () => questions.filter((q) => achievedQuestionIds.has(q.id)).length,
    [achievedQuestionIds],
  )

  // 弱点克服モードの非活性化判定用：1問でも回答していれば学習済みとみなす
  const studiedCount = useMemo(() => {
    const studiedTopicIds = new Set(
      allProgress.filter((p) => p.totalAttempts > 0).map((p) => p.topicId),
    )
    return questions.filter((q) => studiedTopicIds.has(q.topicId)).length
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

  const categoryStats = useMemo(() => {
    const masteryMap = getQuestionMastery()
    return categories.map((cat) => {
      const catQuestions = questions.filter((q) => q.topicId === cat.id)
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
          <div className="flex items-center justify-between mb-3">
            <h2
              id="progress-heading"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              全体の学習進捗
            </h2>
            <Link
              to="/quiz?mode=random"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="ランダム出題で学習する"
            >
              <IconShuffle className="w-3.5 h-3.5" />
              ランダム出題
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
            {/* Stats row */}
            <div className="flex items-center gap-0 divide-x divide-slate-100 mb-3">
              <div className="flex items-baseline gap-1 pr-4">
                <span className="text-xl font-black tabular-nums leading-none" style={{ color: '#9d5b8b' }}>
                  {achievedCount}
                </span>
                <span className="text-xs font-normal text-slate-400">/{totalQuestions}</span>
                <span className="text-[11px] text-slate-400 ml-1">達成</span>
              </div>
              <div className="flex items-baseline gap-1 pl-4">
                <span className="text-xl font-black tabular-nums text-amber-500 leading-none">{importantCount}</span>
                <span className="text-[11px] text-slate-400 ml-1">重要問題</span>
              </div>
            </div>
            {/* Progress bars: 4択 + 記述 の達成度（4セグメント） */}
            <div className="space-y-2">
              {(['mc', 'wr'] as const).map((mode) => {
                const m = globalMastery[mode]
                const unattempted = Math.max(0, m.total - m.consecutive - m.correct - m.incorrect)
                const pct = (n: number) => m.total > 0 ? `${(n / m.total) * 100}%` : '0%'
                return (
                  <div key={mode}>
                    <div className="text-[11px] mb-1 font-bold text-slate-500">
                      {mode === 'mc' ? '4択 達成度' : '記述 達成度'}
                    </div>
                    <div
                      className="h-2 bg-slate-100 rounded-full overflow-hidden flex"
                      role="progressbar"
                      aria-label={`${mode === 'mc' ? '4択' : '記述'} 達成度`}
                      aria-valuemin={0}
                      aria-valuemax={m.total}
                      aria-valuenow={m.consecutive + m.correct}
                    >
                      {m.consecutive > 0 && <div className="h-full bg-brand-light0 flex-shrink-0 transition-all duration-500" style={{ width: pct(m.consecutive) }} />}
                      {m.correct > 0 && <div className="h-full bg-emerald-500 flex-shrink-0 transition-all duration-500" style={{ width: pct(m.correct) }} />}
                      {m.incorrect > 0 && <div className="h-full bg-orange-400 flex-shrink-0 transition-all duration-500" style={{ width: pct(m.incorrect) }} />}
                      {unattempted > 0 && <div className="h-full bg-slate-200 flex-shrink-0" style={{ width: pct(unattempted) }} />}
                    </div>
                  </div>
                )
              })}
              {/* 凡例 */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
                {[
                  { color: 'bg-brand-light0', label: '連続正解' },
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
              {/* ラベル付き数字 */}
              <div className="text-[11px] text-slate-400 pt-0.5">
                問題数：{totalQuestions}問
                {globalMcRate !== null && (
                  <> ｜ ４択正答率 <span className="font-medium text-slate-500">{globalMcRate}%</span></>
                )}
                {globalWrRate !== null && (
                  <> ｜ 記述正答率 <span className="font-medium text-slate-500">{globalWrRate}%</span></>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== カテゴリ一覧（12分野） ===== */}
        <section aria-labelledby="categories-heading" id="categories">
          <h2
            id="categories-heading"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
          >
            カテゴリ一覧（{categories.length}分野）
          </h2>
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
