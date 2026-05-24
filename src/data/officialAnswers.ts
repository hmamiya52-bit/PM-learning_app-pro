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

  // ─── R5 午後I 問1 ────────────────────────────────────────────────
  {
    id: 'R5-PM1-1',
    year: 'R5',
    section: 'PM1',
    number: 1,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', a: '成果を随時確認しながらプロジェクトを進められるから', essay: true },
      { s: '1', q: '(2)', a: '自分の考えや気持ちを誰に対してでも安心して発言できる状態', essay: true },
      { s: '1', q: '(3)', a: 'メンバーは目的の実現に前向きな姿勢である状況', essay: true },
      { s: '1', q: '(4)', a: 'メンバーの自発的なチャレンジが重要だから', essay: true },
      { s: '2', q: '(1)', a: '提供する体験価値に対するメンバーの思いを統一し共有するため', essay: true },
      { s: '2', q: '(2)', a: 'メンバーが出資元各社の期待に制約されずにチャレンジできる環境', essay: true },
      { s: '3', a: '知見や体験を共有して価値の共創力を高めるため', essay: true },
    ],
  },

  // ─── R5 午後I 問2 ────────────────────────────────────────────────
  {
    id: 'R5-PM1-2',
    year: 'R5',
    section: 'PM1',
    number: 2,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', a: '顧客価値に直結しない計画変更に掛ける活動が増加していくという課題', essay: true },
      { s: '2', a: 'どんなに資源を投入しても，納期に間に合わせることができない状況', essay: true },
      { s: '3', a: 'A 社の視点を加えてほしいこと', essay: true },
      { s: '4', q: '(1)', a: '優越的な立場が悪影響を及ぼさないようにすること', essay: true },
      { s: '4', q: '(2)', a: '最速で予兆を検知して，協調して対処する。', essay: true },
      { s: '4', q: '(3)', t: 'a', a: 'ooda' },
      { s: '4', q: '(3)', t: 'b', a: '回復力' },
      { s: '4', q: '(3)', t: 'c', a: '成果報酬 又は 成果完成' },
      { s: '4', q: '(3)', t: 'd', a: 'インセンティブ・フィー' },
      { s: '4', q: '(4)', a: '生産性向上のモチベーションを維持する。', essay: true },
    ],
  },

  // ─── R5 午後I 問3 ────────────────────────────────────────────────
  {
    id: 'R5-PM1-3',
    year: 'R5',
    section: 'PM1',
    number: 3,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', a: 'ベテラン技術者の抵抗感を抑えプロジェクトに協力させるため', essay: true },
      { s: '2', q: '(1)', a: '技術者全員の不満解消になることを伝えるため', essay: true },
      { s: '2', q: '(2)', a: '予兆検知に必要なデータを特定するコンサルティング', essay: true },
      { s: '2', q: '(3)', t: 'ベテラン技術者', a: '機器類の予兆検知と交換・修理のノウハウを提示する。', essay: true },
      { s: '2', q: '(3)', t: '中堅技術者', a: '早い段階からシステムの仕様を理解し活用できるかを確認する。', essay: true },
      { s: '3', q: '(1)', t: '要件定義フェーズ', a: '探索的な進め方になること', essay: true },
      { s: '3', q: '(1)', t: '開発フェーズ', a: '計画を策定し計画どおりに実行すること', essay: true },
      { s: '3', q: '(2)', a: '中堅技術者がベテラン技術者の交換・修理のノウハウを継承するため', essay: true },
    ],
  },

  // ─── R4 午後I 問1 ────────────────────────────────────────────────
  {
    id: 'R4-PM1-1',
    year: 'R4',
    section: 'PM1',
    number: 1,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', a: 'AI ボットの運用開始がクリスマスギフト商戦に遅れるリスク', essay: true },
      { s: '2', q: '(1)', a: 'AI ボット導入によるコールセンター業務の実施イメージ\n顧客がどのように AI ボットを使うのかのイメージ', essay: true },
      { s: '2', q: '(2)', a: 'より類似性の高い質問や回答の提示状況', essay: true },
      { s: '2', q: '(3)', a: 'FAQ の自動更新に関わる要求', essay: true },
      { s: '2', q: '(4)', t: 'a', a: 'パラメータ設定の変更だけで実現できる。', essay: true },
      { s: '3', q: '(1)', a: '顧客の真のニーズを踏まえたギフトを販売できるかどうか', essay: true },
      { s: '3', q: '(2)', a: 'デジタルマーケティング戦略の立案を先にすべきだから', essay: true },
      { s: '3', q: '(3)', a: 'マーケティング業務で AI を活用したデータ分析などを行う。', essay: true },
    ],
  },

  // ─── R4 午後I 問2 ────────────────────────────────────────────────
  {
    id: 'R4-PM1-2',
    year: 'R4',
    section: 'PM1',
    number: 2,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', t: '開発課', a: '利用部門の要求を迅速に実現すること', essay: true },
      { s: '1', q: '(1)', t: '運用課', a: 'システムの安定運用を実現すること', essay: true },
      { s: '1', q: '(2)', a: '実店舗同様に試着したり提案を受けたりできること', essay: true },
      { s: '2', q: '(1)', a: '的確に顧客のニーズを把握するスキル', essay: true },
      { s: '2', q: '(2)', a: 'A 社社内にスキルをもった人材を育成するため', essay: true },
      { s: '2', q: '(3)', a: 'メンバーに多様な視点からの意見を理解してもらうため', essay: true },
      { s: '3', q: '(1)', a: 'デプロイまでの時間を短縮する効果', essay: true },
      { s: '3', q: '(2)', a: 'ガバナンス規程を遵守しつつ，安定した運用を提供すること', essay: true },
    ],
  },

  // ─── R4 午後I 問3 ────────────────────────────────────────────────
  {
    id: 'R4-PM1-3',
    year: 'R4',
    section: 'PM1',
    number: 3,
    pdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_ans.pdf',
    answers: [
      { s: '1', q: '(1)', a: 'DX の推進方針とプロジェクトの実施内容の整合を取る役割', essay: true },
      { s: '1', q: '(2)', a: 'DX の推進に意欲をもった社員を集めること', essay: true },
      { s: '1', q: '(3)', a: 'チームの運営方法を改革することを，経営の意思として示すため', essay: true },
      { s: '2', a: 'メンバーの本音の意見を把握すること', essay: true },
      { s: '3', q: '(1)', a: 'メンバーの心理的安全性が確保された状況', essay: true },
      { s: '3', q: '(2)', a: '多様な考えに基づいた，より良い意思決定ができる。\nチームのパフォーマンスが最大限に発揮できる。', essay: true },
      { s: '3', q: '(3)', a: '他のメンバーの支援によって状況を速やかに解決できる。', essay: true },
      { s: '3', q: '(4)', a: '予算や期限よりも新事業の実現が優先されるから', essay: true },
    ],
  },
]
