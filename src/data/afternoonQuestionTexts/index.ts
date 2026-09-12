import type { AfternoonQuestionText, AfternoonQuestionTextSet } from './types'
import { r6 } from './r6'
import { r5 } from './r5'
import { r4 } from './r4'
import { r3 } from './r3'
import { r2 } from './r2'
import { r1 } from './r1'
import { h30 } from './h30'
import { h29 } from './h29'
import { h28 } from './h28'
import { h27 } from './h27'

export type { AfternoonQuestionText, AfternoonQuestionTextSet } from './types'

/** 問題 id → 公式設問文の配列（年度ファイルを結合） */
export const afternoonQuestionTexts: AfternoonQuestionTextSet = {
  ...r6,
  ...r5,
  ...r4,
  ...r3,
  ...r2,
  ...r1,
  ...h30,
  ...h29,
  ...h28,
  ...h27,
}

/** 指定した問題の公式設問文を rowKey 引きできる形で返す（未転記の年度は空） */
export function getAfternoonQuestionTexts(
  problemId: string,
): Record<string, AfternoonQuestionText> {
  const map: Record<string, AfternoonQuestionText> = {}
  for (const q of afternoonQuestionTexts[problemId] ?? []) map[q.rowKey] = q
  return map
}
