# レビュー: F2-P2 tailoring-models クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: 6e6e776
> レビューア: Codex

## 結果サマリー
- PASS with fixes: `src/data/questions/tailoring-models.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・表記揺れ・ノート照合の観点で致命問題なし。`pm-tl-007` の `{{blank}}` 直前スペース 1 件を修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_tailoring-models_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/tailoring-models.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `tailoring-models`。
- import / spread: ○ `src/data/questions/index.ts` で `tailoringModelsQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'tailoring-models'`, `name: 'テーラリング・モデル'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-tl-001` 〜 `pm-tl-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-tl-\d{3}$` に準拠。

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
- 対象id: ○ `pm-tl-003, pm-tl-007, pm-tl-014, pm-tl-016, pm-tl-017, pm-tl-022, pm-tl-031, pm-tl-033, pm-tl-034, pm-tl-043, pm-tl-047`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後 0件。
- `テーラリング`: ○ 表記統一を確認。`テイラリング` の混入なし。
- PMBOK7 3軸: ○ `モデル・手法・成果物` を確認。
- 略語・モデル名: ○ `DMAIC` / `PDCA` / `OODA` / `SECI` / `ADKAR` / `GoF` / `MVC` / `MVP` / `MVVM` を確認。
- 固有名詞: ○ `カイゼン` / `Cynefin` / `Stacey` / `PERT` / `PoC` を確認。
- 対人手法: ○ `ファシリテーション` / `アクティブリスニング` を確認。
- 計画書表記: ○ `サブシディアリ` を確認。
- デザインパターン名: ○ `Singleton` / `Factory` / `Observer` / `Strategy` を確認。

### ノート整合性
- pm-tl-007: ○ テーラリングの4ステップは NoteDetail §3 と整合。
- pm-tl-008: ○ PMBOK7 の `モデル・手法・成果物` 3分類は NoteDetail と整合。
- pm-tl-014: ○ DMAIC 5ステップの順序は NoteDetail と整合。
- pm-tl-016 / 017: ○ ADKAR 5要素、コッターの8段階は NoteDetail と整合。
- pm-tl-019 / 020: ○ Cynefin / Stacey の使い分けは NoteDetail と整合。
- pm-tl-024 / 025 / 026: ○ 見積もり手法の区別は NoteDetail と整合。
- pm-tl-043 〜 046: ○ GoF デザインパターン関連問題は補完問題として構造上問題なし。
- pm-tl-047: ○ MVC / MVP / MVVM の選択肢構成は補完問題として構造上問題なし。
- pm-tl-040 / 041: ○ アジャイル三角形、ウォーターフォールのスコープ固定は NoteDetail と整合。

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
- `src/data/questions/tailoring-models.ts`: `pm-tl-007` の `{{blank}}` 直前にあったスペースを削除し、指示書の `{{blank}}` 前後スペース不要ルールに合わせた。

## 補足
- NoteDetail §4 には推奨テーラリング・プロセスの5ステップもあるが、`pm-tl-007` は指示書が指定する NoteDetail §3 の4ステップを対象としているため整合と判断。
- コンテンツ妥当性の最終判断はユーザ / Claude 側。
