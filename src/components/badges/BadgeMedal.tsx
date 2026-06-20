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

/** カスタム紋章（lucide 非依存）。iconName で参照 */
const CUSTOM_EMBLEMS: Record<string, (props: { color: string }) => ReactElement> = {
  PmCrest: PmCrestEmblem,
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
