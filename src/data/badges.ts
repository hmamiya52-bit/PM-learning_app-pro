/**
 * バッジ（勲章）定義 - 全30枚（F2-P7 再設計 v1.0 / v1.2 アイコン見直し）
 *
 * 設計書: tasks/F2-P7_badge_redesign_design.md
 * - カテゴリごとに「語の系統（テーマ）」を固定し、ティア順に語感を強める。
 * - 表示ルールは Badges.tsx 側で制御（通常はブロンズ＋獲得済のみ完全表示／開発者モードで全表示）。
 * - アイコンは「名称にちなんだもの」を割当（lucide-react、BadgeMedal の ICON_MAP）。
 * - グラデーション: Tailwind bg-gradient-to-br クラス（カテゴリ内は1系統）
 * - ティア: 'bronze' | 'silver' | 'gold' | 'legendary'
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary'
export type BadgeCategory =
  | 'study'       // 学習継続（歩みの旅路）
  | 'streak'      // 連続正答（止まらぬ勢い）
  | 'coverage'    // 踏破率（領土の制覇）
  | 'written'     // 記述・習熟（研ぎ澄ます心）
  | 'category'    // カテゴリ制覇（知を統べる）
  | 'morning'     // 午前Ⅱ 公式（研鑽から実力へ）
  | 'afternoon'   // 午後Ⅰ（武人の実力）
  | 'essay'       // 午後Ⅱ 論述（不屈の意志）
  | 'complete'    // コンプリート（到達点）

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
  // ── 特別意匠の上書き（未指定なら既定。complete など一部バッジ用） ──
  /** アイコン色（hex）。既定は白 */
  iconColor?: string
  /** 枠（リング）クラスの上書き。既定は tier 既定 */
  ringClass?: string
  /** 後光グロークラスの上書き。既定は amber */
  glowClass?: string
  /** 名称テキストのクラス上書き（色・太さ）。Badges 側で適用 */
  nameClass?: string
}

export const BADGES: BadgeDefinition[] = [
  // ── 学習継続 study（3枚 / テーマ：歩みの旅路・累計解答数） ──────────────
  {
    id: 'study-1', name: '千里の道', description: '初めて問題を解いた',
    category: 'study', iconName: 'Footprints',
    gradient: 'from-green-400 to-emerald-600', shadowColor: 'shadow-emerald-500/50',
    tier: 'bronze', xpBonus: 10, condition: '問題を1問解く', conditionValue: 1,
  },
  {
    id: 'study-2', name: '地道に重ねて', description: '合計500問以上解いた',
    category: 'study', iconName: 'Layers',
    gradient: 'from-green-400 to-emerald-600', shadowColor: 'shadow-emerald-500/50',
    tier: 'silver', xpBonus: 400, condition: '合計500問解く', conditionValue: 500,
  },
  {
    id: 'study-3', name: '努力の結実', description: '合計2000問以上解いた',
    category: 'study', iconName: 'GraduationCap',
    gradient: 'from-emerald-400 to-green-700', shadowColor: 'shadow-green-600/50',
    tier: 'gold', xpBonus: 1500, condition: '合計2000問解く', conditionValue: 2000,
  },

  // ── 連続正答 streak（3枚 / テーマ：止まらぬ勢い・連続正解） ──────────────
  {
    id: 'streak-1', name: '快進撃', description: '5問連続正解',
    category: 'streak', iconName: 'Zap',
    gradient: 'from-amber-400 to-orange-500', shadowColor: 'shadow-orange-500/50',
    tier: 'bronze', xpBonus: 50, condition: '5問連続正解', conditionValue: 5,
  },
  {
    id: 'streak-2', name: '破竹の勢い', description: '30問連続正解',
    category: 'streak', iconName: 'Flame',
    gradient: 'from-yellow-400 to-orange-600', shadowColor: 'shadow-orange-600/60',
    tier: 'gold', xpBonus: 800, condition: '30問連続正解', conditionValue: 30,
  },
  {
    id: 'streak-3', name: '一気呵成', description: '75問連続正解',
    category: 'streak', iconName: 'Tornado',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500', shadowColor: 'shadow-amber-500/60',
    tier: 'legendary', xpBonus: 3000, condition: '75問連続正解', conditionValue: 75,
  },

  // ── 踏破率 coverage（3枚 / テーマ：領土の制覇・全問の正解到達率） ──────────
  {
    id: 'coverage-1', name: '地固め', description: '全問題の25%を正解',
    category: 'coverage', iconName: 'Hammer',
    gradient: 'from-cyan-400 to-teal-600', shadowColor: 'shadow-teal-500/50',
    tier: 'bronze', xpBonus: 250, condition: '全問題の25%正解', conditionValue: 25,
  },
  {
    id: 'coverage-2', name: '掌握', description: '全問題の50%を正解',
    category: 'coverage', iconName: 'Hand',
    gradient: 'from-cyan-500 to-teal-600', shadowColor: 'shadow-teal-500/50',
    tier: 'silver', xpBonus: 600, condition: '全問題の50%正解', conditionValue: 50,
  },
  {
    id: 'coverage-3', name: '全問制覇', description: '全問題を正解',
    category: 'coverage', iconName: 'GearGantt',
    gradient: 'from-teal-300 to-cyan-600', shadowColor: 'shadow-cyan-500/70',
    tier: 'legendary', xpBonus: 2000, condition: '全問題を正解', conditionValue: 100,
  },

  // ── 記述・習熟 written（2枚 / テーマ：研ぎ澄ます心・自作クイズ記述） ──────────
  {
    id: 'written-1', name: '己を信じて', description: '記述モードで初めて正解',
    category: 'written', iconName: 'PenLine',
    gradient: 'from-blue-400 to-blue-600', shadowColor: 'shadow-blue-500/50',
    tier: 'bronze', xpBonus: 50, condition: '記述モードで1問正解', conditionValue: 1,
  },
  {
    id: 'written-2', name: '明鏡止水', description: '記述モード直近20問の正答率が80%以上',
    category: 'written', iconName: 'Droplets',
    gradient: 'from-blue-500 to-blue-700', shadowColor: 'shadow-blue-600/50',
    tier: 'gold', xpBonus: 600, condition: '記述モード直近20問の正答率80%以上', conditionValue: 80,
  },

  // ── カテゴリ制覇 category（3枚 / テーマ：知を統べる・達成率80%超） ──────────
  {
    id: 'category-1', name: '開花', description: '任意のカテゴリで達成率80%超',
    category: 'category', iconName: 'Flower2',
    gradient: 'from-rose-400 to-pink-600', shadowColor: 'shadow-pink-500/50',
    tier: 'bronze', xpBonus: 300, condition: '1カテゴリ達成（達成率80%超）', conditionValue: 1,
  },
  {
    id: 'category-2', name: '大局観', description: '7カテゴリで達成率80%超',
    category: 'category', iconName: 'Telescope',
    gradient: 'from-rose-400 to-pink-600', shadowColor: 'shadow-pink-500/50',
    tier: 'silver', xpBonus: 600, condition: '7カテゴリ達成（達成率80%超）', conditionValue: 7,
  },
  {
    id: 'category-3', name: '君臨', description: '全カテゴリで達成率80%超',
    category: 'category', iconName: 'CrownShield',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600', shadowColor: 'shadow-pink-600/70',
    tier: 'legendary', xpBonus: 2100, condition: '全カテゴリ達成（達成率80%超）', conditionValue: 999,
  },

  // ── 午前Ⅱ 公式 morning（4枚 / テーマ：研鑽から実力へ・公式300問） ──────────
  {
    id: 'morning-1', name: '一所懸命', description: '公式午前Ⅱで50問正解',
    category: 'morning', iconName: 'Pencil',
    gradient: 'from-sky-400 to-cyan-600', shadowColor: 'shadow-sky-500/50',
    tier: 'bronze', xpBonus: 200, condition: '公式午前Ⅱで50問正解', conditionValue: 50,
  },
  {
    id: 'morning-2', name: '勇往邁進', description: '公式午前Ⅱで150問正解',
    category: 'morning', iconName: 'Milestone',
    gradient: 'from-sky-400 to-cyan-600', shadowColor: 'shadow-sky-500/50',
    tier: 'silver', xpBonus: 500, condition: '公式午前Ⅱで150問正解', conditionValue: 150,
  },
  {
    id: 'morning-3', name: '盤石', description: '公式午前Ⅱで1年度（25問）を全問正解',
    category: 'morning', iconName: 'Mountain',
    gradient: 'from-sky-500 to-cyan-700', shadowColor: 'shadow-cyan-600/50',
    tier: 'gold', xpBonus: 1000, condition: '1年度（25問）を全問正解', conditionValue: 1,
  },
  {
    id: 'morning-4', name: '比類なき', description: '公式午前Ⅱ全300問を正解',
    category: 'morning', iconName: 'Gem',
    gradient: 'from-sky-300 via-cyan-400 to-blue-600', shadowColor: 'shadow-blue-500/60',
    tier: 'legendary', xpBonus: 3000, condition: '公式午前Ⅱ全300問を正解', conditionValue: 300,
  },

  // ── 午後Ⅰ afternoon（5枚 / テーマ：武人の実力・PM1 50点満点・時間1枚） ──────
  {
    id: 'afternoon-1', name: '勇気凛々', description: '午後Ⅰ演習を3回実施',
    category: 'afternoon', iconName: 'Swords',
    gradient: 'from-red-400 to-red-600', shadowColor: 'shadow-red-500/50',
    tier: 'bronze', xpBonus: 300, condition: '午後Ⅰ演習を3回実施', conditionValue: 3,
  },
  {
    id: 'afternoon-2', name: '実力定着', description: '午後Ⅰで40点以上を10回取得',
    category: 'afternoon', iconName: 'BadgeCheck',
    gradient: 'from-red-400 to-red-600', shadowColor: 'shadow-red-500/50',
    tier: 'gold', xpBonus: 1500, condition: '午後Ⅰで40点以上を10回取得', conditionValue: 10,
  },
  {
    id: 'afternoon-3', name: '地力十分', description: '午後Ⅰで45点以上を5回取得',
    category: 'afternoon', iconName: 'Dumbbell',
    gradient: 'from-red-500 to-red-700', shadowColor: 'shadow-red-600/50',
    tier: 'gold', xpBonus: 1500, condition: '午後Ⅰで45点以上を5回取得', conditionValue: 5,
  },
  {
    id: 'afternoon-4', name: '威風堂々', description: '全午後Ⅰ問題で6割以上を取得（午後Ⅰ30点）',
    category: 'afternoon', iconName: 'TrophyLaurel',
    gradient: 'from-orange-400 via-red-500 to-rose-700', shadowColor: 'shadow-red-600/60',
    tier: 'legendary', xpBonus: 3000, condition: '全午後Ⅰ問題で6割以上を取得（午後Ⅰ30点）', conditionValue: 0,
  },
  {
    id: 'afternoon-time', name: '常在戦場', description: '午後Ⅰの累計学習時間が20時間',
    category: 'afternoon', iconName: 'Tent',
    gradient: 'from-red-400 to-red-600', shadowColor: 'shadow-red-500/50',
    tier: 'gold', xpBonus: 1500, condition: '午後Ⅰの累計学習時間20時間', conditionValue: 20,
  },

  // ── 午後Ⅱ 論述 essay（6枚 / テーマ：不屈の意志・量/質/時間） ──────────────
  {
    id: 'essay-1', name: '熱情', description: '論述を初めて書き上げた',
    category: 'essay', iconName: 'Heart',
    gradient: 'from-indigo-400 to-violet-600', shadowColor: 'shadow-indigo-500/50',
    tier: 'bronze', xpBonus: 150, condition: '論述を1本書き上げる', conditionValue: 1,
  },
  {
    id: 'essay-2', name: '意気衝天', description: '論述で初めてA評価（自己評価）',
    category: 'essay', iconName: 'Rocket',
    gradient: 'from-indigo-400 to-violet-600', shadowColor: 'shadow-indigo-500/50',
    tier: 'bronze', xpBonus: 250, condition: '自己評価Aの論述を1回', conditionValue: 1,
  },
  {
    id: 'essay-3', name: '一心不乱', description: '自己評価Aの論述が5回',
    category: 'essay', iconName: 'Focus',
    gradient: 'from-indigo-400 to-purple-600', shadowColor: 'shadow-purple-500/50',
    tier: 'silver', xpBonus: 700, condition: '自己評価Aの論述を5回', conditionValue: 5,
  },
  {
    id: 'essay-4', name: '強者の証', description: '自己評価Aの論述が15回',
    category: 'essay', iconName: 'Medal',
    gradient: 'from-indigo-500 to-purple-700', shadowColor: 'shadow-purple-600/60',
    tier: 'gold', xpBonus: 1500, condition: '自己評価Aの論述を15回', conditionValue: 15,
  },
  {
    id: 'essay-time', name: '鋼の意志', description: '午後Ⅱの累計学習時間が30時間',
    category: 'essay', iconName: 'Anchor',
    gradient: 'from-indigo-400 to-violet-600', shadowColor: 'shadow-indigo-500/50',
    tier: 'gold', xpBonus: 1500, condition: '午後Ⅱの累計学習時間30時間', conditionValue: 30,
  },
  {
    id: 'essay-5', name: '不退転', description: '全論述問題を書き上げた',
    category: 'essay', iconName: 'SummitFlag',
    gradient: 'from-violet-400 via-fuchsia-500 to-purple-700', shadowColor: 'shadow-fuchsia-500/60',
    tier: 'legendary', xpBonus: 3000, condition: '全論述問題を書き上げる', conditionValue: 0,
  },

  // ── コンプリート complete（1枚 / テーマ：到達点） ──────────────────────────
  {
    id: 'complete-1', name: 'プロジェクトマネージャ', displayName: 'プロジェクト\nマネージャ',
    description: '他の全ての勲章を獲得',
    category: 'complete', iconName: 'PmCrest',
    gradient: 'from-yellow-200 via-amber-400 to-yellow-600', shadowColor: 'shadow-brand/70',
    tier: 'legendary', xpBonus: 10000, condition: '他の全ての勲章を獲得', conditionValue: 29,
    iconColor: '#e5e7eb', ringClass: 'ring-4 ring-slate-200/90', glowClass: 'bg-brand/45', nameClass: 'text-brand font-bold',
  },
]

/** カテゴリ名（日本語） */
export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  study: '学習継続',
  streak: '連続正答',
  coverage: '踏破率',
  written: '記述・習熟',
  category: 'カテゴリ制覇',
  morning: '午前Ⅱ 公式',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ 論述',
  complete: 'コンプリート',
}

/** カテゴリ順序 */
export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  'study', 'streak', 'coverage', 'written', 'category', 'morning', 'afternoon', 'essay', 'complete',
]
