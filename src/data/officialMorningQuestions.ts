/**
 * 公式午前II（PM 午前II）問題データ
 *
 * 設計書 v0.15 §2.5 に従う、PM試験 午前II の過去問（IPA公式）。
 * F1 段階では最小サンプル（1年度×3問）のみ。本格データは F2-P3 で投入。
 *
 * IPA 著作権規約（memory/risks.md R1 参照）:
 * - 教育目的の引用は許諾・使用料不要
 * - 出典明記必須: 「出典：<年度> <期> プロジェクトマネージャ試験 午前II 問<番号>」
 * - 問題文・選択肢は IPA 公式のまま引用（改変なし）。解説のみ独自作成。
 */

import type { OfficialMorningQuestion } from '../types'

export const MORNING_YEARS = ['R6'] as const   // F1 サンプル年度。F2-P3 で H25〜現行に拡張

export const officialMorningQuestions: OfficialMorningQuestion[] = [
  {
    id: 'om-R6-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 1,
    questionText:
      'プロジェクトマネジメントにおけるステークホルダー分析として、最も適切なものはどれか。（フェーズ2 F2-P3 で本格データに差し替え予定）',
    choices: [
      'ステークホルダーの権力と関心度を二軸でマッピングする。',
      'ステークホルダーの予算と納期を二軸でマッピングする。',
      'ステークホルダーの実装難度と工数を二軸でマッピングする。',
      'ステークホルダーの過去案件成功率を二軸でマッピングする。',
    ],
    correctIndex: 0,
    explanation:
      '【サンプル解説】ステークホルダー分析の代表的フレームワーク「権力／関心度グリッド」では、各ステークホルダーを「権力（影響を及ぼす力）」と「関心度（プロジェクトへの関心の高さ）」の2軸で4象限に分類し、エンゲージメント戦略を決定する。',
    categoryId: 'stakeholder',
    sourceUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
  },
  {
    id: 'om-R6-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 2,
    questionText:
      'PMBOK 第7版で示される12の原理原則のうち、「ステワードシップ」の説明として最も適切なものはどれか。（フェーズ2 F2-P3 で本格データに差し替え予定）',
    choices: [
      '勤勉さ、敬意、思いやりを持ってプロジェクトを統治・運営すること。',
      '常に最短スケジュールを優先し、リソースを徹底的に活用すること。',
      '顧客の要求変更を一切受け入れずスコープを固定すること。',
      '関係者へのコミュニケーションを最小限に抑えること。',
    ],
    correctIndex: 0,
    explanation:
      '【サンプル解説】PMBOK 第7版の原理原則「ステワードシップ (Stewardship)」は、勤勉さ・敬意・思いやりを持って、組織内外の利害関係者に対し責任ある行動を取ることを意味する。倫理、誠実性、コンプライアンスを含む包括的な統治観。',
    categoryId: 'governance',
    sourceUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
  },
  {
    id: 'om-R6-3',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 3,
    questionText:
      'EVM（アーンドバリュー法）において、CV（コスト差異）が負の値で、SV（スケジュール差異）も負の値の場合、プロジェクトの状態として最も適切なものはどれか。（フェーズ2 F2-P3 で本格データに差し替え予定）',
    choices: [
      'コスト超過かつスケジュール遅延。',
      'コスト節約かつスケジュール前倒し。',
      'コスト超過だがスケジュール前倒し。',
      'コスト節約だがスケジュール遅延。',
    ],
    correctIndex: 0,
    explanation:
      '【サンプル解説】CV = EV − AC、SV = EV − PV。CV<0 は AC > EV → 計画より多くのコストを使っており「コスト超過」。SV<0 は PV > EV → 計画より作業が進んでおらず「スケジュール遅延」。両方マイナスは最も望ましくない状態で、是正処置が必要。',
    categoryId: 'measurement',
    sourceUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html',
  },
]

/** 年度別問題リスト（OfficialMorningQuiz トップ画面の年度カード用） */
export function getMorningQuestionsByYear(year: string): OfficialMorningQuestion[] {
  return officialMorningQuestions
    .filter((q) => q.year === year)
    .sort((a, b) => a.number - b.number)
}
