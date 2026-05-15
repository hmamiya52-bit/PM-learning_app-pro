// 出典：独立行政法人情報処理推進機構（IPA）公式解答例
// https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html
//
// 設計書 v0.15 §2.4 / §8 に従う、PM試験 午後I 公式解答データ。
// F1 段階ではサンプル2件のみ。本格データは F2-P4 で投入。

export interface AnswerRow {
  s: string    // 設問番号 "1" | "2" | "3" | "4"
  q?: string   // 小問 "(1)" | "(2)" | ...
  t?: string   // ラベル "a" | "①" | ...
  a: string    // 解答例
  essay?: boolean  // 記述式（文字数カウント対象）
}

export interface OfficialAnswerSet {
  id: string             // afternoonProblems の id と一致 "R6-PM1-1"
  year: string
  section: 'PM1'
  number: number
  pdfUrl: string
  answers: AnswerRow[]
}

export const officialAnswers: OfficialAnswerSet[] = [
  // ─── R6 午後I 問1 サンプル ────────────────────────────────────────
  {
    id: 'R6-PM1-1',
    year: 'R6',
    section: 'PM1',
    number: 1,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
    answers: [
      { s: '1', q: '(1)', t: 'a', a: '（サンプル）' },
      { s: '1', q: '(2)', a: '（フェーズ2で本格投入予定）', essay: true },
    ],
  },

  // ─── R6 午後I 問2 サンプル ────────────────────────────────────────
  {
    id: 'R6-PM1-2',
    year: 'R6',
    section: 'PM1',
    number: 2,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
    answers: [
      { s: '1', q: '(1)', t: 'a', a: '（サンプル）' },
      { s: '1', q: '(2)', a: '（フェーズ2で本格投入予定）', essay: true },
    ],
  },
]
