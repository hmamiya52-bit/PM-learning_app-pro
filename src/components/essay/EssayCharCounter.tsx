/**
 * 文字数カウンター（推奨レンジに応じて色変化）
 *
 * 設計書 v0.15 §2.6 line 1254 / basic_design §6.5.3。
 * - 0〜min*0.5: slate（未着手寄り）
 * - min*0.5〜min: amber（不足）
 * - min〜max: emerald（適正）
 * - max 超過: red（オーバー）
 */

interface Props {
  value: number
  min: number
  max: number
}

export default function EssayCharCounter({ value, min, max }: Props) {
  let colorClass = 'text-slate-400'
  let label = '未着手'
  const rangeLabel = min > 0 ? `${min}〜${max}字` : `${max}字以内`

  if (value > max) {
    colorClass = 'text-red-500'
    label = `${value - max}字オーバー`
  } else if (min <= 0 && value > 0) {
    colorClass = 'text-emerald-600'
    label = '上限内'
  } else if (value >= min) {
    colorClass = 'text-emerald-600'
    label = '適正範囲'
  } else if (value >= min * 0.5) {
    colorClass = 'text-amber-500'
    label = `あと約${Math.max(0, min - value)}字`
  } else if (value > 0) {
    colorClass = 'text-slate-500'
    label = `あと約${Math.max(0, min - value)}字`
  }

  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className={`font-bold tabular-nums ${colorClass}`}>
        {value}字
        <span className="text-slate-300 font-normal ml-1.5">／ 推奨 {rangeLabel}</span>
      </span>
      <span className={`${colorClass} font-medium`}>{label}</span>
    </div>
  )
}
