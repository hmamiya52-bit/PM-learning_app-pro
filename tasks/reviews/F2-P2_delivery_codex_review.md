# レビュー: F2-P2 delivery クイズ50問 構造レビュー

> レビュー日時: 2026-05-20
> レビュー対象commit: cb3b855
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/delivery.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・ノート照合の観点で致命問題なし。`{{blank}}` 前スペース 1 件と CMMI レベル5表記ゆれ 1 件を同ファイル内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_delivery_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/delivery.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `delivery`。
- import / spread: ○ `src/data/questions/index.ts` で `deliveryQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'delivery'`, `name: 'デリバリー'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-dv-001` 〜 `pm-dv-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-dv-\d{3}$` に準拠。

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

### 難易度分布
- difficulty 1: ○ 14問。
- difficulty 2: ○ 26問。
- difficulty 3: ○ 10問。
- 設計目標: ○ 14 / 26 / 10 と一致。

### excludeFromWritten
- 件数: ○ 11件。
- 対象id: ○ `pm-dv-006, 015, 018, 026, 031, 036, 040, 041, 042, 044, 046`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後 0件。
- `品質マネージメント`: ○ 混入なし。
- `シックス・シグマ`: ○ 混入なし。`シックスシグマ` に統一。
- `ISO9001` / `JIS Q9001`: ○ 混入なし。`ISO 9001` / `JIS Q 9001:2015` 形式を確認。
- `最適化中`: ○ 修正後 0件。CMMI レベル5はノート側と同じ `最適化された` に統一。
- `TODO` / `??`: ○ 混入なし。
- 略語: ○ `CMMI`, `DMAIC`, `DoD`, `DoR`, `AC`, `UAT`, `TDD`, `BDD`, `CI/CD` の表記を確認。
- PMBOKプロセス番号: ○ `8.1`, `8.2`, `8.3` の半角表記を確認。

### ノート整合性
- pm-dv-013: ○ 品質とグレードの違いは NoteDetail §11 と一致。
- pm-dv-016 / 017: ○ COQ の適合コスト / 不適合コスト、予防コスト / 評価コストは NoteDetail §12 と一致。
- pm-dv-018: ○ 7QC道具7つの列挙は NoteDetail §13 と一致。
- pm-dv-026 / 027: ○ 新7QC道具の親和図 / 連関図は NoteDetail §14 と一致。
- pm-dv-028: ○ PDCA の `Act` は NoteDetail §15 と一致。
- pm-dv-031: ○ DMAIC 5ステップは NoteDetail §16 と一致。
- pm-dv-032 / 033: ○ 管理図 ±3σ、正規分布 68-95-99.7% は NoteDetail §17 と一致。
- pm-dv-035 / 037: ○ ISO 9001 / JIS Q 9001:2015 は NoteDetail §18 / §20 と一致。
- pm-dv-036: ○ CMMI 5レベルは NoteDetail §19 と一致。修正後、レベル5表記も `最適化された` で統一。
- pm-dv-038 / 043 / 044: ○ DoD / AC / DoR の使い分けは NoteDetail §21 / §24 と一致。

### 動作確認
- git pull: ○ `Already up to date.`
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- git diff --check: ○ 空白エラーなし。Git の LF→CRLF 予告のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし

### 改善推奨
- なし

## Codexによる追加修正
- `src/data/questions/delivery.ts:280`: `Check（確認）→ {{blank}}` を `Check（確認）→{{blank}}` に修正。
- `src/data/questions/delivery.ts:357`: CMMI レベル5表記 `最適化中` を、NoteDetail §19 と同じ `最適化された` に修正。

## 次のタスクへの教訓
- `{{blank}}` 周辺スペースは AST チェックと固定文字列検索の両方で確認すると漏れにくい。
- CMMI や ISO などの標準モデルは、正答以外の列挙語にもノート側と同じ日本語訳を使っているか確認する。
