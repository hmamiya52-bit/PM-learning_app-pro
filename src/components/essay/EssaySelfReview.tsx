/**
 * 自己評価（5項目×5段階ラジオ）
 *
 * 設計書 v0.15 §2.6 line 1255 / basic_design §6.5.4。
 * - 題意適合 (relevance)
 * - 構造 (structure)
 * - 具体性 (concreteness)
 * - 一貫性 (consistency)
 * - 字数達成 (charCount)
 */

import type { EssaySelfReview } from '../../types'

interface Props {
  value: EssaySelfReview
  onChange: (next: EssaySelfReview) => void
}

type ReviewKey = keyof EssaySelfReview
type ReviewScore = 1 | 2 | 3 | 4 | 5

const ITEMS: { key: ReviewKey; label: string; hint: string }[] = [
  { key: 'relevance',    label: '題意適合', hint: '設問にきちんと答えているか' },
  { key: 'structure',    label: '構造',     hint: '導入・本文・結論の流れが明確か' },
  { key: 'concreteness', label: '具体性',   hint: '事例・数値が具体的か' },
  { key: 'consistency',  label: '一貫性',   hint: '主張がブレずに通っているか' },
  { key: 'charCount',    label: '字数達成', hint: '推奨字数を満たしているか' },
]

const SCORES: ReviewScore[] = [1, 2, 3, 4, 5]

export default function EssaySelfReview({ value, onChange }: Props) {
  const handleChange = (key: ReviewKey, score: ReviewScore) => {
    onChange({ ...value, [key]: score })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
      {ITEMS.map((item) => (
        <div key={item.key} className="px-4 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
              <p className="text-[11px] text-slate-400">{item.hint}</p>
            </div>
            <span className="text-xs text-brand-dark font-bold tabular-nums">
              {value[item.key]} / 5
            </span>
          </div>
          <div className="flex gap-1.5" role="radiogroup" aria-label={item.label}>
            {SCORES.map((s) => {
              const selected = value[item.key] === s
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleChange(item.key, s)}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-colors ${
                    selected
                      ? 'bg-brand text-white'
                      : 'border border-slate-200 text-slate-500 hover:border-brand hover:text-brand'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/** デフォルト値（採点開始時の初期値、全項目3） */
export function defaultSelfReview(): EssaySelfReview {
  return {
    relevance: 3,
    structure: 3,
    concreteness: 3,
    consistency: 3,
    charCount: 3,
  }
}
