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

/**
 * 論述答案の字数カウント。段落区切りの改行（\n）は IPA の原稿用紙では字数に
 * 算入されないため除外する（全角1字下げ U+3000 は1字として数える）。
 * 参考答案の字数表示と利用者答案のカウンタの双方で共通に用い、数え方を揃える。
 */
export function countEssayChars(s: string | undefined): number {
  return (s ?? '').replace(/\n/g, '').length
}
