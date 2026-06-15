import { useMemo, useState } from 'react'
import { BADGES, BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER, type BadgeDefinition } from '../data/badges'
import BadgeMedal from '../components/badges/BadgeMedal'
import { loadGamification, getBadgeProgress, type BadgeProgress } from '../lib/gamification'
import { getDevMode } from '../lib/preferences'

const TIER_LABEL: Record<string, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
  legendary: '伝説',
}

const TIER_COLOR: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-100',
  silver: 'text-slate-600 bg-slate-200',
  gold: 'text-yellow-700 bg-yellow-100',
  legendary: 'text-orange-700 bg-orange-100',
}

function BadgeDetailModal({ badge, unlocked, devMode, progress, onClose }: {
  badge: BadgeDefinition
  unlocked: boolean
  devMode: boolean
  progress?: BadgeProgress
  onClose: () => void
}) {
  // F2-P7: 通常は「ブロンズ」か「獲得済み」のみ完全表示。開発者モードで全表示。
  const shouldHide = !devMode && badge.tier !== 'bronze' && !unlocked
  const displayName = shouldHide ? '？？？' : (badge.displayName ?? badge.name)
  const description = shouldHide ? '？？？' : badge.description
  const condition = shouldHide ? '？？？' : badge.condition
  const xpBonus = shouldHide ? '？？？' : `+${badge.xpBonus.toLocaleString()} XP`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <BadgeMedal badge={badge} unlocked={unlocked} size="lg" />
        <div className="text-center">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLOR[badge.tier]}`}>
            {TIER_LABEL[badge.tier]}
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-2 whitespace-pre-line leading-tight">
            {displayName}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {description}
          </p>
        </div>
        <div className="w-full bg-slate-50 rounded-2xl p-3 text-sm text-slate-600 text-center">
          <p className="font-medium text-slate-700 mb-1">解放条件</p>
          <p>{condition}</p>
        </div>
        {devMode && progress && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">取得進捗（開発者モード）</span>
              <span className="font-bold tabular-nums text-slate-700">
                {progress.current}/{progress.target}{progress.unit ?? ''}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${unlocked ? 'bg-emerald-500' : 'bg-brand'}`}
                style={{ width: `${progress.target > 0 ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 font-bold text-base">{xpBonus}</span>
          <span className="text-slate-400 text-sm">ボーナス</span>
        </div>
        {!unlocked && (
          <p className="text-slate-400 text-xs">まだ解放されていません</p>
        )}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm underline-offset-2 hover:underline"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

export default function Badges() {
  const [selected, setSelected] = useState<BadgeDefinition | null>(null)

  const unlockedSet = useMemo(() => {
    const state = loadGamification()
    return new Set(state.unlockedBadgeIds)
  }, [])
  const devMode = getDevMode()
  const progress = useMemo<Record<string, BadgeProgress> | null>(
    () => (devMode ? getBadgeProgress() : null),
    [devMode],
  )

  const unlockedCount = BADGES.filter((b) => unlockedSet.has(b.id)).length
  const totalXp = BADGES.filter((b) => unlockedSet.has(b.id))
    .reduce((sum, b) => sum + b.xpBonus, 0)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">勲章コレクション</h1>
        <p className="text-slate-500 text-sm mt-1">
          {unlockedCount} / {BADGES.length} 枚獲得
          <span className="ml-3 text-amber-600 font-semibold">+{totalXp.toLocaleString()} XP</span>
        </p>
        {/* 全体進捗バー */}
        <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* カテゴリ別グリッド */}
      {BADGE_CATEGORY_ORDER.map((category) => {
        const categoryBadges = BADGES.filter((b) => b.category === category)
        const catUnlocked = categoryBadges.filter((b) => unlockedSet.has(b.id)).length

        return (
          <section key={category} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                {BADGE_CATEGORY_LABELS[category]}
              </h2>
              <span className="text-xs text-slate-400">
                {catUnlocked}/{categoryBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {categoryBadges.map((badge) => {
                const unlocked = unlockedSet.has(badge.id)
                const shouldHide = !devMode && badge.tier !== 'bronze' && !unlocked
                const displayName = shouldHide ? '？？？' : (badge.displayName ?? badge.name)
                return (
                  <div key={badge.id} className="flex flex-col items-center gap-1.5">
                    <BadgeMedal
                      badge={badge}
                      unlocked={unlocked}
                      size="md"
                      onClick={() => setSelected(badge)}
                      ariaLabel={displayName}
                    />
                    <p className={`text-[10px] font-medium text-center leading-tight line-clamp-2 whitespace-pre-line ${
                      unlocked ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {displayName}
                    </p>
                    {devMode && progress?.[badge.id] && (
                      <p className={`text-[9px] tabular-nums leading-none ${unlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {progress[badge.id].current}/{progress[badge.id].target}{progress[badge.id].unit ?? ''}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* 詳細モーダル */}
      {selected && (
        <BadgeDetailModal
          badge={selected}
          unlocked={unlockedSet.has(selected.id)}
          devMode={devMode}
          progress={progress?.[selected.id]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
