// 午後I 独自解説（Claude 著作）
//
// IPA 公式「解答例」(officialAnswers.ts) には解説が無いため、Claude が問題本文 PDF を
// 精読して根拠付きの独自解説を付与する。IPA 引用データ (officialAnswers.ts) とは分離し、
// 本ファイルは汚染しない。設計書: docs/afternoon_explanation_design.md §4 / detailed_design §2.7g
//
// 著作権: 本文の逐語引用は禁止。basis は位置参照＋言い換えに留める。

/** 解答行ごとの解説（officialAnswers の AnswerRow と rowKey で 1:1 対応） */
export interface AfternoonRowExplanation {
  /** `${s}|${q ?? ''}|${t ?? ''}` で officialAnswers の行と対応 */
  rowKey: string
  /** この設問が問う力点（30-60字目安） */
  point: string
  /** 本文中の根拠（位置参照＋言い換え。逐語引用しない。40-90字目安） */
  basis: string
  /** なぜこの解答例になるか（60-120字目安） */
  reasoning: string
  /** ありがちな失点・誤答パターン（難所のみ任意。40-80字目安） */
  pitfall?: string
}

/** 1問分の解説（officialAnswers の 1 OfficialAnswerSet に対応） */
export interface AfternoonExplanation {
  /** officialAnswers.id と一致（例 'R6-PM1-1'） */
  id: string
  /** 問題全体の趣旨・題材・問われる PMBOK 観点（100-200字目安） */
  overview: string
  /** 行ごとの解説（officialAnswers.answers と対応） */
  rows: AfternoonRowExplanation[]
}

/**
 * 午後I 独自解説マップ。
 * 未投入の id は undefined → UI は「解説準備中」フォールバック（段階投入を許容）。
 * 段階投入順: パイロット R6/R5/R4（9問）→ 検証 → 残り。
 */
export const afternoonExplanations: Record<string, AfternoonExplanation> = {
  // パイロット投入予定: R6-PM1-1〜3 / R5-PM1-1〜3 / R4-PM1-1〜3（F2-P8 step2 で Claude が執筆）
}

/** officialAnswers の AnswerRow から rowKey を生成（UI 突合用） */
export function makeRowKey(s: string, q?: string, t?: string): string {
  return `${s}|${q ?? ''}|${t ?? ''}`
}

export function getAfternoonExplanation(id: string): AfternoonExplanation | undefined {
  return afternoonExplanations[id]
}
