/**
 * バッジ（勲章）定義 - 全30枚
 * アイコン: lucide-react の名前で管理
 * グラデーション: Tailwind bg-gradient-to-br クラス
 * ティア: 'bronze' | 'silver' | 'gold' | 'legendary'
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary'
export type BadgeCategory =
  | 'study'       // 学習継続
  | 'streak'      // 連続正答
  | 'written'     // 記述モード
  | 'coverage'    // 踏破率
  | 'mastery'     // 習熟
  | 'category'    // カテゴリ制覇
  | 'afternoon'   // 午後問題演習
  | 'complete'    // コンプリート

export interface BadgeDefinition {
  id: string
  name: string
  /** 表示専用の名前（改行を含めたい場合に使用）。未指定なら name を使用 */
  displayName?: string
  description: string
  category: BadgeCategory
  /** lucide-react のコンポーネント名 */
  iconName: string
  /** Tailwind gradient classes (bg-gradient-to-br from-X to-Y) */
  gradient: string
  /** シャドウ色クラス (shadow-{color}) */
  shadowColor: string
  tier: BadgeTier
  /** 解放時 XP ボーナス */
  xpBonus: number
  /** 解放条件の説明 */
  condition: string
  /** 解放条件の数値（比較用） */
  conditionValue: number
  /** 解放前は条件を「？？？」と隠す */
  hideConditionUntilUnlock?: boolean
}

export const BADGES: BadgeDefinition[] = [
  // ── 🌱 学習継続 (5枚) ────────────────────────────────────────
  {
    id: 'study-1',
    name: 'ファーストステップ',
    description: '初めて問題を解いた',
    category: 'study',
    iconName: 'Sprout',
    gradient: 'from-green-400 to-emerald-600',
    shadowColor: 'shadow-emerald-500/50',
    tier: 'bronze',
    xpBonus: 10,
    condition: '問題を1問解く',
    conditionValue: 1,
  },
  {
    id: 'study-2',
    name: 'コツコツ学習',
    description: '合計50問以上解いた',
    category: 'study',
    iconName: 'BookOpen',
    gradient: 'from-green-400 to-emerald-600',
    shadowColor: 'shadow-emerald-500/50',
    tier: 'bronze',
    xpBonus: 100,
    condition: '合計50問解く',
    conditionValue: 50,
  },
  {
    id: 'study-3',
    name: '学習の習慣',
    description: '合計200問以上解いた',
    category: 'study',
    iconName: 'BookMarked',
    gradient: 'from-green-400 to-emerald-600',
    shadowColor: 'shadow-emerald-500/50',
    tier: 'silver',
    xpBonus: 300,
    condition: '合計200問解く',
    conditionValue: 200,
  },
  {
    id: 'study-4',
    name: '勉強家',
    description: '合計500問以上解いた',
    category: 'study',
    iconName: 'Library',
    gradient: 'from-green-500 to-emerald-700',
    shadowColor: 'shadow-emerald-600/50',
    tier: 'gold',
    xpBonus: 500,
    condition: '合計500問解く',
    conditionValue: 500,
  },
  {
    id: 'study-5',
    name: '無我夢中',
    description: '合計1000問以上解いた',
    category: 'study',
    iconName: 'GraduationCap',
    gradient: 'from-emerald-400 to-green-700',
    shadowColor: 'shadow-green-600/50',
    tier: 'gold',
    xpBonus: 1000,
    condition: '合計1000問解く',
    conditionValue: 1000,
    hideConditionUntilUnlock: true,
  },

  // ── ⚡ 連続正答 (4枚) ────────────────────────────────────────
  {
    id: 'streak-2',
    name: '快進撃',
    description: '5問連続正解',
    category: 'streak',
    iconName: 'Flame',
    gradient: 'from-amber-400 to-orange-500',
    shadowColor: 'shadow-orange-500/50',
    tier: 'bronze',
    xpBonus: 50,
    condition: '5問連続正解',
    conditionValue: 5,
  },
  {
    id: 'streak-3',
    name: '絶好調',
    description: '10問連続正解',
    category: 'streak',
    iconName: 'TrendingUp',
    gradient: 'from-amber-400 to-orange-500',
    shadowColor: 'shadow-orange-500/50',
    tier: 'silver',
    xpBonus: 100,
    condition: '10問連続正解',
    conditionValue: 10,
  },
  {
    id: 'streak-5',
    name: 'フルコンボ',
    description: '30問連続正解',
    category: 'streak',
    iconName: 'Sparkles',
    gradient: 'from-yellow-400 to-orange-600',
    shadowColor: 'shadow-orange-600/60',
    tier: 'gold',
    xpBonus: 800,
    condition: '30問連続正解',
    conditionValue: 30,
  },
  {
    id: 'streak-6',
    name: '十全十美',
    description: '75問連続正解',
    category: 'streak',
    iconName: 'Crown',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    shadowColor: 'shadow-amber-500/60',
    tier: 'legendary',
    xpBonus: 3000,
    condition: '75問連続正解',
    conditionValue: 75,
    hideConditionUntilUnlock: true,
  },

  // ── ✍️ 記述モード (4枚) ────────────────────────────────────────
  {
    id: 'written-1',
    name: 'ペンを握る',
    description: '記述モードで初めて正解',
    category: 'written',
    iconName: 'PenLine',
    gradient: 'from-sky-400 to-brand-dark',
    shadowColor: 'shadow-blue-500/50',
    tier: 'bronze',
    xpBonus: 20,
    condition: '記述モードで1問正解',
    conditionValue: 1,
  },
  {
    id: 'written-2',
    name: '記述の達人',
    description: '記述モードで20問正解',
    category: 'written',
    iconName: 'FileEdit',
    gradient: 'from-sky-400 to-brand-dark',
    shadowColor: 'shadow-blue-500/50',
    tier: 'silver',
    xpBonus: 300,
    condition: '記述モードで20問正解',
    conditionValue: 20,
  },
  {
    id: 'written-3',
    name: '記述マスター',
    description: '記述モードで100問正解',
    category: 'written',
    iconName: 'BookText',
    gradient: 'from-sky-500 to-brand-dark',
    shadowColor: 'shadow-blue-600/50',
    tier: 'gold',
    xpBonus: 600,
    condition: '記述モードで100問正解',
    conditionValue: 100,
  },
  {
    id: 'written-4',
    name: '千鍛万錬',
    description: '記述モードで全問正解（1周）',
    category: 'written',
    iconName: 'Trophy',
    gradient: 'from-brand to-indigo-600',
    shadowColor: 'shadow-indigo-500/60',
    tier: 'legendary',
    xpBonus: 1500,
    condition: '記述モードで全問正解（1周）',
    conditionValue: 0,
    hideConditionUntilUnlock: true,
  },

  // ── 📊 踏破率 (5枚) ────────────────────────────────────────
  {
    id: 'coverage-1',
    name: '探索開始',
    description: '全問題の10%を正解',
    category: 'coverage',
    iconName: 'Map',
    gradient: 'from-cyan-400 to-teal-600',
    shadowColor: 'shadow-teal-500/50',
    tier: 'bronze',
    xpBonus: 150,
    condition: '全問題の10%正解',
    conditionValue: 10,
  },
  {
    id: 'coverage-2',
    name: '着実な前進',
    description: '全問題の25%を正解',
    category: 'coverage',
    iconName: 'Compass',
    gradient: 'from-cyan-400 to-teal-600',
    shadowColor: 'shadow-teal-500/50',
    tier: 'bronze',
    xpBonus: 250,
    condition: '全問題の25%正解',
    conditionValue: 25,
  },
  {
    id: 'coverage-3',
    name: '折り返し地点',
    description: '全問題の50%を正解',
    category: 'coverage',
    iconName: 'Target',
    gradient: 'from-cyan-500 to-teal-600',
    shadowColor: 'shadow-teal-500/50',
    tier: 'silver',
    xpBonus: 500,
    condition: '全問題の50%正解',
    conditionValue: 50,
  },
  {
    id: 'coverage-4',
    name: '終盤戦',
    description: '全問題の75%を正解',
    category: 'coverage',
    iconName: 'Flag',
    gradient: 'from-cyan-500 to-teal-700',
    shadowColor: 'shadow-teal-600/50',
    tier: 'silver',
    xpBonus: 700,
    condition: '全問題の75%正解',
    conditionValue: 75,
  },
  {
    id: 'coverage-6',
    name: '初志貫徹',
    description: '全問題を正解',
    category: 'coverage',
    iconName: 'Medal',
    gradient: 'from-teal-300 to-cyan-600',
    shadowColor: 'shadow-cyan-500/70',
    tier: 'legendary',
    xpBonus: 2000,
    condition: '全問題を正解',
    conditionValue: 100,
    hideConditionUntilUnlock: true,
  },

  // ── 🏆 習熟 (3枚 / 記述モード対象) ────────────────────────────────────────
  {
    id: 'mastery-1',
    name: '正答率50%',
    description: '記述モード直近20問の正答率が50%以上',
    category: 'mastery',
    iconName: 'BarChart2',
    gradient: 'from-violet-400 to-purple-600',
    shadowColor: 'shadow-purple-500/50',
    tier: 'bronze',
    xpBonus: 200,
    condition: '記述モード直近20問の正答率50%以上',
    conditionValue: 50,
  },
  {
    id: 'mastery-2',
    name: '正答率70%',
    description: '記述モード直近20問の正答率が70%以上',
    category: 'mastery',
    iconName: 'TrendingUp',
    gradient: 'from-violet-400 to-purple-600',
    shadowColor: 'shadow-purple-500/50',
    tier: 'silver',
    xpBonus: 400,
    condition: '記述モード直近20問の正答率70%以上',
    conditionValue: 70,
  },
  {
    id: 'mastery-4',
    name: '完全無欠',
    description: '記述モード直近20問をすべて正解',
    category: 'mastery',
    iconName: 'Gem',
    gradient: 'from-fuchsia-400 to-purple-700',
    shadowColor: 'shadow-purple-600/70',
    tier: 'legendary',
    xpBonus: 1000,
    condition: '記述モード直近20問をすべて正解',
    conditionValue: 100,
  },

  // ── 📂 カテゴリ制覇 (3枚 / 達成率：連続正解状態の問題比率) ────────────────────────────────────────
  {
    id: 'category-1',
    name: 'カテゴリ初制覇',
    description: '任意のカテゴリで達成率80%超',
    category: 'category',
    iconName: 'FolderCheck',
    gradient: 'from-rose-400 to-pink-600',
    shadowColor: 'shadow-pink-500/50',
    tier: 'bronze',
    xpBonus: 300,
    condition: '1カテゴリ達成（達成率80%超）',
    conditionValue: 1,
  },
  {
    id: 'category-2',
    name: 'マルチドメイン',
    description: '7カテゴリで達成率80%超',
    category: 'category',
    iconName: 'Folders',
    gradient: 'from-rose-400 to-pink-600',
    shadowColor: 'shadow-pink-500/50',
    tier: 'silver',
    xpBonus: 600,
    condition: '7カテゴリ達成（達成率80%超）',
    conditionValue: 7,
  },
  {
    id: 'category-4',
    name: '百戦錬磨',
    description: '全カテゴリで達成率80%超',
    category: 'category',
    iconName: 'Network',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    shadowColor: 'shadow-pink-600/70',
    tier: 'legendary',
    xpBonus: 2100,
    condition: '全カテゴリ達成（達成率80%超）',
    conditionValue: 999,
    hideConditionUntilUnlock: true,
  },

  // ── 📝 午後問題演習 (5枚 / 取得前は条件を「？？？」表示) ────────────────────────────────────────
  {
    id: 'afternoon-1',
    name: '勇猛果敢',
    description: '午後問題演習を3回実施',
    category: 'afternoon',
    iconName: 'Flame',
    gradient: 'from-teal-400 to-cyan-600',
    shadowColor: 'shadow-teal-500/50',
    tier: 'bronze',
    xpBonus: 300,
    condition: '午後問題演習を3回実施',
    conditionValue: 3,
    hideConditionUntilUnlock: true,
  },
  {
    id: 'afternoon-2',
    name: '不撓不屈',
    description: '午後問題演習を30回実施',
    category: 'afternoon',
    iconName: 'BookMarked',
    gradient: 'from-teal-500 to-emerald-700',
    shadowColor: 'shadow-teal-600/60',
    tier: 'silver',
    xpBonus: 1000,
    condition: '午後問題演習を30回実施',
    conditionValue: 30,
    hideConditionUntilUnlock: true,
  },
  {
    id: 'afternoon-3',
    name: '天衣無縫',
    description: '午後Ⅰで40点以上を10回取得',
    category: 'afternoon',
    iconName: 'Star',
    gradient: 'from-brand to-indigo-600',
    shadowColor: 'shadow-blue-500/60',
    tier: 'gold',
    xpBonus: 1500,
    condition: '午後Ⅰで40点以上を10回取得',
    conditionValue: 10,
    hideConditionUntilUnlock: true,
  },
  {
    id: 'afternoon-4',
    name: '気炎万丈',
    description: '午後Ⅱで80点以上を5回取得',
    category: 'afternoon',
    iconName: 'Trophy',
    gradient: 'from-purple-400 to-fuchsia-600',
    shadowColor: 'shadow-purple-500/60',
    tier: 'gold',
    xpBonus: 2000,
    condition: '午後Ⅱで80点以上を5回取得',
    conditionValue: 5,
    hideConditionUntilUnlock: true,
  },
  {
    id: 'afternoon-5',
    name: '万里一空',
    description: '全午後問題で6割以上を取得（午後Ⅰ30点・午後Ⅱ60点）',
    category: 'afternoon',
    iconName: 'Crown',
    gradient: 'from-amber-300 via-orange-400 to-rose-500',
    shadowColor: 'shadow-orange-500/70',
    tier: 'legendary',
    xpBonus: 4000,
    condition: '全午後問題で6割以上を取得（午後Ⅰ30点・午後Ⅱ60点）',
    conditionValue: 0,
    hideConditionUntilUnlock: true,
  },

  // ── 🏅 コンプリート (1枚) ────────────────────────────────────────
  // F1-P6 ブランド適用: NW 固有名「ネットワークスペシャリスト」を PM 版に更新。
  // バッジ条件・項目構成自体は NW踏襲のまま（F2-P6 で論述系バッジ追加・条件再設計予定）。
  {
    id: 'complete-1',
    name: 'プロジェクトマネージャ',
    displayName: 'プロジェクト\nマネージャ',
    description: '全ての勲章を獲得',
    category: 'complete',
    iconName: 'Award',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    shadowColor: 'shadow-amber-400/80',
    tier: 'legendary',
    xpBonus: 10000,
    condition: '全ての勲章を獲得',
    conditionValue: 29,
  },
]

/** カテゴリ名（日本語） */
export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  study: '学習継続',
  streak: '連続正答',
  written: '記述モード',
  coverage: '踏破率',
  mastery: '習熟',
  category: 'カテゴリ制覇',
  afternoon: '午後問題演習',
  complete: 'コンプリート',
}

/** カテゴリ順序 */
export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  'study', 'streak', 'written', 'coverage', 'mastery', 'category', 'afternoon', 'complete'
]
