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
  // ─── R6 午後I 問1 ────────────────────────────────────────────────
  {
    id: 'R6-PM1-1',
    year: 'R6',
    section: 'PM1',
    number: 1,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', a: '付加サービスの固定観念にとらわれない多面的なニーズを得る狙い', essay: true },
      { s: '1', q: '(2)', a: '希望に合ったレストランを簡単に探したい利用者', essay: true },
      { s: '1', q: '(3)', a: '検索から予約までの合計の時間', essay: true },
      { s: '2', a: 'UX に理解を示している利用者に設計内容を検証してもらう狙い', essay: true },
      { s: '3', q: '(1)', a: '本番稼働環境に近い環境での検証が必要だから\n疑似的な予約データでの検証が必要だから', essay: true },
      { s: '3', q: '(2)', a: 'UX が対価に見合う価値であるかどうか', essay: true },
      { s: '4', q: '(1)', a: 'より多くの廉価ユーザーを獲得する狙い', essay: true },
      { s: '4', q: '(2)', a: '廉価ユーザーのニーズなどを複数回にわたって把握する必要があるから\n本番稼働させるには UX の品質を一定のレベル以上にする必要があるから', essay: true },
    ],
  },

  // ─── R6 午後I 問2 ────────────────────────────────────────────────
  {
    id: 'R6-PM1-2',
    year: 'R6',
    section: 'PM1',
    number: 2,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', a: 'システム部内で他の課と情報を共有して共同作業を行うことの難しさ', essay: true },
      { s: '1', q: '(2)', a: '不慣れな PMM を適用して生産性が低下する課があるから', essay: true },
      { s: '2', q: '(1)', a: '本プロジェクトと制度改正作業の稼働割合と作業進捗', essay: true },
      { s: '2', q: '(2)', a: '管理部門以外のステークホルダとの信頼関係', essay: true },
      { s: '2', q: '(3)', a: '本プロジェクトと制度改正作業の間で調整するため', essay: true },
      { s: '3', q: '(1)', a: '課を横断する課題の早期検知と，対応方針の早期合意', essay: true },
      { s: '3', q: '(2)', a: '新システムに関する全ての開発成果物を一元管理する。', essay: true },
    ],
  },

  // ─── R6 午後I 問3 ────────────────────────────────────────────────
  {
    id: 'R6-PM1-3',
    year: 'R6',
    section: 'PM1',
    number: 3,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', a: '要求事項の取込みに最大限柔軟に対応するため', essay: true },
      { s: '1', q: '(2)', a: '要求事項を提出した業務部門への確認などのやり取りを減らす効果', essay: true },
      { s: '1', q: '(3)', a: '開発項目内のほかの要求事項を外す決定', essay: true },
      { s: '1', q: '(4)', a: '要求事項を受け入れ続けることでスケジュール遅延したくないから', essay: true },
      { s: '2', q: '(1)', a: '支援型リーダーの育成に適さないマネジメントだから', essay: true },
      { s: '2', q: '(2)', a: 'モチベーションが高く自発的に仕事に取り組む姿勢', essay: true },
      { s: '2', q: '(3)', a: 'チームのパフォーマンス低下による進捗の遅れを防ぐ効果', essay: true },
      { s: '2', q: '(4)', a: '問題が大きくなる前に原因を把握して早期に解決を図る効果', essay: true },
    ],
  },
]
