# レビュー: F2-P2 governance クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: 9038652
> レビューア: Codex

## 結果サマリー
- PASS: `src/data/questions/governance.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・表記揺れ・ノート照合の観点で致命問題なし。データ修正は不要と判断。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_governance_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ レビュー記録のみ作成。`src/data/questions/governance.ts`、`src/pages/NoteDetail.tsx`、他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `governance`。
- import / spread: ○ `src/data/questions/index.ts` で `governanceQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'governance'`, `name: 'ガバナンス・組織論'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-gv-001` 〜 `pm-gv-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-gv-\d{3}$` に準拠。

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
- 対象id: ○ `pm-gv-010, pm-gv-011, pm-gv-016, pm-gv-020, pm-gv-023, pm-gv-027, pm-gv-028, pm-gv-030, pm-gv-032, pm-gv-034, pm-gv-043`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 混入なし。
- `ステアリングコミッティ`: ○ 表記統一を確認。
- フレームワーク略語: ○ `COBIT` / `ITIL` / `TOGAF` / `OPM` / `OPM3` / `PMBOK` を確認。
- ISO/JIS表記: ○ `ISO/IEC 27001` / `ISO/IEC 27002` / `JIS Q 38500` / `ISO 9001` / `ISO 14001` / `ISO 20000` を確認。
- 階層用語: ○ `ポートフォリオ` / `プログラム` / `プロジェクト` を確認。
- PMO 3類型: ○ `支援型` / `管理型` / `指揮型` を確認。
- `J-SOX`: ○ 表記統一を確認。
- PMI 倫理4価値観: ○ `責任` / `尊重` / `公正` / `誠実` を確認。

### ノート整合性
- pm-gv-002: ○ ガバナンス vs マネジメントの役割分担は NoteDetail の説明と整合。
- pm-gv-005 / 006: ○ スチュワードシップ原則・価値原則は NoteDetail の PMBOK7 原則説明と整合。
- pm-gv-007 〜 010: ○ ポートフォリオ / プログラム / プロジェクトの階層関係は NoteDetail と整合。
- pm-gv-011 / 012: ○ OPM / OPM3 の説明は NoteDetail と整合。
- pm-gv-016 〜 019: ○ PMO 3類型の影響力レベルは NoteDetail と整合。
- pm-gv-022 / 023: ○ ステアリングコミッティと CCB の役割分担は NoteDetail と整合。
- pm-gv-029 / 031: ○ COBIT 5原則 / JIS Q 38500 6原則は NoteDetail と整合。
- pm-gv-034 〜 038: ○ PMI 倫理4価値観は NoteDetail と整合。
- pm-gv-042 / 043: ○ 内部監査 vs 外部監査の区別は NoteDetail と整合。
- pm-gv-047 〜 049: ○ 個人情報保護法 / 不正競争防止法 / J-SOX の扱いは NoteDetail と整合。

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
- NoteDetail 側では PMO 類型の説明に `コントロール型` 表記がある一方、本タスク指示書は `支援型・管理型・指揮型` の確認を求めているため、問題データは指示書どおり `管理型` に統一されていると判断。
- コンテンツ妥当性の最終判断はユーザ / Claude 側。
