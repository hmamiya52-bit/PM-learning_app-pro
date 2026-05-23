# レビュー: F2-P2 integration クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: 3da54a9
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/integration.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・主要表記・ノート照合の観点で致命問題なし。
- 追加修正として、`{{blank}}` 前後スペース2件と `PM 計画書` 表記揺れ1件を修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_integration_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/integration.ts` と本レビュー記録のみ。
- 対象カテゴリ: ○ `topicId` は全件 `integration`。
- import / spread: ○ `src/data/questions/index.ts` で `integrationQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'integration'`, `name: '統合・変更管理'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-ig-001` 〜 `pm-ig-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-ig-\d{3}$` に準拠。

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
- 対象id: ○ `pm-ig-006, pm-ig-018, pm-ig-022, pm-ig-025, pm-ig-030, pm-ig-033, pm-ig-035, pm-ig-042, pm-ig-047, pm-ig-049, pm-ig-050`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後は混入なし。
- PMBOK プロセス番号: ○ `4.1` 〜 `4.7` の半角表記を確認。
- 主要用語: ○ `プロジェクト憲章` / `PM 計画書` / `ビジネスケース` / `サブシディアリ` を確認。
- 変更管理用語: ○ `是正処置` / `予防処置` / `欠陥修正` / `CCB` を確認。
- 構成管理用語: ○ `CI` / `構成項目` / `構成管理` / `構成状況の記録` を確認。
- ベースライン用語: ○ `ベースライン` / `コスト・ベースライン` を確認。
- 環境・資産用語: ○ `OPA` / `EEF` を確認。
- バージョニング用語: ○ `SemVer` / `CalVer` を確認。
- 禁止表記: ○ `サブシディアリー` の混入なし。

### ノート整合性
- pm-ig-003: ○ PMBOK6 第4章 7プロセスは NoteDetail §2 と整合。
- pm-ig-007 / 009 / 010 / 012: ○ プロジェクト憲章・ビジネスケース・PM 計画書の役割は NoteDetail §4〜§7 と整合。
- pm-ig-019 〜 022 / 025: ○ 是正処置・予防処置・欠陥修正の時系列と対象は NoteDetail §12 / §22 と整合。
- pm-ig-026 〜 028: ○ CCB の構成・権限は NoteDetail §15 と整合。
- pm-ig-029 / 030: ○ 変更影響評価の観点は NoteDetail §16 と整合。
- pm-ig-035: ○ 構成管理と変更管理の違いは NoteDetail §18 と整合。
- pm-ig-037: ○ ベースライン更新は統合変更管理経由とする説明が NoteDetail §19 と整合。
- pm-ig-044 〜 046: ○ 教訓登録簿から OPA への統合は NoteDetail §22 と整合。

### 動作確認
- git pull: ○ `Already up to date.`。
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし。

### 軽微（修正済み）
- `pm-ig-003`: `PM計画書作成` を `PM 計画書作成` に統一。
- `pm-ig-018`: `{{blank}}` 前のスペースを削除。
- `pm-ig-031`: `{{blank}}` 前のスペースを削除。

## Codexによる追加修正
- `src/data/questions/integration.ts` の3箇所を、指示書の表記・プレースホルダ規約に合わせて修正。

## 補足
- NoteDetail には変更要求を `是正/予防/欠陥修正/更新` の4種類として示す試験Tipsもあるが、同ノート内の重点まとめと本タスク指示は `是正処置/予防処置/欠陥修正` の3種類を対象にしているため、今回の設問データは指示範囲どおり PASS とした。
