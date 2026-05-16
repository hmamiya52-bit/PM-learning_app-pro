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

function IconSync({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0118.5 6M4.582 9H9m11 11v-5h-.581m0 0A7.5 7.5 0 015.5 18m13.919-3H15" />
    </svg>
  )
}

/**
 * 学習メニュー（6項目）— F1-P6 後の UX 整理（2回目）:
 *   削除済み:
 *     - 重要問題モード:  ModeSelect の「重要のみ」トグルで実現
 *     - 弱点克服モード:  ModeSelect の「弱点のみ」トグルで実現（F1-P6 後改修）
 *     - カテゴリ別学習:  ノートモードの動線と重複のため削除
 *     - ランダム出題:    「全体の学習進捗」セクション右上のボタンから起動
 *     - 検索:            ヘッダの検索アイコンから常時アクセス可
 *     - バッジ:          LevelWidget をクリックすると遷移
 *     - 学習履歴:        ページ下部の「学習履歴」セクションで直接表示
 *     - 設定:            ヘッダの歯車アイコンから常時アクセス可
 *
 * 試験区分の名称:
 *   - 「公式午前II問題」→「午前Ⅱ問題演習」
 *   - 「午後Ⅰ問題」→「午後Ⅰ問題演習」
 *   - 「論述トレーニング」→「午後Ⅱ問題演習」
 */
const MENU_CARDS: MenuCard[] = [
  // 1. アプリの使い方
  { to: '/how-to-use',          title: 'アプリの使い方',     description: '各学習モードの活用方法',     iconBg: 'bg-brand-light',    iconColor: 'text-brand',      icon: <IconHelp className="w-6 h-6 text-brand" /> },
  // 2. ノートモード
  { to: '/notes',               title: 'ノートモード',       description: '分野別の重要知識まとめ',     iconBg: 'bg-teal-50',        iconColor: 'text-teal-600',   icon: <IconBook className="w-6 h-6 text-teal-600" /> },
  // 3. 午前Ⅱ問題演習
  { to: '/morning',             title: '午前Ⅱ問題演習',     description: '過去問4択 出典:IPA',         iconBg: 'bg-indigo-50',      iconColor: 'text-indigo-600', icon: <IconFileText className="w-6 h-6 text-indigo-600" /> },
  // 4. 午後Ⅰ問題演習
  { to: '/afternoon',           title: '午後Ⅰ問題演習',     description: '自己採点・記録',             iconBg: 'bg-purple-50',      iconColor: 'text-purple-600', icon: <IconClipboard className="w-6 h-6 text-purple-600" /> },
  // 5. 午後Ⅱ問題演習（論述）
  { to: '/essay',               title: '午後Ⅱ問題演習',     description: '論述・自己採点',             iconBg: 'bg-pink-50',        iconColor: 'text-pink-600',   icon: <IconPen className="w-6 h-6 text-pink-600" /> },
  // 6. デバイス同期
  { to: '/sync',                title: 'デバイス同期',       description: 'QRコードで他端末へ',         iconBg: 'bg-sky-50',         iconColor: 'text-sky-600',    icon: <IconSync className="w-6 h-6 text-sky-600" /> },
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
