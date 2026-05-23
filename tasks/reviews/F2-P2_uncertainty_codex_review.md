# レビュー: F2-P2 uncertainty クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: 4bf1119
> レビューア: Codex

## 結果サマリー
- 🟢 PASS: `src/data/questions/uncertainty.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・表記揺れ・EMV 数値検算・ノート照合の観点で致命問題なし。データ修正は不要と判断。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_uncertainty_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ レビュー記録のみ作成。`src/data/questions/uncertainty.ts`、`src/pages/NoteDetail.tsx`、他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `uncertainty`。
- import / spread: ○ `src/data/questions/index.ts` で `uncertaintyQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'uncertainty'`, `name: '不確かさ・リスク'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-un-001` 〜 `pm-un-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-un-\d{3}$` に準拠。

### 型・選択肢
- `questionText`: ○ 全件 `{{blank}}` が1個。
- `correctAnswer`: ○ 全件非空。
- `choices`: ○ 全件4択。
- 正解含有: ○ 全件 `choices` に `correctAnswer` を含む。
- 重複選択肢: ○ 全件なし。
- 空文字選択肢: ○ 全件なし。
- `explanation`: ○ 全件非空。
- `difficulty`: ○ 全件 `1 | 2 | 3`。
- `excludeFromWritten`: ○ 省略または boolean。
- プレースホルダ: ○ `TODO` / `TBD` / `FIXME` の混入なし。

### 難易度分布
- difficulty 1: ○ 14問。
- difficulty 2: ○ 26問。
- difficulty 3: ○ 10問。
- 設計目標: ○ 14 / 26 / 10 と一致。

### excludeFromWritten
- 件数: ○ 11件。
- 対象id: ○ `pm-un-010, pm-un-012, pm-un-018, pm-un-021, pm-un-025, pm-un-029, pm-un-031, pm-un-039, pm-un-042, pm-un-044, pm-un-047`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 混入なし。
- 主要用語: ○ `脅威` / `機会（好機）` / `リスク` を確認。
- 脅威5戦略: ○ `回避` / `軽減` / `転嫁` / `エスカレーション` / `受容` を確認。
- 機会5戦略: ○ `活用` / `強化` / `共有` / `エスカレーション` / `受容` を確認。
- 略語: ○ `EMV` / `RBS` / `SWOT` / `EWS` を確認。
- 中黒表記: ○ `リスク・スレッショルド` / `リスク・プロファイル` を確認。
- PMBOK プロセス番号: ○ `11.1` 〜 `11.7` の半角表記を確認。
- `コンティンジェンシー`: ○ 表記統一を確認。

### EMV 数値検算
- pm-un-016: ○ `リスクスコア = 発生確率 × 影響度`。
- pm-un-018: ○ `EMV = 影響金額 × 発生確率`。
- pm-un-019: ○ `0.3 × (−100) + 0.5 × 200 = −30 + 100 = +70 万円`。

### ノート整合性
- pm-un-006: ○ PMBOK6 第11章 7プロセスは NoteDetail §3 と整合。
- pm-un-025 〜 030: ○ 脅威5戦略は NoteDetail §13 と整合。
- pm-un-031 〜 034: ○ 機会5戦略は NoteDetail §14 と整合。
- pm-un-039 / 040: ○ 二次リスクと残存リスクの違いは NoteDetail §19 と整合。
- pm-un-041 / 042 / 043: ○ リスク選好・リスク許容度・スレッショルドの階層は NoteDetail §20 と整合。
- pm-un-020: ○ 決定木の決定ノード（□）と機会/確率ノード（○）の説明は NoteDetail §9 と整合。

### 動作確認
- git pull: ○ `Already up to date.`。
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし

### 改善推奨
- なし

## Codexによる追加修正
- なし

## 補足
- 脅威5戦略・機会5戦略は NoteDetail と同じ集合を確認した。列挙順は問題文側では指示書の順序に合わせている。
- コンテンツ妥当性の最終判断はユーザ / Claude 側。
