import {
  Sprout, BookOpen, BookMarked, Library, GraduationCap,
  Zap, Flame, TrendingUp, Sparkles, Crown,
  PenLine, FileEdit, BookText, Trophy,
  Map, Compass, Target, Flag, CheckCircle, Medal,
  BarChart2, Star, Gem,
  FolderCheck, Folders, LayoutGrid, Network,
  Award, Lock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
  sm: 18,
  md: 24,
  lg: 30,
}

export default function BadgeMedal({ badge, unlocked = false, size = 'md', onClick, ariaLabel }: Props) {
  const IconComponent = ICON_MAP[badge.iconName] ?? Award
  const iconSize = SIZE_ICON[size] ?? TIER_ICON_SIZE[badge.tier]

  const circleClass = [
    'relative flex items-center justify-center rounded-full',
    SIZE_CLASS[size],
    unlocked
      ? `bg-gradient-to-br ${badge.gradient} shadow-lg ${badge.shadowColor}`
      : 'bg-gradient-to-br from-slate-300 to-slate-500',
    unlocked ? TIER_RING[badge.tier] : 'ring-2 ring-slate-400/30',
    onClick ? 'cursor-pointer transition-transform active:scale-95 hover:scale-105' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={circleClass}
      onClick={onClick}
      aria-label={ariaLabel ?? badge.name}
      disabled={!onClick}
    >
      {unlocked ? (
        <IconComponent size={iconSize} color="white" strokeWidth={1.8} />
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
    </button>
  )
}
