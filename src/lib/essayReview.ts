import type { EssaySelfReview } from '../types'

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

export function formatRecommendedChars(range: { min: number; max: number }): string {
  return range.min > 0 ? `${range.min}〜${range.max}字` : `${range.max}字以内`
}
