# レビュー: F2-P2 development-approach クイズ50問 構造レビュー

> レビュー日時: 2026-05-20
> レビュー対象commit: 424992b
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/development-approach.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・ノート照合の観点で致命問題なし。`{{blank}}` 前後スペースの軽微な表記不整合 5 件を同ファイル内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_development-approach_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/development-approach.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `development-approach`。
- import / spread: ○ `src/data/questions/index.ts` で `developmentApproachQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'development-approach'`, `name: '開発アプローチ'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-da-001` 〜 `pm-da-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-da-\d{3}$` に準拠。

### 型・選択肢
- `questionText`: ○ 全件 `{{blank}}` が1個。
- `correctAnswer`: ○ 全件非空。
- `choices`: ○ 全件4択。
- 正解含有: ○ 全件 `choices` に `correctAnswer` を含む。
- 重複選択肢: ○ 全件なし。
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
- 対象id: ○ `pm-da-004, 011, 014, 023, 030, 031, 032, 035, 038, 040, 046`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後 0件。
- `ウォータフォール`: ○ 混入なし。
- `マニュフェスト`: ○ 混入なし。
- `プロダクト・オーナー`: ○ 混入なし。
- `スクラム・マスター`: ○ 混入なし。
- `TODO` / `??`: ○ 混入なし。
- 英語表記: ○ `Agile Practice Guide`, `Agile Alliance`, `Agile Manifesto`, `Scrum Guide`, `Scrum@Scale` 等の正式名・出典名としての英語混在のみ確認。

### ノート整合性
- pm-da-013: ○ ウォーターフォール = Royce / 1970 と NoteDetail §7 が一致。
- pm-da-015: ○ V字モデルの工程対応（要件定義 ↔ システムテスト等）と NoteDetail §8 が一致。
- pm-da-021: ○ アジャイルマニフェスト = 2001年 Snowbird と NoteDetail §11 が一致。
- pm-da-023 / 024 / 025: ○ アジャイル宣言 4価値・左辺にも価値がある点・12原則数と NoteDetail §12 が一致。
- pm-da-031: ○ スクラム経験主義 3本柱 = 透明性・検査・適応 と NoteDetail §17 が一致。
- pm-da-032: ○ スクラム 3役割 = PO / SM / Developers と NoteDetail §18 が一致。
- pm-da-035 / 037: ○ スクラム 5イベント、スプリント最大1か月と NoteDetail §19 / §32 が一致。
- pm-da-038: ○ スクラム 3成果物 = PB / SB / Increment と NoteDetail §20 が一致。
- pm-da-040: ○ INVEST 6要素と NoteDetail §21 が一致。
- pm-da-046: ○ XP 5価値の英語概念 Respect と NoteDetail §24 が一致。日本語訳は設問側 `尊重（Respect）`、ノート側 `尊敬` だが、英語概念は一致し、選択肢にも英語併記があるため構造レビュー上は修正対象外。

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
- `src/data/questions/development-approach.ts:136`: `ウォーターフォールモデルは {{blank}} 年` を `ウォーターフォールモデルは{{blank}}年` に修正。
- `src/data/questions/development-approach.ts:145`: `実装 → {{blank}} → 運用・保守` を `実装 →{{blank}}→ 運用・保守` に修正。
- `src/data/questions/development-approach.ts:213`: `アジャイルマニフェストは {{blank}} 年` を `アジャイルマニフェストは{{blank}}年` に修正。
- `src/data/questions/development-approach.ts:400`: `Small・{{blank}} である` を `Small・{{blank}}である` に修正。
- `src/data/questions/development-approach.ts:469`: `Nexus・{{blank}} など` を `Nexus・{{blank}}など` に修正。

## 次のタスクへの教訓
- クイズ構造レビューでは `validate-data` に加えて、ASTベースで `{{blank}}` 数・選択肢重複・difficulty分布・`excludeFromWritten` 設計との差分を確認すると検出漏れが減る。
- `{{blank}}` 周辺スペースは UI 表示に出やすいため、カテゴリ投入直後に固定文字列検索で確認する。
