import {
  Sprout, BookOpen, BookMarked, Library, GraduationCap,
  Zap, Flame, TrendingUp, Sparkles, Crown,
  PenLine, FileEdit, BookText, Trophy,
  Map, Compass, Target, Flag, CheckCircle, Medal,
  BarChart2, Star, Gem,
  FolderCheck, Folders, LayoutGrid, Network,
  Award, Lock,
  Feather, PenTool, ScrollText, Clock,
  Footprints, Layers, Tornado, Hammer, Hand, Castle, Droplets, Flower2, Telescope,
  Pencil, Milestone, Mountain, Swords, BadgeCheck, Dumbbell, Tent, Heart, Rocket, Focus, Anchor,
  Briefcase,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactElement } from 'react'
import type { BadgeDefinition, BadgeTier } from '../../data/badges'

/** lucide-react アイコン名 → コンポーネントのマップ */
const ICON_MAP: Record<string, LucideIcon> = {
  Sprout, BookOpen, BookMarked, Library, GraduationCap,
  Zap, Flame, TrendingUp, Sparkles, Crown,
  PenLine, FileEdit, BookText, Trophy,
  Map, Compass, Target, Flag, CheckCircle, Medal,
  BarChart2, Star, Gem,
  FolderCheck, Folders, LayoutGrid, Network,
  Award, Lock,
  Feather, PenTool, ScrollText, Clock,
  Footprints, Layers, Tornado, Hammer, Hand, Castle, Droplets, Flower2, Telescope,
  Pencil, Milestone, Mountain, Swords, BadgeCheck, Dumbbell, Tent, Heart, Rocket, Focus, Anchor,
  Briefcase,
}

/** ティア別のリング（枠）スタイル */
const TIER_RING: Record<BadgeTier, string> = {
  bronze: 'ring-2 ring-amber-700/60',
  silver: 'ring-2 ring-slate-400/70',
  gold: 'ring-2 ring-yellow-400/80',
  legendary: 'ring-4 ring-yellow-300/90',
}

/** ティア別のサイズ感（アイコン内側） */
const TIER_ICON_SIZE: Record<BadgeTier, number> = {
  bronze: 22,
  silver: 24,
  gold: 26,
  legendary: 28,
}

interface Props {
  badge: BadgeDefinition
  unlocked?: boolean
  /** 'sm' | 'md' | 'lg' — バッジ円の大きさ */
  size?: 'sm' | 'md' | 'lg'
  /** クリックハンドラ */
  onClick?: () => void
  ariaLabel?: string
}

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
}

const SIZE_ICON: Record<'sm' | 'md' | 'lg', number> = {
  sm: 22,
  md: 30,
  lg: 38,
}

/** 4 点星のきらめき */
function Spark({ className, size }: { className?: string; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  )
}

/** gold / legendary の豪華装飾＝放射状の光芒 */
function Sunburst({ tier, unlocked }: { tier: BadgeTier; unlocked: boolean }) {
  const rays = tier === 'legendary' ? 16 : 12
  const color = unlocked
    ? (tier === 'legendary' ? '#fde047' : '#fbbf24')
    : '#cbd5e1'
  const items = Array.from({ length: rays }, (_, i) => {
    const angle = (360 / rays) * i
    const long = i % 2 === 0
    return (
      <rect
        key={i}
        x="49.2"
        y={long ? 1 : 6}
        width="1.6"
        height={long ? 14 : 9}
        rx="0.8"
        fill={color}
        transform={`rotate(${angle} 50 50)`}
        opacity={unlocked ? 0.9 : 0.4}
      />
    )
  })
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
      {items}
    </svg>
  )
}

/** プロジェクトマネージャ専用の豪華紋章（月桂冠＋PM＋星＋リボン／プラチナ×ゴールド） */
function PmCrestEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  const edge = '#a8631f'
  const leaves: Array<[number, number, number]> = [
    [24, 52, 60], [18, 47, 50], [14.5, 41, 38], [13, 34, 25], [13.5, 27, 12], [15.5, 21, 0], [18.5, 16, -12], [22.5, 12.5, -24],
    [40, 52, -60], [46, 47, -50], [49.5, 41, -38], [51, 34, -25], [50.5, 27, -12], [48.5, 21, 0], [45.5, 16, 12], [41.5, 12.5, 24],
  ]
  const berries: Array<[number, number]> = [[16.5, 44.5], [14.5, 30.5], [17, 18.5], [47.5, 44.5], [49.5, 30.5], [47, 18.5]]
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(120,53,15,0.55))' }}>
      <path d="M32 55 C20 53 13 44 13.5 30 C13.8 22 17 17 22 13" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M32 55 C44 53 51 44 50.5 30 C50.2 22 47 17 42 13" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <g fill={color}>
        {leaves.map(([cx, cy, r], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="2.7" ry="4.6" transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
      </g>
      <g fill={gold} stroke={edge} strokeWidth="0.5">
        {berries.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.4" />)}
      </g>
      <g fill={gold} stroke={edge} strokeWidth="0.8" strokeLinejoin="round">
        <path d="M32 53 L26.5 50.5 L26.5 55.7 Z" />
        <path d="M32 53 L37.5 50.5 L37.5 55.7 Z" />
        <circle cx="32" cy="53" r="1.9" />
      </g>
      <path
        d="M32 3.5 L33.76 8.57 L39.13 8.68 L34.85 11.93 L36.41 17.07 L32 14 L27.59 17.07 L29.15 11.93 L24.87 8.68 L30.24 8.57 Z"
        fill={gold} stroke={color} strokeWidth="1.2" strokeLinejoin="round"
      />
      <text x="32" y="41" textAnchor="middle" fontSize="17" fontWeight="700" fill={color} fontFamily="inherit" letterSpacing="0.5">PM</text>
    </svg>
  )
}

/** 王冠＋盾＋チェック（統率の紋章）。main＝color、差し色＝ゴールド */
function CrownShieldEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  const edge = '#a8631f'
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.35))' }}>
      <path d="M19 19 L16 9 L23 13 L32 6 L41 13 L48 9 L45 19 Z" fill={gold} stroke={edge} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="16" cy="7.5" r="1.7" fill={gold} stroke={edge} strokeWidth="0.6" />
      <circle cx="32" cy="4" r="1.9" fill={gold} stroke={edge} strokeWidth="0.6" />
      <circle cx="48" cy="7.5" r="1.7" fill={gold} stroke={edge} strokeWidth="0.6" />
      <path d="M18 22 L32 18 L46 22 V37 C46 47 39 53 32 56.5 C25 53 18 47 18 37 Z" fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M25 36 l5 5 l10 -12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** トロフィー＋星＋月桂（覇者の紋章）。main＝color、差し色＝ゴールド */
function TrophyLaurelEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.35))' }}>
      <path d="M32 4 L34 11 L41.5 11.2 L35.6 15.7 L37.7 22.8 L32 18.5 L26.3 22.8 L28.4 15.7 L22.5 11.2 L30 11 Z" fill={gold} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <path d="M21 19 H43 V26 C43 34 38 38 32 38 C26 38 21 34 21 26 Z" fill="none" stroke={color} strokeWidth="2.4" />
      <path d="M21 21 H15 V26 C15 30 18 32 21 32" fill="none" stroke={color} strokeWidth="2" />
      <path d="M43 21 H49 V26 C49 30 46 32 43 32" fill="none" stroke={color} strokeWidth="2" />
      <path d="M32 38 V45 M23 50 H41 M27 45 H37" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <g fill={color}>
        <ellipse cx="22.5" cy="53" rx="2" ry="3.6" transform="rotate(42 22.5 53)" />
        <ellipse cx="27" cy="55.5" rx="2" ry="3.6" transform="rotate(20 27 55.5)" />
        <ellipse cx="41.5" cy="53" rx="2" ry="3.6" transform="rotate(-42 41.5 53)" />
        <ellipse cx="37" cy="55.5" rx="2" ry="3.6" transform="rotate(-20 37 55.5)" />
      </g>
    </svg>
  )
}

/** 歯車フレーム＋ガント（PM工程の制覇）。歯車＝ゴールド、ガント＝color */
function GearGanttEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  const edge = '#a8631f'
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.4))' }}>
      <g fill={gold} stroke={edge} strokeWidth="0.4">
        {teeth.map((a) => <rect key={a} x="29.5" y="3" width="5" height="8" rx="1.4" transform={`rotate(${a} 32 32)`} />)}
      </g>
      <circle cx="32" cy="32" r="23" fill="none" stroke={gold} strokeWidth="3.4" />
      <path d="M20 21 V44 H45" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <g fill={color}>
        <rect x="24" y="24" width="13" height="4" rx="2" />
        <rect x="24" y="31" width="18" height="4" rx="2" />
        <rect x="24" y="38" width="9" height="4" rx="2" />
      </g>
    </svg>
  )
}

/** 不退転＝背水の陣（断崖の縁に旗を突き立て、崖下に水面）。旗＝ゴールド、崖/水/竿＝color */
function CliffFlagEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.4))' }}>
      {/* 背水（崖下の水面） */}
      <path d="M7 53 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M7 57 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* 断崖（左は斜面、右は切り立った崖＝退路なし） */}
      <path d="M11 57 C11 49 13 43 17 40 L21 36 L23 31 L31 28 L33 28 L34.5 37 L32 45 L34 57 Z" fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16 50 L25 48 M15 44 L22 42" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M33 33 L31 41" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      {/* 崖の縁に突き立てた旗竿 */}
      <path d="M33 28 V7" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="33" cy="5.6" r="2.3" fill={gold} stroke={color} strokeWidth="1" />
      {/* 崖下へ翻る軍旗 */}
      <path d="M35 8.5 L54 11 Q49 15.5 54 20 L35 21.7 Z" fill={gold} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M44 11.5 l1 2.6 2.8 .2 -2.1 1.8 .7 2.7 -2.4-1.5 -2.4 1.5 .7-2.7 -2.1-1.8 2.8-.2 Z" fill={color} />
    </svg>
  )
}

/** 一気呵成＝一息に駆け抜ける彗星（流星）。核＝ゴールド、尾＝color */
function CometEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.4))' }}>
      <path d="M40 24 C31 30 22 38 12 48" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.95" />
      <path d="M39 20 C31 25 24 32 15 42" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
      <path d="M42 30 C34 36 27 42 19 51" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M42 11.5 L44.47 18.6 L51.98 18.76 L45.99 23.3 L48.17 30.49 L42 26.2 L35.83 30.49 L38.01 23.3 L32.02 18.76 L39.53 18.6 Z" fill={gold} stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="13" cy="49" r="1.5" fill={color} />
    </svg>
  )
}

/** 比類なき＝多面カットの大宝玉（唯一無二）。宝玉＝color、きらめき＝ゴールド */
function DiamondEmblem({ color }: { color: string }): ReactElement {
  const gold = '#fde68a'
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 0.6px rgba(0,0,0,0.4))' }}>
      <path d="M23 19 L41 19 L48 28 L32 47 L16 28 Z" fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16 28 L48 28" fill="none" stroke={color} strokeWidth="1.3" />
      <path d="M23 19 L28 28 L32 47 M41 19 L36 28 L32 47 M28 28 L36 28" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M45 12 l1.1 2.8 3 .3 -2.2 2 .7 2.9 -2.6-1.6 -2.6 1.6 .7-2.9 -2.2-2 3-.3 Z" fill={gold} />
      <circle cx="18" cy="15" r="1.3" fill={gold} />
    </svg>
  )
}

/** カスタム紋章（lucide 非依存）。iconName で参照 */
const CUSTOM_EMBLEMS: Record<string, (props: { color: string }) => ReactElement> = {
  PmCrest: PmCrestEmblem,
  CrownShield: CrownShieldEmblem,
  TrophyLaurel: TrophyLaurelEmblem,
  GearGantt: GearGanttEmblem,
  CliffFlag: CliffFlagEmblem,
  Comet: CometEmblem,
  Diamond: DiamondEmblem,
}

export default function BadgeMedal({ badge, unlocked = false, size = 'md', onClick, ariaLabel }: Props) {
  const IconComponent = ICON_MAP[badge.iconName] ?? Award
  const CustomEmblem = CUSTOM_EMBLEMS[badge.iconName]
  const iconSize = SIZE_ICON[size] ?? TIER_ICON_SIZE[badge.tier]
  const isRich = badge.tier === 'gold' || badge.tier === 'legendary'
  const isLegendary = badge.tier === 'legendary'

  const circleClass = [
    'relative flex items-center justify-center rounded-full overflow-hidden',
    SIZE_CLASS[size],
    unlocked
      ? `bg-gradient-to-br ${badge.gradient} ${badge.shadowColor} ${isLegendary ? 'shadow-xl' : 'shadow-lg'}`
      : 'bg-gradient-to-br from-slate-300 to-slate-500',
    unlocked ? (badge.ringClass ?? TIER_RING[badge.tier]) : 'ring-2 ring-slate-400/30',
    onClick ? 'transition-transform active:scale-95 hover:scale-105' : '',
  ].filter(Boolean).join(' ')

  const sparkSize = size === 'lg' ? 11 : size === 'md' ? 9 : 7

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 後光（legendary 解放時のグロー） */}
      {isLegendary && unlocked && (
        <div className={`absolute -inset-1 rounded-full ${badge.glowClass ?? 'bg-amber-300/40'} blur-md pointer-events-none animate-pulse`} aria-hidden="true" />
      )}
      {/* 放射状の光芒（gold / legendary） */}
      {isRich && (
        <div className={`absolute pointer-events-none ${size === 'lg' ? '-inset-2.5' : size === 'md' ? '-inset-2' : '-inset-1.5'}`}>
          <Sunburst tier={badge.tier} unlocked={unlocked} />
        </div>
      )}

      <button
        type="button"
        className={circleClass}
        onClick={onClick}
        aria-label={ariaLabel ?? badge.name}
        disabled={!onClick}
      >
        {/* メダルの打刻感（内縁）＋上部の金属光沢 */}
        {unlocked && (
          <>
            <span
              className={`absolute rounded-full pointer-events-none ${isRich ? 'inset-[11%] ring-1 ring-white/45' : 'inset-[13%] ring-1 ring-white/20'}`}
              aria-hidden="true"
            />
            <span className="absolute left-[18%] top-[12%] h-[32%] w-[36%] rounded-full bg-white/45 blur-[3px] pointer-events-none" aria-hidden="true" />
          </>
        )}

        {unlocked ? (
          CustomEmblem ? (
            <span className="relative z-10 flex items-center justify-center" style={{ width: '88%', height: '88%' }}>
              <CustomEmblem color={badge.iconColor ?? 'white'} />
            </span>
          ) : (
            <IconComponent
              size={iconSize}
              color={badge.iconColor ?? 'white'}
              strokeWidth={2.25}
              className="relative z-10"
              style={{ filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,0.4))' }}
            />
          )
        ) : (
          <>
            {/* ロック時: アイコンをうっすら + 錠前オーバーレイ */}
            <IconComponent
              size={iconSize}
              color="white"
              strokeWidth={1.5}
              className="opacity-25"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <Lock size={iconSize * 0.55} color="white" strokeWidth={2.5} className="opacity-70" />
            </span>
          </>
        )}

        {/* きらめき（gold / legendary 解放時） */}
        {isRich && unlocked && (
          <>
            <Spark className="absolute right-1 top-1 text-white/90 z-10" size={sparkSize} />
            {isLegendary && (
              <Spark className="absolute bottom-1 left-1 text-amber-100 z-10" size={sparkSize - 2} />
            )}
          </>
        )}
      </button>
    </div>
  )
}
