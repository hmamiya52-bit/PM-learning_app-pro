import type { AnswerRow } from '../data/officialAnswers'

export interface ProcessedRow extends AnswerRow {
  rowIndex: number
  showS: boolean
  sRowspan: number
  showQ: boolean
  qLabel: string
  qRowspan: number
  inlineT: string | undefined
}

export function processRows(answers: AnswerRow[]): ProcessedRow[] {
  const result: ProcessedRow[] = answers.map((row, i) => {
    const prev = answers[i - 1]
    const showS = !prev || prev.s !== row.s

    let showQ: boolean
    let qLabel: string
    let inlineT: string | undefined

    if (row.q !== undefined) {
      showQ = showS || !prev || prev.q !== row.q
      qLabel = row.q
      inlineT = row.t
    } else {
      showQ = true
      qLabel = row.t ?? ''
      inlineT = undefined
    }

    return { ...row, rowIndex: i, showS, sRowspan: 0, showQ, qLabel, qRowspan: 0, inlineT }
  })

  for (let i = 0; i < result.length; i++) {
    if (result[i].showS) {
      let span = 1
      for (let j = i + 1; j < result.length && !result[j].showS; j++) span++
      result[i].sRowspan = span
    }
  }

  for (let i = 0; i < result.length; i++) {
    if (!result[i].showQ) continue
    if (result[i].q !== undefined) {
      let span = 1
      for (
        let j = i + 1;
        j < result.length && !result[j].showQ && !result[j].showS && result[j].q !== undefined;
        j++
      ) span++
      result[i].qRowspan = span
    } else {
      result[i].qRowspan = 1
    }
  }

  return result
}

export const BORDER_OUTER = '2px solid #4b5563'
export const BORDER_INNER = '1px solid #9ca3af'
export const BORDER_HEAD  = '1px solid #6b7280'
