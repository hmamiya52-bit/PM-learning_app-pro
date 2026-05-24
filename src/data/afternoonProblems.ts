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

  // ─── R5 午後I ───────────────────────────────────────────────────
  {
    id: 'R5-PM1-1',
    year: 'R5',
    yearLabel: '令和5（2023）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: '価値の共創を目指すプロジェクトチームのマネジメント',
    keywords: ['価値共創', 'チームマネジメント', 'リーダーシップ', 'テーラリング'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_qs.pdf',
  },
  {
    id: 'R5-PM1-2',
    year: 'R5',
    yearLabel: '令和5（2023）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'システム開発プロジェクトにおけるイコールパートナーシップ',
    keywords: ['イコールパートナーシップ', '適応力', '回復力', '協力会社'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_qs.pdf',
  },
  {
    id: 'R5-PM1-3',
    year: 'R5',
    yearLabel: '令和5（2023）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: '化学品製造業における予兆検知システム',
    keywords: ['ステークホルダ', '予兆検知', '開発アプローチ', '知識継承'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_qs.pdf',
  },

  // ─── R4 午後I ───────────────────────────────────────────────────
  {
    id: 'R4-PM1-1',
    year: 'R4',
    yearLabel: '令和4（2022）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: 'SaaS を利用して短期間にシステムを導入するプロジェクト',
    keywords: ['SaaS', 'UX改善', 'AIボット', '導入計画'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_qs.pdf',
  },
  {
    id: 'R4-PM1-2',
    year: 'R4',
    yearLabel: '令和4（2022）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'EC サイト刷新プロジェクトにおけるプロジェクト計画',
    keywords: ['ECサイト刷新', 'プロジェクト計画', '顧客体験価値', 'DevOps'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_qs.pdf',
  },
  {
    id: 'R4-PM1-3',
    year: 'R4',
    yearLabel: '令和4（2022）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: 'プロジェクトにおけるチームビルディング',
    keywords: ['チームビルディング', 'DX', '心理的安全性', '支援型リーダーシップ'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm1_qs.pdf',
  },

  // ─── R3 午後I ───────────────────────────────────────────────────
  {
    id: 'R3-PM1-1',
    year: 'R3',
    yearLabel: '令和3（2021）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: '新たな事業を実現するためのシステム開発プロジェクトにおけるプロジェクト計画',
    keywords: ['新事業', 'DX', '段階的詳細化', 'リスク対応'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm1_qs.pdf',
  },
  {
    id: 'R3-PM1-2',
    year: 'R3',
    yearLabel: '令和3（2021）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: '業務管理システムの改善のためのシステム開発プロジェクト',
    keywords: ['顧客満足度', 'マネジメントプロセス', '顧客体験価値', '業務改善'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm1_qs.pdf',
  },
  {
    id: 'R3-PM1-3',
    year: 'R3',
    yearLabel: '令和3（2021）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: 'マルチベンダのシステム開発プロジェクト',
    keywords: ['マルチベンダ', 'ステークホルダ', 'プロジェクト作業', '変更管理'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm1_qs.pdf',
  },

  // ─── R2 午後I ───────────────────────────────────────────────────
  {
    id: 'R2-PM1-1',
    year: 'R2',
    yearLabel: '令和2（2020）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: 'デジタルトランスフォーメーション（DX）推進におけるプロジェクトの立ち上げ',
    keywords: ['DX', 'プロジェクト憲章', 'プロジェクト立ち上げ', 'チーム編成'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm1_qs.pdf',
  },
  {
    id: 'R2-PM1-2',
    year: 'R2',
    yearLabel: '令和2（2020）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'システム開発プロジェクトにおける，プロジェクトチームの開発',
    keywords: ['プロジェクトチーム開発', '生産性', '自律的チーム', 'メンバ育成'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm1_qs.pdf',
  },
  {
    id: 'R2-PM1-3',
    year: 'R2',
    yearLabel: '令和2（2020）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: 'SaaS を利用した人材管理システム導入プロジェクト',
    keywords: ['SaaS', '人材管理システム', '要件定義', 'コミュニケーション'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm1_qs.pdf',
  },

  // ─── R1 午後I ───────────────────────────────────────────────────
  {
    id: 'R1-PM1-1',
    year: 'R1',
    yearLabel: '令和元（2019）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: 'コンタクトセンタにおけるサービス利用のための移行',
    keywords: ['サービス移行', 'コンタクトセンタ', '移行リハーサル', 'リスク対応'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm1_qs.pdf',
  },
  {
    id: 'R1-PM1-2',
    year: 'R1',
    yearLabel: '令和元（2019）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'IoT を活用した工事管理システムの構築',
    keywords: ['IoT', '工事管理システム', 'WBS', 'ステークホルダ調整'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm1_qs.pdf',
  },
  {
    id: 'R1-PM1-3',
    year: 'R1',
    yearLabel: '令和元（2019）',
    era: 'reiwa',
    section: 'PM1',
    number: 3,
    title: 'プロジェクトの定量的なマネジメント',
    keywords: ['定量的マネジメント', 'スケジュール管理', 'リカバリ策', 'SPI'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm1_qs.pdf',
  },

  // ─── H30 午後I ───────────────────────────────────────────────────
  {
    id: 'H30-PM1-1',
    year: 'H30',
    yearLabel: '平成30（2018）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: 'SaaS を利用した営業支援システムを導入するプロジェクト',
    keywords: ['SaaS', '営業支援システム', '要件定義', 'データ移行'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm1_qs.pdf',
  },
  {
    id: 'H30-PM1-2',
    year: 'H30',
    yearLabel: '平成30（2018）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'システム開発プロジェクトの品質管理',
    keywords: ['品質管理', '設計限界品質', '品質管理指標', '欠陥分析'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm1_qs.pdf',
  },
  {
    id: 'H30-PM1-3',
    year: 'H30',
    yearLabel: '平成30（2018）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: '情報システム刷新プロジェクトのコミュニケーション',
    keywords: ['コミュニケーション', 'ステークホルダ', 'CRM', '子会社活用'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm1_qs.pdf',
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
