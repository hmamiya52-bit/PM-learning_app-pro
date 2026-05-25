/**
 * 午後II（PM2）論述問題データ
 *
 * 設計書 v0.15 §2.6 / basic_design §4.2 に基づく PM 試験 午後II 論述問題。
 * F2-P5 で新しい年度から順に公式設問へ差し替え。
 *
 * IPA 著作権規約: 教育目的引用OK、出典明記必須、解説（自己評価項目）のみ独自作成。
 */

import type { EssayProblem } from '../types'

export const essayProblems: EssayProblem[] = [
  {
    id: 'R6-PM2-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 1,
    theme: '予測型のシステム開発プロジェクトにおけるコストのマネジメントについて',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった予測型のシステム開発プロジェクトにおける，予算を含むステークホルダのコストに関する要求事項，不確かさ及び不確かさがコストの見積りに与える影響，影響についての認識をステークホルダと共有するために実施したことについて，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた不確かさに関して，計画段階でステークホルダと合意した，予測活動の内容，コストの再見積りのタイミングを決める条件，予測活動におけるステークホルダとの協力の内容，及び再見積りしたコストと予算との差異への対応方針について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '実行段階での，予測精度の向上を考慮して実施した再見積りのタイミング，再見積りしたコストと予算との差異の内容，及びステークホルダに報告して承認を得た差異への対応策について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['planning', 'measurement', 'uncertainty', 'stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R6-PM2-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 2,
    theme: 'メンバーの状況に応じたリーダーシップの選択について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたがマネジメントに携わったプロジェクトチームの特性，プロジェクト実行中に起きたプロジェクトの活動を阻害するおそれのある外部環境の変化，阻害するおそれがあると考えた理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた外部環境の変化によって悪化したプロジェクトチームの状態，悪化した状態の改善に向けて把握した個々のメンバーの状況，それらの状況に応じて選択したリーダーシップとこれに基づく具体的な行動，それぞれの行動を使い分けた理由について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べたリーダーシップを発揮した後の，改善したプロジェクトチームの状態，及び状態の改善に対する評価について，プロジェクトの活動を阻害するおそれのある外部環境の変化への対応結果を含めて，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['team', 'stakeholder', 'uncertainty'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_cmnt.pdf',
  },
]

/** ID で問題取得 */
export function getEssayProblemById(id: string): EssayProblem | undefined {
  return essayProblems.find((p) => p.id === id)
}
