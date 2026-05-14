import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadGamification } from '../../lib/gamification'
import { getLevelFromXp, getNextLevel } from '../../data/levels'
import { BADGES } from '../../data/badges'

export default function LevelWidget() {
  const state = useMemo(() => loadGamification(), [])
  const allBadgesUnlocked = state.unlockedBadgeIds.length >= BADGES.length
  const currentLv = getLevelFromXp(state.xp, allBadgesUnlocked)
  const nextLv = getNextLevel(currentLv.level)

  const progressPct = nextLv
    ? ((state.xp - currentLv.xpRequired) / (nextLv.xpRequired - currentLv.xpRequired)) * 100
    : 100

  const unlockedCount = state.unlockedBadgeIds.length
  const totalBadges = BADGES.length

  return (
    <Link
      to="/badges"
      className="block bg-gradient-to-br from-blue-900 to-indigo-800 rounded-xl p-3 text-white shadow-md hover:shadow-lg transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Lv.</span>
          <span className="text-lg font-black">{currentLv.level}</span>
          <span className="text-sm font-bold text-blue-100">{currentLv.title}</span>
        </div>
        <div className="flex items-center gap-3 text-right">
          <span className="text-[10px] text-blue-300">
            勲章 <span className="text-sm font-black text-white">{unlockedCount}</span>
            <span className="text-blue-300"> / {totalBadges}</span>
          </span>
          <span className="text-[10px] text-blue-300">
            {state.xp.toLocaleString()} XP
            {nextLv && <span className="text-blue-400"> / {nextLv.xpRequired.toLocaleString()}</span>}
          </span>
        </div>
      </div>

      {/* XP バー */}
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>
    </Link>
  )
}
