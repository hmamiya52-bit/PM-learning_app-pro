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

  // ─── H29 午後I ───────────────────────────────────────────────────
  {
    id: 'H29-PM1-1',
    year: 'H29',
    yearLabel: '平成29（2017）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: '製造実行システム導入プロジェクトの計画作成',
    keywords: ['MES', 'プロジェクト計画', 'リスク対応', 'スコープ分割'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm1_qs.pdf',
  },
  {
    id: 'H29-PM1-2',
    year: 'H29',
    yearLabel: '平成29（2017）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'サプライヤへのシステム開発委託',
    keywords: ['調達', '請負契約', 'サプライヤ管理', '品質管理'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm1_qs.pdf',
  },
  {
    id: 'H29-PM1-3',
    year: 'H29',
    yearLabel: '平成29（2017）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: '単体テストの見直し及び成果物の品質向上',
    keywords: ['単体テスト', '品質向上', 'バグ分析', 'レビュー'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm1_qs.pdf',
  },

  // ─── H28 午後I ───────────────────────────────────────────────────
  {
    id: 'H28-PM1-1',
    year: 'H28',
    yearLabel: '平成28（2016）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: 'プロジェクトのリスク管理',
    keywords: ['リスク管理', '要求事項', '設備管理システム', 'タブレット端末'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm1_qs.pdf',
  },
  {
    id: 'H28-PM1-2',
    year: 'H28',
    yearLabel: '平成28（2016）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'プロジェクトにおけるコミュニケーション',
    keywords: ['コミュニケーション', 'ステークホルダ', '要求事項', 'チーム改善'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm1_qs.pdf',
  },
  {
    id: 'H28-PM1-3',
    year: 'H28',
    yearLabel: '平成28（2016）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: 'プロジェクトの進捗管理及びテスト計画',
    keywords: ['進捗管理', 'EVM', 'テスト計画', '外部設計'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm1_qs.pdf',
  },

  // ─── H27 午後I ───────────────────────────────────────────────────
  {
    id: 'H27-PM1-1',
    year: 'H27',
    yearLabel: '平成27（2015）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: '生産管理システムを導入するプロジェクトのステークホルダマネジメント',
    keywords: ['ステークホルダ', '生産管理システム', '海外提携', 'PMO'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm1_qs.pdf',
  },
  {
    id: 'H27-PM1-2',
    year: 'H27',
    yearLabel: '平成27（2015）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'ソフトウェアパッケージの導入',
    keywords: ['パッケージ導入', '倉庫管理', 'プロジェクト計画', '追加開発'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm1_qs.pdf',
  },
  {
    id: 'H27-PM1-3',
    year: 'H27',
    yearLabel: '平成27（2015）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: 'システムの再構築',
    keywords: ['システム再構築', 'スコープ変更', 'データ移行', '並行運用'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm1_qs.pdf',
  },

  // ─── H26 午後I ───────────────────────────────────────────────────
  {
    id: 'H26-PM1-1',
    year: 'H26',
    yearLabel: '平成26（2014）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: '人材管理システムの構築',
    keywords: ['人材管理システム', 'スコープマネジメント', '個人情報', '要求整理'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm1_qs.pdf',
  },
  {
    id: 'H26-PM1-2',
    year: 'H26',
    yearLabel: '平成26（2014）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'プロジェクトの進捗管理',
    keywords: ['進捗管理', 'プロセス改善', 'レビュー', '外部設計'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm1_qs.pdf',
  },
  {
    id: 'H26-PM1-3',
    year: 'H26',
    yearLabel: '平成26（2014）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: '生産管理システムの再構築',
    keywords: ['生産管理システム', '再構築', '契約管理', '移行'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm1_qs.pdf',
  },

  // ─── H25 午後I ───────────────────────────────────────────────────
  {
    id: 'H25-PM1-1',
    year: 'H25',
    yearLabel: '平成25（2013）',
    era: 'heisei',
    section: 'PM1',
    number: 1,
    title: '設計ドキュメント管理システムの開発プロジェクト',
    keywords: ['設計ドキュメント管理', 'クラウドサービス', 'スケジュール', 'リスク評価'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm1_qs.pdf',
  },
  {
    id: 'H25-PM1-2',
    year: 'H25',
    yearLabel: '平成25（2013）',
    era: 'heisei',
    section: 'PM1',
    number: 2,
    title: 'プロジェクト計画の策定',
    keywords: ['プロジェクト計画', 'リスクマネジメント', 'ステークホルダ', '新基盤'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm1_qs.pdf',
  },
  {
    id: 'H25-PM1-3',
    year: 'H25',
    yearLabel: '平成25（2013）',
    era: 'heisei',
    section: 'PM1',
    number: 3,
    title: 'システム開発プロジェクトの企業合併に伴う計画変更',
    keywords: ['計画変更', '企業合併', '業務プロセス', 'データ移行'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm1_qs.pdf',
  },
  {
    id: 'H25-PM1-4',
    year: 'H25',
    yearLabel: '平成25（2013）',
    era: 'heisei',
    section: 'PM1',
    number: 4,
    title: 'ソフトウェア開発の遂行',
    keywords: ['ソフトウェア開発', 'ステークホルダ', '品質管理', 'レビュー'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm1_qs.pdf',
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
