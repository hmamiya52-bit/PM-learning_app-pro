// 配点マップ: [正解点, 部分点] の配列（行インデックスは officialAnswers.answers の順序と一致）
//
// 設計書 v0.15 §2.4 / §8 に従う、PM試験 午後I 配点定義。
// F1 段階ではサンプル2件のみ。本格データは F2-P4 で投入。

export type RowScore = { correct: number; partial: number }

function s(data: [number, number][]): RowScore[] {
  return data.map(([c, p]) => ({ correct: c, partial: p }))
}

export const scoringMap: Record<string, RowScore[]> = {
  // ─── R6 午後I 問1 サンプル配点（仮値） ─────────────────────────────
  'R6-PM1-1': s([
    [10, 5],
    [15, 7],
  ]),

  // ─── R6 午後I 問2 サンプル配点（仮値） ─────────────────────────────
  'R6-PM1-2': s([
    [10, 5],
    [15, 7],
  ]),
}
