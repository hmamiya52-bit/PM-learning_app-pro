# レビュー: F2-P2 planning クイズ50問 構造レビュー

> レビュー日時: 2026-05-20
> レビュー対象commit: 2d7bd21
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/planning.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・ノート照合の観点で致命問題なし。選択肢内の表記揺れ 1 件を同ファイル内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_planning_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/planning.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `planning`。
- import / spread: ○ `src/data/questions/index.ts` で `planningQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'planning'`, `name: '計画'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-pl-001` 〜 `pm-pl-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-pl-\d{3}$` に準拠。

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
- 対象id: ○ `pm-pl-016, 017, 021, 023, 027, 035, 036, 038, 040, 043, 050`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 混入なし。
- `アクテビティ`: ○ 混入なし。
- `クリティカル・パス` / `クリティカル・チェーン`: ○ 表記を確認。
- `コンティンジェンシー`: ○ 表記を確認。
- `ローリング・ウェーブ`: ○ 表記を確認。
- `アーンド・バリュー` / `EVM` / `EVA`: ○ 表記を確認。
- `ベースライン`: ○ 表記を確認。
- `TODO` / `??`: ○ 混入なし。
- 略語: ○ `NPV`, `ROI`, `IRR`, `RBS`, `WBS`, `CPM`, `CCM`, `PDM`, `AOA`, `AON`, `FS/FF/SS/SF` の表記を確認。

### ノート整合性
- pm-pl-011: ○ WBS 100% ルールの定義は NoteDetail §7 と一致。
- pm-pl-016 / 017: ○ PDM 4依存関係と FS の定義は NoteDetail §17 と一致。
- pm-pl-018: ○ リード / ラグの区別は NoteDetail §17 と一致。
- pm-pl-019: ○ AON / AOA の違いは NoteDetail §18 と一致。
- pm-pl-021: ○ PERT 期待値 `(O + 4M + P) / 6` は NoteDetail §19 と一致。
- pm-pl-023: ○ フリー・フロートの定義は NoteDetail §20 と一致。
- pm-pl-025〜027: ○ クラッシング = コスト増、ファストトラッキング = リスク増の整理は NoteDetail §22 と一致。
- pm-pl-035 / 036: ○ コンティンジェンシー予備 / マネジメント予備の区別は NoteDetail §29 と一致。
- pm-pl-038〜041: ○ NPV / ROI / IRR / Payback の定義は NoteDetail §31 と一致。
- pm-pl-043: ○ RBS / WBS / OBS / PBS の使い分けは NoteDetail §32 と一致。
- pm-pl-050: ○ CCM のバッファ概念は NoteDetail §16 と一致。設問の「合流バッファ」はノートの「フィーディングバッファ」に相当する語として妥当。

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
- `src/data/questions/planning.ts:128`: 選択肢 `責任分担マトリックス` を、ノート側の表記に合わせて `責任分担マトリクス` に修正。

## 次のタスクへの教訓
- planning は計算式・略語・日英併記が多いため、AST 構造検査に加えてノート側の代表セクションを照合すると誤検出と見落としの両方を減らせる。
- 類似カテゴリで先に統一済みの用語（例: `マトリクス`）は、カテゴリ横断で検索すると小さな表記揺れを拾いやすい。
