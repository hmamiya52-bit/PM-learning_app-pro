/**
 * 午後II（PM2）論述問題データ
 *
 * 設計書 v0.15 §2.6 / basic_design §4.2 に基づく PM 試験 午後II 論述問題。
 * F1-P5 段階では最小サンプル1-2問。本格データは F2-P5 で投入。
 *
 * IPA 著作権規約: 教育目的引用OK、出典明記必須、解説（自己評価項目）のみ独自作成。
 * NOTE: サンプル段階では IPA 過去問テーマを参考にしたオリジナル文を仮置き。
 *       F2-P5 で公式設問に差し替え。
 */

import type { EssayProblem } from '../types'

export const essayProblems: EssayProblem[] = [
  {
    id: 'R6-PM2-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 1,
    theme: 'ステークホルダー・エンゲージメントの計画と実践（サンプル）',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったプロジェクトの概要、関与したステークホルダー、ならびにそのステークホルダーの特性について、800字以内で述べよ。',
        recommendedChars: { min: 700, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたステークホルダーに対し、どのようなエンゲージメント計画を策定し、どのように実施したか。工夫した点を含めて 800〜1,600 字で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた実施内容について、当初の計画と比較した評価と、今後の改善点を 600〜1,200 字で述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['stakeholder', 'team'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
  },
  {
    id: 'R6-PM2-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 2,
    theme: '不確かさ・リスクへの対応（サンプル）',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったプロジェクトの概要、ならびに直面した主要な不確かさ／リスクについて、800字以内で述べよ。',
        recommendedChars: { min: 700, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた不確かさ／リスクに対し、どのような対応策を計画・実行したか。工夫した点を含めて 800〜1,600 字で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた対応策の有効性を評価し、今後同様のプロジェクトで取り組むべき改善点を 600〜1,200 字で述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['uncertainty', 'planning'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
  },
]

/** ID で問題取得 */
export function getEssayProblemById(id: string): EssayProblem | undefined {
  return essayProblems.find((p) => p.id === id)
}
