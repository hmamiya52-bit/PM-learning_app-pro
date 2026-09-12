// 午後Ⅰ 公式設問文（IPA 原文引用）の型と索引
//
// 出典：独立行政法人情報処理推進機構（IPA）公開の情報処理技術者試験
//       プロジェクトマネージャ試験 午後Ⅰ 問題
//       https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html
//
// afternoonExplanations.detail.questionDetails.asked は Claude が書いた「要約」であり、
// 公式の設問文と文言・字数条件が食い違う例が確認された（ユーザ報告 2026-09-12）。
// そのため設問文そのものは本ディレクトリに IPA 原文のまま収める。改変・要約はしない。
// 午前Ⅱ（officialMorningQuestions）が公式問題文を原文引用しているのと同じ扱い。
//
// 転記手順: 公式問題PDFは全年度が画像スキャンでテキスト抽出できないため、
//          ページを画像化して目視で転記している。年度ごとに 1 ファイル。
// 検証: npm run audit:asked（転記カバレッジと字数条件の突き合わせ）

/** 1 つの解答行に対応する公式設問文 */
export interface AfternoonQuestionText {
  /** `${s}|${q ?? ''}|${t ?? ''}` で officialAnswers の行と対応 */
  rowKey: string
  /** 表示用の見出し（例「設問1(1)」） */
  heading: string
  /** 親設問の導入文（例「〔要件定義に関するプロジェクト計画〕について答えよ。」）。小問が無い設問では省略 */
  lead?: string
  /** 公式の設問文（原文のまま。改変しない） */
  text: string
}

/** 年度ファイルが公開する形（問題 id → 設問文の配列） */
export type AfternoonQuestionTextSet = Record<string, AfternoonQuestionText[]>
