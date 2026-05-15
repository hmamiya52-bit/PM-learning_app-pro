import { Link } from 'react-router-dom'
import type { Category } from '../types'

interface MasterySummary {
  consecutive: number
  correct: number
  incorrect: number
  total: number
}

interface CategoryCardProps {
  category: Category
  questionCount: number
  /** 4択モードの正答率。null = 未挑戦 */
  mcRate: number | null
  /** 記述モードの正答率。null = 未挑戦 */
  wrRate: number | null
  /** 4択の達成度サマリー */
  mcMastery: MasterySummary
  /** 記述の達成度サマリー */
  wrMastery: MasterySummary
  /** 最終学習日時の ISO 文字列。未学習なら空文字 */
  lastStudiedAt: string
}

// 4セグメントの達成度バー
function MasteryBar({ label, mastery }: { label: string; mastery: MasterySummary }) {
  const { consecutive, correct, incorrect, total } = mastery
  if (total === 0) return null
  const unattempted = Math.max(0, total - consecutive - correct - incorrect)
  const pct = (n: number) => `${(n / total) * 100}%`

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-bold text-slate-400 w-5 flex-shrink-0">{label}</span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden flex bg-slate-100"
        role="progressbar"
        aria-label={`${label} 達成度`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={consecutive + correct}
      >
        {consecutive > 0 && (
          <div className="h-full bg-brand-light0 flex-shrink-0" style={{ width: pct(consecutive) }} />
        )}
        {correct > 0 && (
          <div className="h-full bg-emerald-500 flex-shrink-0" style={{ width: pct(correct) }} />
        )}
        {incorrect > 0 && (
          <div className="h-full bg-orange-400 flex-shrink-0" style={{ width: pct(incorrect) }} />
        )}
        {unattempted > 0 && (
          <div className="h-full bg-slate-200 flex-shrink-0" style={{ width: pct(unattempted) }} />
        )}
      </div>
    </div>
  )
}

export default function CategoryCard({
  category,
  questionCount,
  mcRate,
  wrRate,
  mcMastery,
  wrMastery,
  lastStudiedAt: _lastStudiedAt,
}: CategoryCardProps) {
  const isIot = category.id === 'iot'
  const isEmpty = questionCount === 0

  const cardContent = (
    <>
      {/* バッジ */}
      {(isEmpty || isIot) && (
        <span className="absolute top-2 right-2">
          {isEmpty ? (
            <span className="rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 leading-tight">
              準備中
            </span>
          ) : (
            <span className="rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 leading-tight">
              R7
            </span>
          )}
        </span>
      )}

      {/* カテゴリ名 */}
      <div className={isEmpty || isIot ? 'pr-8' : 'pr-1'}>
        <p
          className={`font-semibold text-[13px] sm:text-sm leading-snug ${
            isEmpty ? 'text-slate-400' : 'text-slate-800 group-hover:text-brand-dark'
          } transition-colors`}
        >
          {category.name}
        </p>
      </div>

      {/* 達成度バー + 数字 */}
      {isEmpty ? (
        <span className="text-[11px] text-slate-300">準備中</span>
      ) : (
        <div className="space-y-1">
          <MasteryBar label="4択" mastery={mcMastery} />
          <MasteryBar label="記述" mastery={wrMastery} />
          {/* 数字テキスト行 */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 leading-none pt-0.5 flex-wrap">
            <span>全<span className="font-medium">{questionCount}</span>問</span>
            {(mcRate !== null || wrRate !== null) && (
              <>
                <span className="text-slate-200">|</span>
                <span>
                  正答率：
                  {mcRate !== null && <>4択 <span className="font-medium text-slate-500">{mcRate}%</span></>}
                  {mcRate !== null && wrRate !== null && <span className="mx-0.5">　</span>}
                  {wrRate !== null && <>記述 <span className="font-medium text-slate-500">{wrRate}%</span></>}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )

  if (isEmpty) {
    return (
      <div
        className="group relative flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
        aria-label={`${category.name}（準備中）`}
      >
        {cardContent}
      </div>
    )
  }

  const ariaLabel = (() => {
    const parts: string[] = [`${category.name}、問題数${questionCount}問`]
    parts.push(mcRate !== null ? `4択正答率${mcRate}%` : '4択未挑戦')
    parts.push(wrRate !== null ? `記述正答率${wrRate}%` : '記述未挑戦')
    return parts.join('、')
  })()

  return (
    <Link
      to={`/quiz?mode=topic&category=${category.id}`}
      className={[
        'group relative flex flex-col gap-1.5 rounded-xl border px-3 py-2.5',
        'bg-white border-slate-200 hover:border-brand hover:shadow-md',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
      ].join(' ')}
      aria-label={ariaLabel}
    >
      {cardContent}
    </Link>
  )
}
