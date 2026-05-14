import type { Category } from '../types'

/**
 * PM Learning App カテゴリ定義（PMBOK第7版ベース 12 + サービスマネジメント）
 *
 * 設計書: detailed_design.md v0.15 §2.2 / basic_design.md §5.1
 * PMBOK第8版の追加要素は pmbok8-diff カテゴリで別管理（F2-P6 で導入予定）
 */
export const categories: Category[] = [
  { id: 'stakeholder',          name: 'ステークホルダー',         order: 1,  description: '特定・分析・エンゲージメント計画' },
  { id: 'team',                 name: 'チーム',                   order: 2,  description: 'リーダーシップ・組織・要員管理' },
  { id: 'development-approach', name: '開発アプローチ',           order: 3,  description: '予測型／適応型／ハイブリッド・アジャイル' },
  { id: 'planning',             name: '計画',                    order: 4,  description: 'スコープ・WBS・スケジュール・コスト・見積' },
  { id: 'project-work',         name: 'プロジェクト作業',         order: 5,  description: '調達・契約・リソース・知識管理' },
  { id: 'delivery',             name: 'デリバリー',              order: 6,  description: '品質・要求・受入' },
  { id: 'measurement',          name: '測定',                    order: 7,  description: 'EVM・KPI・予測・パフォーマンス測定' },
  { id: 'uncertainty',          name: '不確かさ・リスク',         order: 8,  description: 'リスク特定・分析・対応・機会管理' },
  { id: 'integration',          name: '統合・変更管理',           order: 9,  description: '統合管理・変更要求・構成管理' },
  { id: 'governance',           name: 'ガバナンス・組織論',       order: 10, description: 'PMO・ポートフォリオ・プログラム・組織構造' },
  { id: 'tailoring-models',     name: 'テーラリング・モデル',     order: 11, description: 'PMBOK第7版モデル・手法・成果物' },
  { id: 'service-management',   name: 'サービスマネジメント',     order: 12, description: 'ITIL・SLA・運用引継ぎ・システム監査・法務' },
]
