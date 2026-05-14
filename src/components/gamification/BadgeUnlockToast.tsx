import { useEffect, useState } from 'react'
import BadgeMedal from '../badges/BadgeMedal'
import type { BadgeDefinition } from '../../data/badges'

interface Props {
  badges: BadgeDefinition[]
  onDone: () => void
}

export default function BadgeUnlockToast({ badges, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < badges.length - 1) {
        setIndex((i) => i + 1)
        setVisible(true)
      } else {
        onDone()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [index, badges.length, onDone])

  const badge = badges[index]
  if (!badge || !visible) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-once">
      <div className="bg-white border border-amber-200 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xs w-full">
        <BadgeMedal badge={badge} unlocked size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">勲章獲得！</p>
          <p className="text-sm font-bold text-slate-800 truncate">{badge.name}</p>
          <p className="text-xs text-amber-600 font-semibold">+{badge.xpBonus.toLocaleString()} XP ボーナス</p>
        </div>
      </div>
    </div>
  )
}
