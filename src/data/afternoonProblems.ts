/**
 * 午後I（PM1）問題定義
 *
 * 設計書 v0.15 §2.4 / §8 に従う、PM試験 午後I（PM1）の過去問定義。
 * フェーズ1 段階では最小サンプル2件のみ。本格データ投入は F2-P4。
 *
 * NW踏襲: NW の G1/G2 二分割をやめ、PM では PM1（午後I）のみ扱う。
 */

export type ProblemSection = 'PM1'

export interface AfternoonProblem {
  id: string          // e.g. 'R6-PM1-1'
  year: string        // e.g. 'R6'
  yearLabel: string   // e.g. '令和6（2024）'
  era: 'heisei' | 'reiwa'
  section: ProblemSection
  number: number      // 1 / 2 / 3
  title: string
  keywords: string[]
  questionPdfUrl?: string
}

export const afternoonProblems: AfternoonProblem[] = [
  // ─── R6 午後I ───────────────────────────────────────────────────
  {
    id: 'R6-PM1-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: '顧客体験価値（以下，UX という）を提供するシステム開発プロジェクト',
    keywords: ['UX', 'ユーザーニーズ', '品質確保', '利用者参加型'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_qs.pdf',
  },
  {
    id: 'R6-PM1-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'プロジェクトマネジメントの計画',
    keywords: ['マネジメント計画', 'ステークホルダ', '役割分担', '課題管理'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_qs.pdf',
  },
  {
    id: 'R6-PM1-3',
    year: 'R6',
    yearLabel: '令和6（2024）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: 'プロジェクト計画の修整（テーラリング）',
    keywords: ['テーラリング', '変更管理', 'チームマネジメント', 'リーダー育成'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_qs.pdf',
  },
]

export const YEARS = [...new Set(afternoonProblems.map((p) => p.year))]

/**
 * 年度別問題リスト。PM1 のみ返す（NW は G1/G2 二分割だった）。
 */
export function getProblemsByYear(year: string) {
  return {
    PM1: afternoonProblems
      .filter((p) => p.year === year && p.section === 'PM1')
      .sort((a, b) => a.number - b.number),
  }
}
